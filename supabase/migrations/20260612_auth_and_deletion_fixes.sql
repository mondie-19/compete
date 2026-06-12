-- ============================================================
-- Auth & Deletion Fixes
-- 1. handle_new_user: deduplicate usernames on collision
-- 2. challenges FK: allow cascade/nullify when a user is deleted
-- 3. ensure submit_match_report RPC exists (in case earlier migrations weren't applied)
-- ============================================================


-- ── 1. handle_new_user: collision-safe username ───────────────────────────────
-- If the derived username is already taken, append a short random suffix.
-- This prevents the trigger from aborting the entire signup transaction.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_username  TEXT;
    v_base      TEXT;
    v_suffix    INT := 0;
    v_candidate TEXT;
BEGIN
    v_base := COALESCE(
        new.raw_user_meta_data->>'username',
        REPLACE(new.raw_user_meta_data->>'full_name', ' ', '_'),
        REPLACE(new.raw_user_meta_data->>'name', ' ', '_'),
        split_part(new.email, '@', 1)
    );

    IF v_base IS NULL OR v_base = '' THEN
        v_base := 'competitor_' || substr(md5(random()::text), 1, 6);
    END IF;

    -- Sanitize: keep only letters, numbers, underscores, dots, hyphens
    v_base := regexp_replace(v_base, '[^a-zA-Z0-9_.\-]', '', 'g');
    IF v_base = '' THEN
        v_base := 'competitor';
    END IF;

    -- Try v_base first, then v_base_2, v_base_3 … until unique
    v_candidate := v_base;
    LOOP
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = v_candidate) THEN
            v_username := v_candidate;
            EXIT;
        END IF;
        v_suffix    := v_suffix + 1;
        v_candidate := v_base || '_' || v_suffix::TEXT;
    END LOOP;

    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (new.id, v_username, new.raw_user_meta_data->>'avatar_url');

    RETURN new;
END;
$$;


-- ── 2. challenges FK: safe user deletion ─────────────────────────────────────
-- Default FK behaviour is RESTRICT, which prevents deleting a profile that has
-- challenges. Fix: cascade-delete challenges where the deleted user is the host;
-- null out opponent_id for challenges where they were the opponent.
-- We drop and re-add the constraints rather than ALTER (more portable).

