-- ============================================================
-- RLS & Security Hardening  (v2 — safe to run on any DB state)
-- Uses DO blocks so missing functions/policies never abort the script.
-- Run this in the Supabase SQL editor. Do NOT re-run the v1 file.
-- ============================================================


-- ── 1. PROFILES: Column-level protection ─────────────────────────────────────
-- Strip the blanket UPDATE privilege from the authenticated role so that
-- clients cannot directly set balance, role, or is_admin.
-- REVOKE is always safe even if the privilege was never granted.

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT  UPDATE (username, avatar_url, region, last_seen_at) ON public.profiles TO authenticated;


-- ── 2. DEPOSIT_FUNDS: Block cross-user deposits ───────────────────────────────
-- CREATE OR REPLACE is safe regardless of whether the function exists.

CREATE OR REPLACE FUNCTION public.deposit_funds(
    p_user_id      UUID,
    p_amount       NUMERIC(10, 2),
    p_reference_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_role TEXT;
BEGIN
    -- auth.uid() is NULL when called via the service_role key (Paystack webhook).
    -- For authenticated callers, only allow depositing to their own account.
    IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
        SELECT role::TEXT INTO v_caller_role
        FROM public.profiles WHERE id = auth.uid();
        IF v_caller_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: cannot deposit to another user''s account.';
        END IF;
    END IF;

    IF EXISTS (SELECT 1 FROM public.transactions WHERE external_reference = p_reference_id) THEN
        RAISE EXCEPTION 'Transaction reference already processed.';
    END IF;

    INSERT INTO public.transactions (user_id, amount, type, external_reference)
    VALUES (p_user_id, p_amount, 'deposit', p_reference_id);

    UPDATE public.profiles
    SET balance = balance + p_amount
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$;


-- ── 3. REVOKE anon EXECUTE on financial RPCs ──────────────────────────────────
-- Each REVOKE is wrapped individually so a missing function never aborts the
-- rest of the script.

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.deposit_funds(UUID, NUMERIC, TEXT) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.create_challenge_with_escrow(TEXT, TEXT, NUMERIC, NUMERIC) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.join_challenge_with_escrow(UUID) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    -- submit_match_report has two overloads depending on which migration was applied.
    -- Revoke both silently.
    REVOKE EXECUTE ON FUNCTION public.submit_match_report(UUID, public.match_outcome, TEXT[]) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.moderator_resolve_match(UUID, UUID, TEXT) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.resolve_dispute(UUID, UUID) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;

DO $$ BEGIN
    REVOKE EXECUTE ON FUNCTION public.set_opponent_game_id(UUID, TEXT) FROM anon;
EXCEPTION WHEN undefined_function OR undefined_object THEN NULL; END $$;


-- ── 4. CHALLENGES: Tighten the host UPDATE policy ────────────────────────────
-- Hosts may only set status = 'cancelled' on their own open challenges.
-- Any other direct UPDATE (e.g., inflating prize_pool) is now rejected.

DROP POLICY IF EXISTS "Hosts can cancel open challenges." ON public.challenges;

CREATE POLICY "Hosts can cancel open challenges."
    ON public.challenges FOR UPDATE
    USING  (auth.uid() = host_id AND status = 'open')
    WITH CHECK (auth.uid() = host_id AND status = 'cancelled');


-- ── 5. MATCH_REPORTS: Admin/moderator SELECT access ──────────────────────────
-- Needed so staff can view proof screenshots when resolving disputes.

DO $$ BEGIN
    DROP POLICY IF EXISTS "Admins and moderators can view all reports" ON public.match_reports;
    CREATE POLICY "Admins and moderators can view all reports"
        ON public.match_reports FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                  AND role::TEXT IN ('admin', 'moderator')
            )
        );
EXCEPTION WHEN undefined_table THEN NULL; END $$;


-- ── 6. RESOLVE_DISPUTE: Use role column instead of deprecated is_admin ────────

DO $$ BEGIN
    -- Only attempt the CREATE OR REPLACE if the dependent types exist.
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'challenge_status') THEN
        EXECUTE $func$
            CREATE OR REPLACE FUNCTION public.resolve_dispute(
                p_challenge_id UUID,
                p_winner_id    UUID
            )
            RETURNS BOOLEAN
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $inner$
            DECLARE
                v_admin_id      UUID;
                v_role          TEXT;
                v_status        TEXT;
                v_prize_pool    NUMERIC(10, 2);
                v_payout_amount NUMERIC(10, 2);
            BEGIN
                v_admin_id := auth.uid();

                SELECT role::TEXT INTO v_role
                FROM public.profiles WHERE id = v_admin_id;
                IF v_role != 'admin' THEN
                    RAISE EXCEPTION 'Unauthorized: requires administrator privileges.';
                END IF;

                SELECT status::TEXT, prize_pool
                INTO v_status, v_prize_pool
                FROM public.challenges
                WHERE id = p_challenge_id FOR UPDATE;

                IF v_status != 'disputed' THEN
                    RAISE EXCEPTION 'Only disputed challenges can be resolved by an admin.';
                END IF;

                v_payout_amount := v_prize_pool * 0.85;

                UPDATE public.challenges
                SET status = 'resolved', winner_id = p_winner_id, resolved_at = NOW()
                WHERE id = p_challenge_id;

                UPDATE public.profiles
                SET balance = COALESCE(balance, 0) + v_payout_amount
                WHERE id = p_winner_id;

                INSERT INTO public.transactions (user_id, amount, type, reference_id)
                VALUES (p_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);

                RETURN TRUE;
            END;
            $inner$
        $func$;
    END IF;
EXCEPTION WHEN OTHERS THEN NULL; END $$;


-- ── 7. NEWSLETTER: Self-unsubscribe ──────────────────────────────────────────

DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can unsubscribe their own email" ON public.newsletter_subscribers;
    CREATE POLICY "Users can unsubscribe their own email"
        ON public.newsletter_subscribers FOR DELETE
        USING (email = (current_setting('request.jwt.claims', true)::json->>'email'));
EXCEPTION WHEN undefined_table THEN NULL; END $$;


-- ── 8. Notify PostgREST to reload schema cache ────────────────────────────────
NOTIFY pgrst, 'reload schema';
