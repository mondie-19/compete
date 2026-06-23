-- Migration: Add city & country to profiles; add per-scope ranks to user_rankings view

-- 1. Add location columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city    TEXT;

-- 2. Drop the strict region check constraint so full names already stored still work
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_region_check;

-- 3. Rebuild the rankings view with city / country and per-scope DENSE_RANKs
DROP VIEW IF EXISTS public.user_rankings;

CREATE OR REPLACE VIEW public.user_rankings AS
WITH player_stats AS (
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    -- Normalise region so legacy full-name values become codes
    CASE p.region
      WHEN 'Africa'      THEN 'AF'
      WHEN 'Asia'        THEN 'AS'
      WHEN 'Europe'      THEN 'EU'
      WHEN 'N. America'  THEN 'NA'
      WHEN 'S. America'  THEN 'SA'
      WHEN 'Oceania'     THEN 'OC'
      WHEN 'Antarctica'  THEN 'AN'
      ELSE p.region
    END AS region,
    p.country,
    p.city,
    COALESCE(SUM(CASE WHEN t.type = 'challenge_win' THEN t.amount ELSE 0 END), 0) AS total_earnings,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved')      AS total_matches,
    COUNT(DISTINCT c.id) FILTER (WHERE c.winner_id = p.id)         AS total_wins
  FROM public.profiles p
  LEFT JOIN public.transactions t  ON p.id = t.user_id
  LEFT JOIN public.challenges c    ON (p.id = c.host_id OR p.id = c.opponent_id)
  GROUP BY p.id, p.username, p.avatar_url, p.region, p.country, p.city
),
calculated AS (
  SELECT *,
    (total_wins * 10) + ((total_matches - total_wins) * -3) AS raw_xp
  FROM player_stats
),
final_stats AS (
  SELECT *,
    GREATEST(0, raw_xp) AS xp,
    CASE
      WHEN total_matches > 0
        THEN ROUND((total_wins::NUMERIC / total_matches::NUMERIC) * 100, 2)
      ELSE 0
    END AS win_rate
  FROM calculated
)
SELECT
  id,
  username,
  avatar_url,
  region,
  country,
  city,
  total_earnings,
  total_matches,
  total_wins,
  win_rate,
  xp,
  LEAST(300, FLOOR(xp / 100) + 1) AS level,
  -- Global rank
  DENSE_RANK() OVER (ORDER BY xp DESC, total_wins DESC)                                       AS rank,
  -- Continent rank (partition by region code; NULL region → NULL rank)
  CASE WHEN region IS NOT NULL THEN
    DENSE_RANK() OVER (PARTITION BY region ORDER BY xp DESC, total_wins DESC)
  END AS continent_rank,
  -- Country rank (NULL country → NULL rank)
  CASE WHEN country IS NOT NULL THEN
    DENSE_RANK() OVER (PARTITION BY LOWER(country) ORDER BY xp DESC, total_wins DESC)
  END AS country_rank,
  -- City rank (NULL city → NULL rank)
  CASE WHEN city IS NOT NULL THEN
    DENSE_RANK() OVER (PARTITION BY LOWER(city) ORDER BY xp DESC, total_wins DESC)
  END AS city_rank
FROM final_stats
WHERE total_matches > 0
ORDER BY rank ASC;

GRANT SELECT ON public.user_rankings TO authenticated, anon;
