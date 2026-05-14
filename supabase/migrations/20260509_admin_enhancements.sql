-- Migration: Admin Dashboard Enhancements
-- Adds region, last_seen_at, and customer_care role

-- 1. Add customer_care to the user_role enum
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'customer_care';

-- 2. Add region column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'Unknown';

-- 3. Add last_seen_at for session tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT now();

-- 4. Ensure realtime is enabled on profiles for live user tracking
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
  END IF;
END $$;

-- 5. Dashboard stats view: revenue, staked, matches grouped by region
CREATE OR REPLACE VIEW public.admin_regional_stats AS
WITH regions AS (
  SELECT 'World' as region
  UNION ALL SELECT 'Africa'
  UNION ALL SELECT 'Asia'
  UNION ALL SELECT 'Europe'
  UNION ALL SELECT 'N. America'
  UNION ALL SELECT 'S. America'
  UNION ALL SELECT 'Oceania'
  UNION ALL SELECT 'Antarctica'
),
stats AS (
  SELECT
    COALESCE(p.region, 'Unknown') AS region,
    COUNT(DISTINCT p.id) AS total_users,
    COUNT(DISTINCT CASE WHEN p.last_seen_at > now() - interval '1 day' THEN p.id END) AS active_users,
    COALESCE(SUM(CASE WHEN c.status = 'resolved' THEN c.prize_pool * 0.15 ELSE 0 END), 0) AS total_revenue,
    COALESCE(SUM(CASE WHEN c.status IN ('open','in_progress') THEN c.prize_pool ELSE 0 END), 0) AS total_staked,
    COUNT(CASE WHEN c.status = 'in_progress' THEN 1 END) AS active_matches,
    COUNT(CASE WHEN c.status = 'resolved' AND c.resolved_at > now() - interval '24 hours' THEN 1 END) AS recent_matches
  FROM public.profiles p
  LEFT JOIN public.challenges c ON (c.host_id = p.id OR c.opponent_id = p.id)
  GROUP BY COALESCE(p.region, 'Unknown')
),
world_stats AS (
  SELECT
    'World' as region,
    SUM(total_users) as total_users,
    SUM(active_users) as active_users,
    SUM(total_revenue) as total_revenue,
    SUM(total_staked) as total_staked,
    SUM(active_matches) as active_matches,
    SUM(recent_matches) as recent_matches
  FROM stats
)
SELECT 
  r.region,
  COALESCE(CASE WHEN r.region = 'World' THEN w.total_users ELSE s.total_users END, 0) as total_users,
  COALESCE(CASE WHEN r.region = 'World' THEN w.active_users ELSE s.active_users END, 0) as active_users,
  COALESCE(CASE WHEN r.region = 'World' THEN w.total_revenue ELSE s.total_revenue END, 0) as total_revenue,
  COALESCE(CASE WHEN r.region = 'World' THEN w.total_staked ELSE s.total_staked END, 0) as total_staked,
  COALESCE(CASE WHEN r.region = 'World' THEN w.active_matches ELSE s.active_matches END, 0) as active_matches,
  COALESCE(CASE WHEN r.region = 'World' THEN w.recent_matches ELSE s.recent_matches END, 0) as recent_matches
FROM regions r
LEFT JOIN stats s ON s.region = r.region
LEFT JOIN world_stats w ON w.region = r.region;

-- 6. Revenue over time view (for time-range switcher)
CREATE OR REPLACE VIEW public.admin_revenue_timeline AS
SELECT
  'World' AS region,
  date_trunc('day', c.resolved_at) AS day,
  SUM(c.prize_pool * 0.15) AS revenue
FROM public.challenges c
WHERE c.status = 'resolved' AND c.resolved_at IS NOT NULL
GROUP BY date_trunc('day', c.resolved_at)
UNION ALL
SELECT
  COALESCE(p.region, 'Unknown') AS region,
  date_trunc('day', c.resolved_at) AS day,
  SUM(c.prize_pool * 0.15) AS revenue
FROM public.challenges c
JOIN public.profiles p ON p.id = c.host_id
WHERE c.status = 'resolved' AND c.resolved_at IS NOT NULL
GROUP BY COALESCE(p.region, 'Unknown'), date_trunc('day', c.resolved_at)
ORDER BY day DESC;

-- 7. Grant access to views for authenticated users (admin-level queries via service role bypass RLS)
GRANT SELECT ON public.admin_regional_stats TO authenticated;
GRANT SELECT ON public.admin_revenue_timeline TO authenticated;
