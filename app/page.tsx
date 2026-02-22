"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import AboutSection from "@/components/AboutSection";
import Tournaments from "../components/Tournaments";
import StatsDashboard from "../components/StatsDashboard";
import PrizePoolTracker from "../components/PrizePoolTracker";
import MatchHistory from "../components/MatchHistory";
import Leaderboard from "../components/Leaderboard";
import Reviews from "../components/Reviews";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-compete-bg slide-up">
      <Navbar onJoinClick={() => router.push("/auth")} />

      {/* Add pt-20 to account for the fixed navbar height */}
      <main className="pt-20">
        <Hero onJoinClick={() => router.push("/auth")} />
        <AboutSection />
        <Tournaments />
        <Leaderboard />
        <Reviews />
      </main>
    </div>
  );
}