"use server";
import { createClient } from "@/supabase/server";

/**
 * Submit Match Report
 * Calls the secure RPC 'submit_match_report' which calculates logic for disputes, auto-payouts, and 15% rake.
 */
export async function submitMatchReport(challengeId: string, outcome: 'win' | 'loss', proofUrls: string[]) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    const { error } = await supabase.rpc('submit_match_report', {
        p_challenge_id: challengeId,
        p_outcome: outcome,
        p_proof_urls: proofUrls
    });

    if (error) {
        console.error("RPC Error:", error.message);
        return { error: error.message || "Failed to submit report" };
    }

    return { success: true };
}

/**
 * Create a new Challenge with Escrow deduction
 */
export async function createChallenge(gameName: string, platform: string, entryFee: number) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "User not authenticated" };

    // Prize pool is double the entry fee
    const prizePool = entryFee * 2;

    const { data: challengeId, error } = await supabase.rpc('create_challenge_with_escrow', {
        p_game_name: gameName,
        p_platform: platform,
        p_entry_fee: entryFee,
        p_prize_pool: prizePool
    });

    if (error) {
        console.error("RPC Error:", error.message);
        return { error: error.message || "Failed to deploy match" };
    }

    return { success: true, challengeId };
}

/**
 * Resolve a ghosted match after timeout
 */
export async function resolveGhostedMatch(challengeId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('resolve_ghosted_match', {
        p_challenge_id: challengeId
    });

    if (error) {
        return { error: error.message || "Failed to resolve timeout" };
    }

    if (!data.success) {
        return { error: data.error };
    }

    return { success: true, winnerId: data.winner_id };
}
