-- ============================================================
-- RLS & Security Hardening
-- Fixes critical vulnerabilities in the data access layer
-- ============================================================


-- ── 1. PROFILES: Column-level protection on sensitive fields ──────────────────
-- Prevent authenticated users from directly updating balance, role, or is_admin.
-- These must only change via SECURITY DEFINER RPCs or the service_role key.

REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (username, avatar_url, region, last_seen_at) ON public.profiles TO authenticated;


-- ── 2. DEPOSIT_FUNDS: Prevent cross-user deposits ────────────────────────────
-- Any authenticated user could previously call deposit_funds with another
-- user's UUID and an arbitrary amount, bypassing Paystack verification entirely.
-- Fix: authenticated callers can only deposit to their own account.
-- Service-role (Paystack webhook) calls pass through freely (auth.uid() = NULL).

CREATE OR REPLACE FUNCTION public.deposit_funds(
    p_user_id UUID,
    p_amount NUMERIC(10, 2),
    p_reference_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_caller_role public.user_role;
BEGIN
    -- If auth.uid() is set, caller is an authenticated user (not service_role).
    -- They may only deposit to their own account unless they are admin.
    IF auth.uid() IS NOT NULL AND auth.uid() != p_user_id THEN
        SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid();
        IF v_caller_role != 'admin' THEN
            RAISE EXCEPTION 'Unauthorized: cannot deposit to another user''s account.';
        END IF;
    END IF;

    -- Idempotency: reject duplicate references
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

-- Revoke anon access to all financial RPCs
REVOKE EXECUTE ON FUNCTION public.deposit_funds(UUID, NUMERIC, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_challenge_with_escrow(TEXT, TEXT, NUMERIC, NUMERIC) FROM anon;
REVOKE EXECUTE ON FUNCTION public.join_challenge_with_escrow(UUID) FROM anon;
REVOKE EXECUTE ON FUNCTION public.submit_match_report(UUID, match_outcome, TEXT[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.moderator_resolve_match(UUID, UUID, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION public.resolve_dispute(UUID, UUID) FROM anon;


-- ── 3. CHALLENGES: Tighten the host UPDATE policy ────────────────────────────
-- Old policy had no WITH CHECK, so a host of an open challenge could UPDATE
-- any column (entry_fee, prize_pool, etc.) or set status to anything.
-- Fix: host can only cancel (status → 'cancelled'), nothing else.

DROP POLICY IF EXISTS "Hosts can cancel open challenges." ON public.challenges;

CREATE POLICY "Hosts can cancel open challenges."
    ON public.challenges FOR UPDATE
    USING  (auth.uid() = host_id AND status = 'open')
    WITH CHECK (auth.uid() = host_id AND status = 'cancelled');


-- ── 4. MATCH_REPORTS: Let admins/moderators read all reports ─────────────────
-- Admins and moderators need to see proof screenshots when resolving disputes,
-- but there was no SELECT policy granting them access.

CREATE POLICY "Admins and moderators can view all reports"
    ON public.match_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
              AND role IN ('admin', 'moderator')
        )
    );


-- ── 5. RESOLVE_DISPUTE: Use role column (not deprecated is_admin) ─────────────
-- The original function checked the deprecated `is_admin` boolean. Migrate to
-- the canonical `role` enum added in the roles migration.

CREATE OR REPLACE FUNCTION public.resolve_dispute(
    p_challenge_id UUID,
    p_winner_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_id UUID;
    v_role public.user_role;
    v_status challenge_status;
    v_prize_pool NUMERIC(10, 2);
    v_rake_amount NUMERIC(10, 2);
    v_payout_amount NUMERIC(10, 2);
BEGIN
    v_admin_id := auth.uid();

    SELECT role INTO v_role FROM public.profiles WHERE id = v_admin_id;
    IF v_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized: requires administrator privileges.';
    END IF;

    SELECT status, prize_pool
    INTO v_status, v_prize_pool
    FROM public.challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'disputed' THEN
        RAISE EXCEPTION 'Only disputed challenges can be resolved by an admin.';
    END IF;

    v_rake_amount   := v_prize_pool * 0.15;
    v_payout_amount := v_prize_pool - v_rake_amount;

    UPDATE public.challenges
    SET status = 'resolved', winner_id = p_winner_id, resolved_at = NOW()
    WHERE id = p_challenge_id;

    PERFORM balance FROM public.profiles WHERE id = p_winner_id FOR UPDATE;

    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + v_payout_amount
    WHERE id = p_winner_id;

    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (p_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);

    RETURN TRUE;
END;
$$;


-- ── 6. NEWSLETTER: Allow subscribers to unsubscribe themselves ───────────────
CREATE POLICY "Users can unsubscribe their own email"
    ON public.newsletter_subscribers FOR DELETE
    USING (email = current_setting('request.jwt.claims', true)::json->>'email');
