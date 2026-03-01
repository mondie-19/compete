-- Migration: Profile Enhancements
-- Adds level, rank_name, and banner_url to support the World Chat profile identity.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rank_name TEXT DEFAULT 'NOOB',
ADD COLUMN IF NOT EXISTS banner_url TEXT;

-- Update existing profiles to have some default values if needed
-- (Though the defaults in the column definition handle this for new and existing rows)

-- Ensure the rank_name is one of the allowed values (optional but good for consistency)
-- Ranks: NOOB, AMATEUR, SEMI-PRO, PRO, GRIM-STAKER
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_rank_name_check 
CHECK (rank_name IN ('NOOB', 'AMATEUR', 'SEMI-PRO', 'PRO', 'GRIM-STAKER'));
