-- Fix typo in messages table replica identity
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Ensure RLS is enabled
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Re-apply Send Message Policy with explicit qualification
DROP POLICY IF EXISTS "Authenticated users can send messages." ON public.messages;
CREATE POLICY "Authenticated users can send messages."
    ON public.messages FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

-- Ensure match_messages also has qualified RLS
DROP POLICY IF EXISTS "Match participants can send messages" ON public.match_messages;
CREATE POLICY "Match participants can send messages"
    ON public.match_messages FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.challenges
            WHERE challenges.id = match_messages.challenge_id
            AND (challenges.host_id = auth.uid() OR challenges.opponent_id = auth.uid())
        )
    );
