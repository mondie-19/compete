"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavbarProps {
  onJoinClick: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
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
        <Link href="/leaderboard" className="hover:text-compete-purple transition-all">Rankings</Link>
        <Link href="/faq" className="hover:text-compete-purple transition-all">FAQ/SUPPORT</Link>
      </div>

      {/* Auth Button */}
      <button 
        onClick={onJoinClick}
        className="rounded-full border border-compete-purple/50 px-8 py-2 text-xs font-bold uppercase tracking-widest text-compete-purple hover:bg-compete-purple hover:text-white transition-all shadow-sm hover:shadow-purple-glow"
      >
        Log In
      </button>
    </nav>
  );
}