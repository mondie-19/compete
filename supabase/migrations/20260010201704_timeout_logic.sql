-- RPC to resolve a match where one player has failed to report within the timeframe
CREATE OR REPLACE FUNCTION public.resolve_ghosted_match(
    p_challenge_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_report_count INT;
    v_first_report_time TIMESTAMP WITH TIME ZONE;
    v_reporter_id UUID;
    v_reported_outcome match_outcome;
    v_host_id UUID;
    v_opp_id UUID;
    v_status challenge_status;
    v_prize_pool NUMERIC(10, 2);
    v_rake_amount NUMERIC(10, 2);
    v_payout_amount NUMERIC(10, 2);
    v_winner_id UUID;
BEGIN
    -- 1. Get challenge details and lock
    SELECT host_id, opponent_id, status, prize_pool 
    INTO v_host_id, v_opp_id, v_status, v_prize_pool
    FROM public.challenges
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'in_progress' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Challenge is not in progress.');
    END IF;

    -- 2. Check match_reports
    SELECT count(*), min(created_at) INTO v_report_count, v_first_report_time
    FROM public.match_reports
    WHERE challenge_id = p_challenge_id;

    IF v_report_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No reports submitted yet.');
    END IF;

    IF v_report_count > 1 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Match has multiple reports and requires consensus or admin review.');
    END IF;

    -- 3. Check for timeout (60 minutes)
    IF v_first_report_time > (NOW() - INTERVAL '60 minutes') THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Timeout threshold not reached. Please wait ' || 
                     ceil(extract(epoch from (v_first_report_time + INTERVAL '60 minutes' - NOW())) / 60) || 
                     ' more minutes.'
        );
    END IF;

    -- 4. Get the single report details
    SELECT reporter_id, reported_outcome INTO v_reporter_id, v_reported_outcome
    FROM public.match_reports
    WHERE challenge_id = p_challenge_id;

    -- We only auto-resolve if the reporter claimed a WIN. 
    -- If they claimed a LOSS or CANCEL, we can't safely assume the other person won without their confirmation yet,
    -- but usually, ghosting happens when the loser doesn't want to report.
    IF v_reported_outcome != 'win' THEN
         RETURN jsonb_build_object('success', false, 'error', 'Cannot auto-resolve for non-winning claims. Contact support.');
    END IF;

    v_winner_id := v_reporter_id;

    -- 5. Execute Payout (15% Rake, 85% to winner)
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
    
    RETURN jsonb_build_object('success', true, 'winner_id', v_winner_id);
END;
$$;
