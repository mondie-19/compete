"use server";
import { createClient } from "@/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Resolve a disputed match
 * Only callable by admins.
 */
export async function resolveDispute(challengeId: string, winnerId: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    const { error } = await supabase.rpc('resolve_dispute', {
        p_challenge_id: challengeId,
        p_winner_id: winnerId
    });

    if (error) {
        console.error("RPC Error:", error.message);
        return { error: error.message || "Failed to resolve dispute" };
    }

    revalidatePath(`/match/${challengeId}`);
    revalidatePath('/admin');
    return { success: true };
}
