-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('client', 'moderator', 'admin');

-- Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'client'::public.user_role;

-- Migrate existing admins to the 'admin' role
UPDATE public.profiles SET role = 'admin'::public.user_role WHERE is_admin = true;

-- Update the moderator_resolve_match function to use role
CREATE OR REPLACE FUNCTION public.moderator_resolve_match(
    p_challenge_id UUID,
    p_winner_id UUID,
    p_action TEXT
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
    v_host_id UUID;
    v_opp_id UUID;
    v_entry_fee NUMERIC(10, 2);
BEGIN
    v_admin_id := auth.uid();
    
    -- Verify Caller is an Admin/Moderator
    SELECT role INTO v_role FROM public.profiles WHERE id = v_admin_id;
    IF v_role != 'admin' AND v_role != 'moderator' THEN
        RAISE EXCEPTION 'Unauthorized: Requires Moderator or Admin privileges.';
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
