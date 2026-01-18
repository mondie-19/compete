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
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-compete-bg slide-up">
      <Navbar onJoinClick={() => setIsAuthOpen(true)} />
      
      {/* Add pt-20 to account for the fixed navbar height */}
      <main className="pt-20">
        <Hero onJoinClick={() => setIsAuthOpen(true)} />
        <AboutSection /> 
        <Tournaments />
        <Leaderboard />
        <Reviews />
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}