-- Supabase RPC for Atomic Withdrawal

CREATE OR REPLACE FUNCTION public.withdraw_funds(
    p_amount NUMERIC(10, 2)
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_balance NUMERIC(10, 2);
BEGIN
    v_user_id := auth.uid();

    -- Lock the user profile
    SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;

    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient funds.';
    END IF;

    -- Update user balance
    UPDATE public.profiles
    SET balance = balance - p_amount
    WHERE id = v_user_id;

    -- Insert audit log
    INSERT INTO public.transactions (user_id, amount, type)
    VALUES (v_user_id, -p_amount, 'withdrawal');

    RETURN TRUE;
END;
$$;
