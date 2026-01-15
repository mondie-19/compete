"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Tournaments from "../components/Tournaments";
import Leaderboard from "../components/Leaderboard";
import AuthModal from "../components/AuthModal";

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-compete-bg">
      <Navbar onJoinClick={() => setIsAuthOpen(true)} />
      
      {/* Add pt-20 to account for the fixed navbar height */}
      <main className="pt-20">
        <Hero onJoinClick={() => setIsAuthOpen(true)} />
        <Tournaments />
        <Leaderboard />
      </main>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}