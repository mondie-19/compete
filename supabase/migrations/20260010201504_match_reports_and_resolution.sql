-- 1. Match Reports Table
CREATE TYPE match_outcome AS ENUM ('win', 'loss', 'cancel');

CREATE TABLE IF NOT EXISTS public.match_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) NOT NULL,
    reporter_id UUID REFERENCES public.profiles(id) NOT NULL,
    reported_outcome match_outcome NOT NULL,
    proof_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Ensure a user can only report once per challenge
    UNIQUE(challenge_id, reporter_id)
);

-- Enable RLS for Reports
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see reports for challenges they are a part of (host or opponent)
CREATE POLICY "Users can view reports for their challenges"
    ON public.match_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.challenges c
            WHERE c.id = match_reports.challenge_id
            AND (c.host_id = auth.uid() OR c.opponent_id = auth.uid())
        )
    );

-- RLS: Users can only submit a report for themselves on a challenge they are a part of
CREATE POLICY "Users can insert their own reports for their challenges"
    ON public.match_reports FOR INSERT
    WITH CHECK (
        auth.uid() = reporter_id AND
        EXISTS (
            SELECT 1 FROM public.challenges c
            WHERE c.id = challenge_id
            AND (c.host_id = auth.uid() OR c.opponent_id = auth.uid())
            AND c.status = 'in_progress'
        )
    );


-- 2. Storage Setup for Proof Images (Assuming Storage Plugin is active)
-- In Supabase dashboard, a user must have the bucket 'match-proofs' created.
-- We can add the policies here assuming it exists.

-- Note: The raw SQL for storage buckets depends on the schema `storage`.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-proofs', 'match-proofs', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view proof images"
    ON storage.objects FOR SELECT
    USING ( bucket_id = 'match-proofs' );

CREATE POLICY "Authenticated users can upload proof images"
    ON storage.objects FOR INSERT
    WITH CHECK ( bucket_id = 'match-proofs' AND auth.role() = 'authenticated' );


-- 3. Match Resolution RPC
-- Call this when a user submits a report. It will check if BOTH users have reported.
-- If they agree, it auto-resolves and pays out (less 15% rake).
-- If they disagree, it marks as disputed.

CREATE OR REPLACE FUNCTION public.submit_match_report(
    p_challenge_id UUID,
    p_outcome match_outcome,
    p_proof_url TEXT DEFAULT NULL
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

    -- 1. Validate Challenge State and lock it
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

    -- 2. Insert the report
    INSERT INTO public.match_reports (challenge_id, reporter_id, reported_outcome, proof_image_url)
    VALUES (p_challenge_id, v_user_id, p_outcome, p_proof_url);

    -- 3. Check if the opponent has already reported
    SELECT reported_outcome INTO v_opponent_outcome
    FROM public.match_reports
    WHERE challenge_id = p_challenge_id AND reporter_id != v_user_id;

    -- If opponent hasn't reported yet, we're done for now.
    IF v_opponent_outcome IS NULL THEN
        RETURN TRUE;
    END IF;

    -- 4. Opponent HAS reported. Evaluate the consensus.
    -- Scenario A: Disagreement (Both reported win, both reported loss, etc.)
    -- Except: if one reported win and the other loss, that's agreement.
    IF p_outcome = v_opponent_outcome THEN
        -- Both said they won. Dispute!
        UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
        RETURN TRUE;
    END IF;

    -- Scenario B: Agreement (One Win, One Loss)
    -- Determine who won based on who reported 'win'
    IF p_outcome = 'win' THEN
        v_winner_id := v_user_id;
    ELSIF v_opponent_outcome = 'win' THEN
        v_winner_id := CASE WHEN v_user_id = v_host_id THEN v_opp_id ELSE v_host_id END;
    ELSE
         -- Both reported Cancel/Loss etc logically shouldn't happen without dispute, but fallback to dispute:
        UPDATE public.challenges SET status = 'disputed' WHERE id = p_challenge_id;
        RETURN TRUE;
    END IF;

    -- 5. Execute Payout (15% Rake)
    v_rake_amount := v_prize_pool * 0.15;
    v_payout_amount := v_prize_pool - v_rake_amount;

    -- Update Challenge
    UPDATE public.challenges
    SET status = 'resolved', winner_id = v_winner_id, resolved_at = NOW()
    WHERE id = p_challenge_id;

    -- Payout the Winner
    -- Lock winner profile
    PERFORM balance FROM public.profiles WHERE id = v_winner_id FOR UPDATE;

    UPDATE public.profiles
    SET balance = COALESCE(balance, 0) + v_payout_amount
    WHERE id = v_winner_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (v_winner_id, v_payout_amount, 'challenge_win', p_challenge_id);
    
    -- NOTE: Rake is retained in the platform (it just doesn't get paid out). 
    -- Alternatively, it could be logged to an admin account.

    RETURN TRUE;
END;
$$;
