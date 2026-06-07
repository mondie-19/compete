-- Migration: Add region to profiles and expose id + region in user_rankings view

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS region TEXT
CHECK (region IN ('AF', 'AS', 'EU', 'NA', 'SA', 'OC', 'AN'));

-- Rebuild the rankings view to include id and region
DROP VIEW IF EXISTS public.user_rankings;

CREATE OR REPLACE VIEW public.user_rankings AS
WITH player_stats AS (
    SELECT
        p.id,
        p.username,
        p.avatar_url,
        p.region,
        COALESCE(SUM(CASE WHEN t.type = 'challenge_win' THEN t.amount ELSE 0 END), 0) AS total_earnings,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') AS total_matches,
        COUNT(DISTINCT c.id) FILTER (WHERE c.winner_id = p.id) AS total_wins
    FROM public.profiles p
    LEFT JOIN public.transactions t ON p.id = t.user_id
    LEFT JOIN public.challenges c ON (p.id = c.host_id OR p.id = c.opponent_id)
    GROUP BY p.id, p.username, p.avatar_url, p.region
),
calculated_stats AS (
    SELECT
        *,
        (total_wins * 10) + ((total_matches - total_wins) * -3) AS raw_xp
    FROM player_stats
),
final_stats AS (
    SELECT
        *,
        GREATEST(0, raw_xp) AS xp,
        CASE
            WHEN total_matches > 0
                THEN ROUND((total_wins::NUMERIC / total_matches::NUMERIC) * 100, 2)
            ELSE 0
        END AS win_rate
    FROM calculated_stats
)
SELECT
    id,
    username,
    avatar_url,
    region,
    total_earnings,
    total_matches,
    total_wins,
    win_rate,
    xp,
    LEAST(300, FLOOR(xp / 100) + 1) AS level,
    DENSE_RANK() OVER (ORDER BY xp DESC, total_wins DESC) AS rank
FROM final_stats
WHERE total_matches > 0
ORDER BY rank ASC;

GRANT SELECT ON public.user_rankings TO authenticated, anon;
