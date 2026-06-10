"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createClient } from "@/supabase/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NavbarProps {
  onJoinClick?: () => void;
}

import { AdminNavbar } from "./admin/AdminNavbar";

export default function Navbar({ onJoinClick }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!mounted || pathname === "/coming-soon" || !navRef.current) return;

    const ctx = gsap.context(() => {
      // Entrance animation
      gsap.from(".nav-item", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out"
      });

      // Morphing logic via ScrollTrigger class toggle
      ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: "nav-scrolled", targets: navRef.current }
      });
    }, navRef);

    return () => ctx.revert();
  }, [mounted, pathname]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname === "/coming-soon") return null;

  // Render Admin Navbar if user is Admin
  if (profile?.role === 'admin') {
    return <AdminNavbar profile={profile} />;
  }

  // Hide Navbar for client users on the dashboard
  if (pathname.startsWith("/dashboard")) return null;

  if (!mounted) return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 h-[72px] w-[90%] max-w-5xl rounded-container flex items-center justify-between px-6 md:px-8 opacity-0 pointer-events-none">
      <div className="flex items-center gap-2 lg:gap-3 font-mono">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 shadow-[0_0_10px_#9B5CFF]" />
        <span className="text-xl font-black tracking-[0.25em] text-white">COMPETE</span>
      </div>
    </nav>
  );

  const handleJoinClick = onJoinClick || (() => router.push("/auth"));

  return (
    <nav 
      ref={navRef}
      className="fixed top-3 lg:top-6 left-1/2 -translate-x-1/2 z-50 h-14 lg:h-[72px] w-[94%] lg:w-[90%] max-w-5xl rounded-2xl flex items-center justify-between px-4 lg:px-8 transition-all duration-500 ease-in-out border border-white/10 bg-[#0F0F16]/60 backdrop-blur-md shadow-2xl"
    >
      <style jsx global>{`
        nav.nav-scrolled {
          background-color: rgba(11, 11, 16, 0.9) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>

      {/* Logo */}
      <Link href="/" className="nav-item flex items-center gap-2 lg:gap-3 group font-mono">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 shadow-[0_0_10px_#9B5CFF] group-hover:scale-110 transition-transform" />
        <span className="text-base lg:text-lg font-black tracking-[0.25em] text-white">COMPETE</span>
      </Link>

      {/* Nav Links - Desktop */}
      <div className="hidden lg:flex items-center gap-8 text-[10px] font-black tracking-[0.25em] text-white uppercase font-mono">
        <Link href="/" className="nav-item nav-link transition-colors hover:text-compete-purple">HOME</Link>
        <Link href="/tournaments" className="nav-item nav-link transition-colors hover:text-compete-purple">TOURNAMENTS</Link>
        <Link href="/rankings" className="nav-item nav-link transition-colors hover:text-compete-purple">RANKINGS</Link>
        <Link href="/faq" className="nav-item nav-link transition-colors hover:text-compete-purple">FAQ</Link>
      </div>

      {/* Auth & Mobile Toggle */}
      <div className="nav-item flex items-center gap-3 lg:gap-6 font-mono">
        {/* Menu Toggle (Mobile Only) */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        {profile ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 lg:gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-[10px] font-black text-white tracking-widest leading-none mb-1">
                  {profile.username.toUpperCase()}
                </p>
                {profile.username !== 'moderator001' && (
                  <p className="text-[8px] text-compete-purple font-black tracking-widest leading-none">VERIFIED</p>
                )}
              </div>
              <div className="relative w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-compete-purple to-pink-500 p-[1.5px]">
                <div className="w-full h-full bg-black rounded-full flex items-center justify-center text-xs overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black italic text-compete-purple">
                      {profile.username === 'moderator001' ? '' : profile.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </Link>
            {/* Desktop Logout */}
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/auth");
              }}
              className="hidden lg:flex p-2 rounded-full bg-white/5 border border-white/10 text-white/20 hover:text-red-500 transition-all ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </>
        ) : (
          <button
            onClick={handleJoinClick}
            className="rounded-full bg-compete-purple hover:bg-compete-purpleGlow px-5 py-2.5 text-[10px] font-black tracking-[0.2em] text-white transition-all shadow-md"
          >
            SIGN IN
          </button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[70px] lg:hidden bg-black/95 backdrop-blur-3xl border-b border-white/5 p-6 z-40 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              <Link href="/" className="text-sm font-black tracking-[0.2em] text-white/60 hover:text-compete-purple transition-colors">Home</Link>
              <Link href="/tournaments" className="text-sm font-black tracking-[0.2em] text-white/60 hover:text-compete-purple transition-colors">Tournaments</Link>
              <Link href="/rankings" className="text-sm font-black tracking-[0.2em] text-white/60 hover:text-compete-purple transition-colors">Rankings</Link>
              <Link href="/faq" className="text-sm font-black tracking-[0.2em] text-white/60 hover:text-compete-purple transition-colors">FAQ</Link>
              
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                 {profile ? (
                   <div className="flex flex-col gap-3">
                     <Link href="/dashboard" className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                         {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : profile.username[0]}
                       </div>
                       <span className="text-xs font-black tracking-widest text-white">{profile.username}</span>
                     </Link>
                     <button
                        onClick={async () => {
                          await supabase.auth.signOut();
                          router.push("/auth");
                        }}
                        className="flex items-center gap-2 text-[10px] font-black tracking-widest text-red-500/60 hover:text-red-500 transition-colors p-1"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Sign Out
                     </button>
                   </div>
                 ) : (
                   <button
                     onClick={handleJoinClick}
                     className="w-full rounded-xl bg-compete-purple py-4 text-[10px] font-black tracking-widest text-white shadow-purple-glow"
                   >
                     Sign In
                   </button>
                 )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}