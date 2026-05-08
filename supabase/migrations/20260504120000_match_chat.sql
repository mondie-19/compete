-- Migration: Match-specific communication (Tactical Chat)
-- Allows players in a match to coordinate and share lobby IDs.

CREATE TABLE IF NOT EXISTS public.match_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.match_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only participants of the match can see the messages
CREATE POLICY "Match participants can view messages"
    ON public.match_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.challenges
            WHERE id = match_messages.challenge_id
            AND (host_id = auth.uid() OR opponent_id = auth.uid())
        )
    );

-- Only participants can send messages
CREATE POLICY "Match participants can send messages"
    ON public.match_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.challenges
            WHERE id = challenge_id
            AND (host_id = auth.uid() OR opponent_id = auth.uid())
        )
    );

-- Enable Real-time
ALTER TABLE public.match_messages REPLICA IDENTITY FULL;

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.match_messages;
  END IF;
END $$;
