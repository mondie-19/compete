-- 1. Add missing admin column to Profiles
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_admin') THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Modify Match Reports to handle an Array of images (since we need >= 3)
-- Drop the old column and add the new one holding an array of URLs
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='proof_image_url') THEN
        ALTER TABLE public.match_reports DROP COLUMN proof_image_url;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='match_reports' AND column_name='proof_image_urls') THEN
        ALTER TABLE public.match_reports ADD COLUMN proof_image_urls TEXT[] DEFAULT '{}'::TEXT[];
    END IF;
END $$;


-- 3. Replace the submit_match_report function to handle the array and validation
CREATE OR REPLACE FUNCTION public.submit_match_report(
    p_challenge_id UUID,
    p_outcome match_outcome,
    p_proof_urls TEXT[] DEFAULT '{}'::TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_opponent_outcome match_outcome;
    v_host_id UUID;
    v_opp_id UUID;
    v_status challenge_status;
    v_prize_pool NUMERIC(10, 2);
    v_rake_amount NUMERIC(10, 2);
    v_payout_amount NUMERIC(10, 2);
    v_winner_id UUID;
BEGIN
    v_user_id := auth.uid();

    -- REQUIREMENT: At least 3 proof images must be uploaded
    IF array_length(p_proof_urls, 1) IS NULL OR array_length(p_proof_urls, 1) < 3 THEN
        RAISE EXCEPTION 'You must upload at least 3 screenshots showing the match results and opponent name.';
    END IF;

    -- Validate Challenge State and lock it
    SELECT host_id, opponent_id, status, prize_pool 
    INTO v_host_id, v_opp_id, v_status, v_prize_pool
    FROM public.challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'in_progress' THEN
        RAISE EXCEPTION 'Challenge is not active or already finalized.';
    END IF;

    IF v_user_id != v_host_id AND v_user_id != v_opp_id THEN
        RAISE EXCEPTION 'You are not a participant in this challenge.';
    END IF;

    -- Insert the report
    INSERT INTO public.match_reports (challenge_id, reporter_id, reported_outcome, proof_image_urls)
    VALUES (p_challenge_id, v_user_id, p_outcome, p_proof_urls);

    -- Check if the opponent has already reported
    SELECT reported_outcome INTO v_opponent_outcome
    FROM public.match_reports
    WHERE challenge_id = p_challenge_id AND reporter_id != v_user_id;

    -- If opponent hasn't reported yet, we're done for now.
    IF v_opponent_outcome IS NULL THEN
        RETURN TRUE;
    END IF;

    -- Opponent HAS reported. Evaluate the consensus.
    IF p_outcome = v_opponent_outcome THEN
        -- Both said they won (or lost). Dispute!
        UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
        RETURN TRUE;
    END IF;

    -- Scenario B: Agreement (One Win, One Loss)
    IF p_outcome = 'win' THEN
        v_winner_id := v_user_id;
    ELSIF v_opponent_outcome = 'win' THEN
        v_winner_id := CASE WHEN v_user_id = v_host_id THEN v_opp_id ELSE v_host_id END;
    ELSE
         -- Both reported Cancel/Loss logically shouldn't happen, but fallback to dispute:
        UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
        RETURN TRUE;
    END IF;

    -- Execute Payout (15% Rake, 85% to winner)
    v_rake_amount := v_prize_pool * 0.15;
    v_payout_amount := v_prize_pool - v_rake_amount;

    -- Update Challenge
    UPDATE public.challenges
    SET status = 'resolved', winner_id = v_winner_id, resolved_at = NOW()
    WHERE id = p_challenge_id;

    -- Payout the Winner
    PERFORM balance FROM public.profiles WHERE id = v_winner_id FOR UPDATE;

    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + v_payout_amount
    WHERE id = v_winner_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (v_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);
    
    RETURN TRUE;
END;
$$;


-- 4. Admin Resolution RPC
-- Only admins can call this function to forcefully resolve a disputed match
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
    v_is_admin BOOLEAN;
    v_status challenge_status;
    v_prize_pool NUMERIC(10, 2);
    v_rake_amount NUMERIC(10, 2);
    v_payout_amount NUMERIC(10, 2);
BEGIN
    v_admin_id := auth.uid();
    
    -- Verify Caller is an Admin
    SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = v_admin_id;
    IF v_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Unauthorized: Requires Administrator privileges.';
    END IF;

    -- Validate Challenge State and lock it
    SELECT status, prize_pool 
    INTO v_status, v_prize_pool
    FROM public.challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'disputed' THEN
        RAISE EXCEPTION 'Only disputed challenges can be resolved by an admin.';
    END IF;

    -- Execute Payout (15% Rake, 85% to winner)
    v_rake_amount := v_prize_pool * 0.15;
    v_payout_amount := v_prize_pool - v_rake_amount;

    -- Update Challenge
    UPDATE public.challenges
    SET status = 'resolved', winner_id = p_winner_id, resolved_at = NOW()
    WHERE id = p_challenge_id;

    -- Payout the Winner
    PERFORM balance FROM public.profiles WHERE id = p_winner_id FOR UPDATE;

    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + v_payout_amount
    WHERE id = p_winner_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (p_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);
    
    RETURN TRUE;
END;
$$;
