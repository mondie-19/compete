-- Migration: Real-Time Leaderboard View
-- This migration creates a view that aggregates player performance for the global standings.

CREATE OR REPLACE VIEW public.user_rankings AS
WITH player_stats AS (
    -- Calculate stats for each player
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
)
SELECT 
    username,
    avatar_url,
    total_earnings,
    total_matches,
    total_wins,
    CASE 
        WHEN total_matches > 0 THEN ROUND((total_wins::NUMERIC / total_matches::NUMERIC) * 100, 2)
        ELSE 0 
    END as win_rate,
    DENSE_RANK() OVER (ORDER BY total_earnings DESC, total_wins DESC) as rank
FROM player_stats
WHERE total_matches > 0 -- Only show active players
ORDER BY rank ASC;

-- RLS for the View is inherited from underlying tables in Supabase, 
-- but we can explicitly grant access.
GRANT SELECT ON public.user_rankings TO authenticated, anon;
