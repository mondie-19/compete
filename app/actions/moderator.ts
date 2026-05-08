"use server";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Resolve a match as a moderator
 */
export async function resolveMatchAsModerator(
    challengeId: string,
    winnerId: string | null,
    action: 'resolve' | 'cancel'
) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    const { error } = await supabase.rpc('moderator_resolve_match', {
        p_challenge_id: challengeId,
        p_winner_id: winnerId,
        p_action: action
    });

    if (error) {
        console.error("Moderator RPC Error:", error.message);
        return { error: error.message || "Failed to resolve match" };
    }

    revalidatePath(`/match/${challengeId}`);
    revalidatePath('/moderator');
    return { success: true };
}
