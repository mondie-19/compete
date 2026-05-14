"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";

/**
 * useHeartbeat — Updates `last_seen_at` on the user's profile every 60 seconds.
 * Wire this into any authenticated page so the admin can see live/inactive status.
 */
export function useHeartbeat() {
  const supabase = createClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id);
    };

    // Fire immediately on mount, then every 60 seconds
    sendHeartbeat();
    intervalRef.current = setInterval(sendHeartbeat, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [supabase]);
}
