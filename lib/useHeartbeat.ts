"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/supabase/client";

export function useHeartbeat() {
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const sendHeartbeat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", user.id);
    };

    sendHeartbeat();
    const id = setInterval(sendHeartbeat, 60_000);
    return () => clearInterval(id);
  }, []); // stable ref — no deps needed
}