DO $$ BEGIN
    -- host_id: ON DELETE CASCADE (host's challenges are deleted with the account)
    ALTER TABLE public.challenges
        DROP CONSTRAINT IF EXISTS challenges_host_id_fkey;
    ALTER TABLE public.challenges
        ADD CONSTRAINT challenges_host_id_fkey
        FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- opponent_id: ON DELETE SET NULL (challenge remains, opponent slot cleared)
    ALTER TABLE public.challenges
        DROP CONSTRAINT IF EXISTS challenges_opponent_id_fkey;
    ALTER TABLE public.challenges
        ALTER COLUMN opponent_id DROP NOT NULL;
    ALTER TABLE public.challenges
        ADD CONSTRAINT challenges_opponent_id_fkey
        FOREIGN KEY (opponent_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

    -- winner_id: ON DELETE SET NULL (resolved result stays, winner ref cleared)
    ALTER TABLE public.challenges
        DROP CONSTRAINT IF EXISTS challenges_winner_id_fkey;
    ALTER TABLE public.challenges
        ADD CONSTRAINT challenges_winner_id_fkey
        FOREIGN KEY (winner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'FK update skipped: %', SQLERRM;
END $$;


-- ── 3. match_reports FK: safe deletion ───────────────────────────────────────
DO $$ BEGIN
    ALTER TABLE public.match_reports
        DROP CONSTRAINT IF EXISTS match_reports_reporter_id_fkey;
    ALTER TABLE public.match_reports
        ADD CONSTRAINT match_reports_reporter_id_fkey
        FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.match_messages
        DROP CONSTRAINT IF EXISTS match_messages_user_id_fkey;
    ALTER TABLE public.match_messages
        ADD CONSTRAINT match_messages_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR OTHERS THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE public.transactions
        DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
    ALTER TABLE public.transactions
        ADD CONSTRAINT transactions_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN undefined_table OR OTHERS THEN NULL; END $$;


-- ── 4. submit_match_report: ensure RPC exists ────────────────────────────────
-- Safe CREATE OR REPLACE so prior migrations don't need to have been applied.
-- Uses TEXT casts to avoid dependency on pending enum types.

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public' AND p.proname = 'submit_match_report'
    ) THEN
        EXECUTE $func$
            CREATE OR REPLACE FUNCTION public.submit_match_report(
                p_challenge_id UUID,
                p_outcome      TEXT,
                p_proof_urls   TEXT[] DEFAULT '{}'::TEXT[]
            )
            RETURNS BOOLEAN
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $inner$
            DECLARE
                v_user_id          UUID;
                v_opponent_outcome TEXT;
                v_host_id          UUID;
                v_opp_id           UUID;
                v_status           TEXT;
                v_prize_pool       NUMERIC(10, 2);
                v_payout_amount    NUMERIC(10, 2);
                v_winner_id        UUID;
            BEGIN
                v_user_id := auth.uid();
                IF v_user_id IS NULL THEN
                    RAISE EXCEPTION 'Authentication required.';
                END IF;

                IF array_length(p_proof_urls, 1) IS NULL OR array_length(p_proof_urls, 1) < 3 THEN
                    RAISE EXCEPTION 'You must upload at least 3 screenshots.';
                END IF;

                SELECT host_id, opponent_id, status::TEXT, prize_pool
                INTO v_host_id, v_opp_id, v_status, v_prize_pool
                FROM public.challenges
                WHERE id = p_challenge_id FOR UPDATE;

                IF v_status NOT IN ('in_progress', 'pending_review') THEN
                    RAISE EXCEPTION 'Challenge is not active or already finalized.';
                END IF;

                IF v_user_id != v_host_id AND v_user_id != v_opp_id THEN
                    RAISE EXCEPTION 'You are not a participant in this challenge.';
                END IF;

                IF p_outcome NOT IN ('win', 'loss', 'cancel') THEN
                    RAISE EXCEPTION 'Invalid outcome value.';
                END IF;

                INSERT INTO public.match_reports (challenge_id, reporter_id, reported_outcome, proof_image_urls)
                VALUES (p_challenge_id, v_user_id, p_outcome::match_outcome, p_proof_urls)
                ON CONFLICT (challenge_id, reporter_id)
                DO UPDATE SET
                    reported_outcome = EXCLUDED.reported_outcome,
                    proof_image_urls = EXCLUDED.proof_image_urls,
                    created_at       = NOW();

                SELECT reported_outcome::TEXT INTO v_opponent_outcome
                FROM public.match_reports
                WHERE challenge_id = p_challenge_id AND reporter_id != v_user_id;

                IF v_opponent_outcome IS NULL THEN
                    UPDATE public.challenges SET status = 'pending_review' WHERE id = p_challenge_id;
                    RETURN TRUE;
                END IF;

                IF p_outcome = v_opponent_outcome THEN
                    UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
                    RETURN TRUE;
                END IF;

                IF p_outcome = 'win' THEN
                    v_winner_id := v_user_id;
                ELSIF v_opponent_outcome = 'win' THEN
                    v_winner_id := CASE WHEN v_user_id = v_host_id THEN v_opp_id ELSE v_host_id END;
                ELSE
                    UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
                    RETURN TRUE;
                END IF;

                v_payout_amount := v_prize_pool * 0.85;

                UPDATE public.challenges
                SET status = 'pending_review', winner_id = v_winner_id
                WHERE id = p_challenge_id;

                RETURN TRUE;
            END;
            $inner$
        $func$;
    END IF;
END $$;


-- ── 5. Reload schema cache ────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
