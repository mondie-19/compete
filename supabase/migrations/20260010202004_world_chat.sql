-- Migration for World Chat Messages
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages RLS
CREATE POLICY "Messages are viewable by everyone."
    ON public.messages FOR SELECT
    USING ( true );

CREATE POLICY "Authenticated users can send messages."
    ON public.messages FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

-- Enable Real-time for Messages
-- This handles adding the table to the supabase_realtime publication
ALTER PINAL TABLE public.messages REPLICA IDENTITY FULL;
-- Note: Supabase provides a UI to enable real-time, but for migration consistency:
-- If the publication exists, we add the table. If not, the UI is the standard way.
-- However, we can attempt to add it to the 'supabase_realtime' publication if it exists.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
