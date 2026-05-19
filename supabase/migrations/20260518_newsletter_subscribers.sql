-- Migration: Newsletter Subscribers
-- Creates the newsletter_subscribers table for the tournament notification system

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone (anon + authenticated) to INSERT (subscribe)
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- 4. Only admins can SELECT all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
