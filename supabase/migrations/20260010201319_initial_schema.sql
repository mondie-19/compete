-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Challenges Table
CREATE TYPE challenge_status AS ENUM ('open', 'in_progress', 'disputed', 'resolved', 'cancelled');

CREATE TABLE public.challenges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.profiles(id) NOT NULL,
    opponent_id UUID REFERENCES public.profiles(id),
    game_name TEXT NOT NULL,
    platform TEXT NOT NULL,
    entry_fee NUMERIC(10, 2) NOT NULL CHECK (entry_fee >= 0),
    prize_pool NUMERIC(10, 2) NOT NULL CHECK (prize_pool >= 0),
    status challenge_status DEFAULT 'open' NOT NULL,
    winner_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 3. Transactions Table (Audit Log for Wallet)
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'challenge_entry', 'challenge_win', 'refund');

CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type transaction_type NOT NULL,
    reference_id UUID, -- Can link to a challenge_id or external payment ref
    external_reference TEXT, -- For Paystack refs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- Challenges RLS
CREATE POLICY "Challenges are viewable by everyone."
    ON public.challenges FOR SELECT
    USING ( true );

CREATE POLICY "Authenticated users can create challenges."
    ON public.challenges FOR INSERT
    WITH CHECK ( auth.role() = 'authenticated' AND auth.uid() = host_id );

-- IMPORTANT: We only allow updates via trusted RPCs for joining/resolving to enforce logic.
-- So we strictly limit direct updates.
CREATE POLICY "Hosts can cancel open challenges."
    ON public.challenges FOR UPDATE
    USING ( auth.uid() = host_id AND status = 'open' );

-- Transactions RLS (Read-only for users, Insert only via RPC/Edge Functions)
CREATE POLICY "Users can view their own transactions."
    ON public.transactions FOR SELECT
    USING ( auth.uid() = user_id );

----------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
----------------------------------------------------------------------------------

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
