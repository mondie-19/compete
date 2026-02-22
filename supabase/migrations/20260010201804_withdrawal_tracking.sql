-- Migration: Withdrawal Tracking & Requests
-- This migration adds a status-based system for withdrawals to improve security and tracking.

-- 1. Create Withdrawal Status Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'withdrawal_status') THEN
        CREATE TYPE withdrawal_status AS ENUM ('pending', 'processing', 'paid', 'rejected');
    END IF;
END $$;

-- 2. Create Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    status withdrawal_status DEFAULT 'pending' NOT NULL,
    payout_details JSONB, -- For bank info or crypto addresses
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Add RLS to Withdrawal Requests
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawal requests" 
ON public.withdrawal_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawal requests" 
ON public.withdrawal_requests FOR ALL 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 4. Update the withdraw_funds RPC
-- This version holds the balance in 'pending' by creating a request and deducting only after approval,
-- OR it deducts immediately but logs it here for tracking. 
-- Best practice: Deduct immediately but allow admin to 'reject' and refund, OR hold in escrow.
-- Let's go with: Deduct immediately (log transaction) and create a request for the admin to fulfill.

CREATE OR REPLACE FUNCTION public.request_withdrawal(
    p_amount NUMERIC(10, 2)
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_balance NUMERIC(10, 2);
    v_request_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    -- Lock profile and check balance
    SELECT balance INTO v_balance FROM public.profiles WHERE id = v_user_id FOR UPDATE;
    IF v_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient vault credits.';
    END IF;

    -- Create withdrawal request
    INSERT INTO public.withdrawal_requests (user_id, amount, status)
    VALUES (v_user_id, p_amount, 'pending')
    RETURNING id INTO v_request_id;

    -- Deduct funds atomically and log as potentially pending
    UPDATE public.profiles SET balance = balance - p_amount WHERE id = v_user_id;
    
    INSERT INTO public.transactions (user_id, amount, type, reference_id)
    VALUES (v_user_id, -p_amount, 'withdrawal', v_request_id);

    RETURN v_request_id;
END;
$$;
