-- Emergency Schema Re-sync for World Chat
-- This ensures the messages table exists and is visible to the API

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fix permissions (Critical for schema cache)
ALTER TABLE public.messages OWNER TO postgres;
GRANT ALL ON TABLE public.messages TO postgres;
GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.messages TO service_role;

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Re-apply policies
DROP POLICY IF EXISTS "Messages are viewable by everyone." ON public.messages;
CREATE POLICY "Messages are viewable by everyone."
    ON public.messages FOR SELECT
    USING ( true );

DROP POLICY IF EXISTS "Authenticated users can send messages." ON public.messages;
CREATE POLICY "Authenticated users can send messages."
    ON public.messages FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

-- Enable Realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Ensure it's in the publication
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
  END IF;
END $$;

-- NOTIFY PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
