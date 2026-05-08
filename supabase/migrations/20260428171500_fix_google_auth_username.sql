-- Migration: Fix Google Auth Username
-- Updates the handle_new_user function to provide fallbacks for usernames when using OAuth providers like Google.

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
BEGIN
  -- 1. Attempt to extract a username from metadata or email
  -- Priority: 
  --   a) Explicit 'username' (standard for our email/pw signup)
  --   b) 'full_name' from OAuth (Google/Discord) - replaced spaces with underscores
  --   c) 'name' from OAuth
  --   d) Email prefix (part before @)
  v_username := COALESCE(
    new.raw_user_meta_data->>'username', 
    REPLACE(new.raw_user_meta_data->>'full_name', ' ', '_'),
    REPLACE(new.raw_user_meta_data->>'name', ' ', '_'),
    split_part(new.email, '@', 1)
  );

  -- 2. Final safety check: if somehow it's still null/empty, use a random string
  IF v_username IS NULL OR v_username = '' THEN
    v_username := 'competitor_' || substr(md5(random()::text), 1, 8);
  END IF;

  -- 3. Insert into profiles with the derived username
  -- Note: We rely on the DEFAULT value for 'role' to be 'client'
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, v_username, new.raw_user_meta_data->>'avatar_url');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
