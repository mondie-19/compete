"use client";
import { useState, useEffect } from "react";
import Hero from "../components/Hero";
import AboutSection from "@/components/AboutSection";
import Tournaments from "../components/Tournaments";
import Leaderboard from "../components/Leaderboard";
import Reviews from "../components/Reviews";

import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleJoinClick = () => {
    router.push(isLoggedIn ? "/deploy" : "/auth");
  };

  return (
    <div className="relative min-h-screen bg-compete-bg slide-up overflow-x-hidden">
      <main className="pt-20">
        <Hero onJoinClick={handleJoinClick} />
        <AboutSection />
        <Tournaments />
        <Leaderboard />
        <Reviews />
      </main>
    </div>
  );
}