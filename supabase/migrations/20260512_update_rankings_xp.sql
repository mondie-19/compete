-- Migration: Update Rankings with XP and Leveling Logic
-- Win: +10 XP, Loss: -3 XP
-- Level: 1 per 100 XP, max 200

DROP VIEW IF EXISTS public.user_rankings;

CREATE OR REPLACE VIEW public.user_rankings AS
WITH player_stats AS (
    SELECT 
        p.id,
        p.username,
        p.avatar_url,
        COALESCE(SUM(CASE WHEN t.type = 'challenge_win' THEN t.amount ELSE 0 END), 0) as total_earnings,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'resolved') as total_matches,
        COUNT(DISTINCT c.id) FILTER (WHERE c.winner_id = p.id) as total_wins
    FROM public.profiles p
    LEFT JOIN public.transactions t ON p.id = t.user_id
    LEFT JOIN public.challenges c ON (p.id = c.host_id OR p.id = c.opponent_id)
    GROUP BY p.id, p.username, p.avatar_url
),
calculated_stats AS (
    SELECT 
        *,
        (total_wins * 10) + ((total_matches - total_wins) * -3) as raw_xp
    FROM player_stats
),
final_stats AS (
    SELECT 
        *,
        GREATEST(0, raw_xp) as xp,
        CASE 
            WHEN total_matches > 0 THEN ROUND((total_wins::NUMERIC / total_matches::NUMERIC) * 100, 2)
            ELSE 0 
        END as win_rate
    FROM calculated_stats
)
SELECT 
    username,
    avatar_url,
    total_earnings,
    total_matches,
    total_wins,
    win_rate,
    xp,
    LEAST(200, FLOOR(xp / 100) + 1) as level,
    DENSE_RANK() OVER (ORDER BY xp DESC, total_wins DESC) as rank
FROM final_stats
WHERE total_matches > 0
ORDER BY rank ASC;

GRANT SELECT ON public.user_rankings TO authenticated, anon;
