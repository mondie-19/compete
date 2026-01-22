"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";

interface NavbarProps {
  onJoinClick: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-compete-bg/80 backdrop-blur-md border-b border-white/5 px-6 md:px-12 flex items-center justify-between">
      {/* Logo Placeholder */}
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45" />
        <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
      </div>
    </nav>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-compete-bg/80 backdrop-blur-md border-b border-white/5 px-6 md:px-12 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 shadow-[0_0_10px_#9B5CFF] group-hover:scale-110 transition-transform" />
        <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em] text-compete-muted">
        <Link href="/" className="hover:text-compete-purple transition-all">Home</Link>
        <Link href="/tournaments" className="hover:text-compete-purple transition-all">Tournaments</Link>
        <Link href="/rankings" className="hover:text-compete-purple text-white transition-all">
          Rankings
        </Link>
        <Link href="/faq" className="hover:text-compete-purple transition-all">FAQ/SUPPORT</Link>
      </div>

      {/* Auth Button */}
      {/* Auth Button / Player Badge */}
      {isLoggedIn ? (
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-1">NeonSlayer</p>
            <p className="text-[10px] text-compete-purple font-black uppercase tracking-widest leading-none">Level 42</p>
          </div>
          <div className="relative w-10 h-10 rounded-full border-2 border-compete-purple p-0.5">
            <div className="w-full h-full bg-compete-purple/20 rounded-full flex items-center justify-center text-sm">
              👤
            </div>
            <div className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-compete-card" />
          </div>
        </Link>
      ) : (
        <button
          onClick={onJoinClick}
          className="rounded-full border border-compete-purple/50 px-8 py-2 text-xs font-bold uppercase tracking-widest text-compete-purple hover:bg-compete-purple hover:text-white transition-all shadow-sm hover:shadow-purple-glow"
        >
          Log In
        </button>
      )}
    </nav>
  );
}