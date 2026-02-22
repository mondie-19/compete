-- Supabase RPCs for Atomic Wallet Operations

-- 1. Deposit Funds (Called by a secure Edge Function after Paystack verification)
CREATE OR REPLACE FUNCTION public.deposit_funds(
    p_user_id UUID,
    p_amount NUMERIC(10, 2),
    p_reference_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to update balance
AS $$
BEGIN
    -- Optional: Check if reference_id already exists to prevent double-spending
    IF EXISTS (SELECT 1 FROM public.transactions WHERE external_reference = p_reference_id) THEN
        RAISE EXCEPTION 'Transaction reference already processed.';
    END IF;

    -- Insert audit log
    INSERT INTO public.transactions (user_id, amount, type, external_reference)
    VALUES (p_user_id, p_amount, 'deposit', p_reference_id);

    -- Update user balance
    UPDATE public.profiles
    SET balance = balance + p_amount
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$;


-- 2. Create Challenge (Deduct Entry Fee atomically)
CREATE OR REPLACE FUNCTION public.create_challenge_with_escrow(
    p_game_name TEXT,
    p_platform TEXT,
    p_entry_fee NUMERIC(10, 2),
    p_prize_pool NUMERIC(10, 2)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_host_id UUID;
    v_challenge_id UUID;
    v_balance NUMERIC(10, 2);
BEGIN
    v_host_id := auth.uid();
    
    -- Get current balance and lock row
    SELECT balance INTO v_balance FROM public.profiles WHERE id = v_host_id FOR UPDATE;

    IF v_balance < p_entry_fee THEN
        RAISE EXCEPTION 'Insufficient vault credits.';
    END IF;

    -- Create challenge
    INSERT INTO public.challenges (host_id, game_name, platform, entry_fee, prize_pool)
    VALUES (v_host_id, p_game_name, p_platform, p_entry_fee, p_prize_pool)
    RETURNING id INTO v_challenge_id;

    -- Deduct balance
    UPDATE public.profiles SET balance = balance - p_entry_fee WHERE id = v_host_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (v_host_id, -p_entry_fee, 'challenge_entry', v_challenge_id);

    RETURN v_challenge_id;
END;
$$;


-- 3. Join Challenge (Intercept) - Atomic update and deduction
CREATE OR REPLACE FUNCTION public.join_challenge_with_escrow(
    p_challenge_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_entry_fee NUMERIC(10, 2);
    v_status challenge_status;
    v_balance NUMERIC(10, 2);
BEGIN
    v_user_id := auth.uid();

    -- Lock the challenge row to prevent race conditions (double joins)
    SELECT entry_fee, status INTO v_entry_fee, v_status
    FROM public.challenges 
    WHERE id = p_challenge_id FOR UPDATE;

    IF v_status != 'open' THEN
        RAISE EXCEPTION 'Deployment no longer open.';
    END IF;

    -- Lock user profile
    SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;

    IF v_balance < v_entry_fee THEN
        RAISE EXCEPTION 'Insufficient vault credits.';
    END IF;

    -- Update Challenge
    UPDATE public.challenges 
    SET opponent_id = v_user_id, status = 'in_progress', joined_at = NOW()
    WHERE id = p_challenge_id;

    -- Deduct balance
    UPDATE public.profiles SET balance = balance - v_entry_fee WHERE id = v_user_id;

    -- Log transaction
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (v_user_id, -v_entry_fee, 'challenge_entry', p_challenge_id);

    RETURN TRUE;
END;
$$;
