-- Add opponent_game_id column to challenges for capturing the interceptor's in-game ID
ALTER TABLE public.challenges ADD COLUMN IF NOT EXISTS opponent_game_id TEXT;

-- RPC: opponent sets their in-game ID after joining
CREATE OR REPLACE FUNCTION public.set_opponent_game_id(
    p_challenge_id UUID,
    p_game_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();

    UPDATE public.challenges
    SET opponent_game_id = p_game_id
    WHERE id = p_challenge_id
      AND opponent_id = v_user_id
      AND status = 'in_progress';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not authorized or challenge not in progress.';
    END IF;

    RETURN TRUE;
END;
$$;
