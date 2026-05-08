-- 1. Add 'pending_review' to challenge_status enum
-- Since PostgreSQL doesn't allow dropping/editing enum values easily in a single migration if they are in use, 
-- we use the ALTER TYPE ADD VALUE command.
ALTER TYPE challenge_status ADD VALUE IF NOT EXISTS 'pending_review' AFTER 'in_progress';

-- 2. Update submit_match_report to set status to 'pending_review'
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

    IF v_status != 'in_progress' AND v_status != 'pending_review' THEN
        RAISE EXCEPTION 'Challenge is not active or already finalized.';
    END IF;

    IF v_user_id != v_host_id AND v_user_id != v_opp_id THEN
        RAISE EXCEPTION 'You are not a participant in this challenge.';
    END IF;

    -- Insert the report (upsert if they already reported)
    INSERT INTO public.match_reports (challenge_id, reporter_id, reported_outcome, proof_image_urls)
    VALUES (p_challenge_id, v_user_id, p_outcome, p_proof_urls)
    ON CONFLICT (challenge_id, reporter_id) 
    DO UPDATE SET 
        reported_outcome = EXCLUDED.reported_outcome,
        proof_image_urls = EXCLUDED.proof_image_urls,
        created_at = NOW();

    -- Check if the opponent has already reported
    SELECT reported_outcome INTO v_opponent_outcome
    FROM public.match_reports
    WHERE challenge_id = p_challenge_id AND reporter_id != v_user_id;

    -- If opponent hasn't reported yet, we set status to pending_review if it wasn't already
    IF v_opponent_outcome IS NULL THEN
        UPDATE public.challenges SET status = 'pending_review' WHERE id = p_challenge_id;
        RETURN TRUE;
    END IF;

    -- Both have reported. 
    -- If they agree, still set to 'pending_review' for moderator check as requested
    -- If they disagree, set to 'disputed'
    IF p_outcome = v_opponent_outcome THEN
        UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
    ELSE
        UPDATE public.challenges SET status = 'pending_review' WHERE id = p_challenge_id;
    END IF;

    RETURN TRUE;
END;
$$;

-- 3. Create Moderator Match Resolution Function
-- This handles both pending_review and disputed matches
CREATE OR REPLACE FUNCTION public.moderator_resolve_match(
    p_challenge_id UUID,
    p_winner_id UUID, -- NULL if refund/cancel
    p_action TEXT -- 'resolve' or 'cancel'
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
    v_host_id UUID;
    v_opp_id UUID;
    v_entry_fee NUMERIC(10, 2);
BEGIN
    v_admin_id := auth.uid();
    
    -- Verify Caller is an Admin/Moderator
    SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = v_admin_id;
    IF v_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'Unauthorized: Requires Moderator privileges.';
    END IF;

    -- Validate Challenge State and lock it
    SELECT status, prize_pool, host_id, opponent_id, entry_fee 
    INTO v_status, v_prize_pool, v_host_id, v_opp_id, v_entry_fee
    FROM public.challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'pending_review' AND v_status != 'disputed' THEN
        RAISE EXCEPTION 'Match is not in a modifiable state.';
    END IF;

    IF p_action = 'resolve' AND p_winner_id IS NOT NULL THEN
        -- Execute Payout (15% Rake, 85% to winner)
        v_rake_amount := v_prize_pool * 0.15;
        v_payout_amount := v_prize_pool - v_rake_amount;

        -- Update Challenge
        UPDATE public.challenges
        SET status = 'resolved', winner_id = p_winner_id, resolved_at = NOW()
        WHERE id = p_challenge_id;

        -- Payout the Winner
        UPDATE public.profiles
        SET balance = COALESCE(balance, 0) + v_payout_amount
        WHERE id = p_winner_id;

        -- Log transaction
        INSERT INTO public.transactions (user_id, amount, type, reference_id)
        VALUES (p_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);
        
    ELSIF p_action = 'cancel' THEN
        -- Refund both players
        UPDATE public.profiles SET balance = balance + v_entry_fee WHERE id = v_host_id;
        UPDATE public.profiles SET balance = balance + v_entry_fee WHERE id = v_opp_id;

        -- Log transactions
        INSERT INTO public.transactions (user_id, amount, type, reference_id)
        VALUES (v_host_id, v_entry_fee, 'refund', p_challenge_id);
        INSERT INTO public.transactions (user_id, amount, type, reference_id)
        VALUES (v_opp_id, v_entry_fee, 'refund', p_challenge_id);

        -- Update Challenge
        UPDATE public.challenges
        SET status = 'cancelled', resolved_at = NOW()
        WHERE id = p_challenge_id;
    END IF;
    
    RETURN TRUE;
END;
$$;
