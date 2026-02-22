"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

interface NavbarProps {
  onJoinClick?: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
  const router = useRouter(); // New instance for internal redirect
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser();
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // 3. Hide completely on coming-soon route
  if (pathname === "/coming-soon") return null;

  // Placeholder check (also hiding for coming-soon)
  if (!mounted) return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-compete-bg/80 backdrop-blur-md border-b border-white/5 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45" />
        <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
      </div>
    </nav>
  );

  // Handle onJoinClick if it's not provided, redirect to /auth
  const handleJoinClick = onJoinClick || (() => router.push("/auth"));

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

      {/* Auth Button / Player Badge */}
      {profile ? (
        <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-1">{profile.username}</p>
            <p className="text-[10px] text-compete-purple font-black uppercase tracking-widest leading-none">
              {profile.is_admin ? "ADMIN ACCESS" : "Elite Operative"}
            </p>
          </div>
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-compete-purple to-pink-500 p-[2px]">
            <div className="w-full h-full bg-black rounded-[8px] flex items-center justify-center text-sm overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black italic text-compete-purple">{profile.username[0]}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black" />
          </div>
        </Link>
      ) : (
        <button
          onClick={handleJoinClick} // Use the handler here
          className="rounded-xl border border-compete-purple/50 px-8 py-2 text-xs font-bold uppercase tracking-widest text-compete-purple hover:bg-compete-purple hover:text-white transition-all shadow-sm hover:shadow-purple-glow"
        >
          Authorize
        </button>
      )}
    </nav>
  );
}