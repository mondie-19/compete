"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface NavbarProps {
  onJoinClick?: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

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

  if (pathname === "/coming-soon") return null;

  if (!mounted) return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 h-[72px] w-[90%] max-w-5xl rounded-container flex items-center justify-between px-6 md:px-8 opacity-0 pointer-events-none">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45" />
        <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
      </div>
    </nav>
  );

  const handleJoinClick = onJoinClick || (() => router.push("/auth"));

  return (
    <nav 
      ref={navRef}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 h-[72px] w-[90%] max-w-5xl rounded-[2rem] flex items-center justify-between px-6 md:px-8 transition-all duration-500 ease-in-out border border-transparent bg-transparent"
    >
      <style jsx global>{`
        nav.nav-scrolled {
          background-color: rgba(11, 11, 16, 0.6) !important;
          backdrop-filter: blur(24px);
          border-color: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        nav.nav-scrolled .nav-link {
          color: var(--color-compete-purple);
        }
        nav.nav-scrolled .nav-link:hover {
          color: var(--color-compete-purple-glow);
        }
      `}</style>

      {/* Logo */}
      <Link href="/" className="nav-item flex items-center gap-3 group link-hover">
        <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 group-hover:scale-110 transition-transform shadow-[0_0_10px_#9B5CFF]" />
        <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-white">
        <Link href="/" className="nav-item nav-link link-hover transition-colors">Home</Link>
        <Link href="/tournaments" className="nav-item nav-link link-hover transition-colors">Tournaments</Link>
        <Link href="/rankings" className="nav-item nav-link link-hover transition-colors">Rankings</Link>
        <Link href="/faq" className="nav-item nav-link link-hover transition-colors">FAQ</Link>
      </div>

      {/* Auth Button / Player Badge */}
      <div className="nav-item flex items-center gap-6">
        {profile ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity link-hover">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white uppercase tracking-widest leading-none mb-1">{profile.username}</p>
                <p className="text-[10px] text-compete-purple font-black uppercase tracking-widest leading-none">
                  {profile.role === 'admin' ? "Verified Admin" : 
                   profile.role === 'moderator' ? "Verified Moderator" : 
                   "Verified Competitor"}
                </p>
              </div>
              <div className="relative w-10 h-10 rounded-[1.5rem] bg-gradient-to-br from-compete-purple to-pink-500 p-[2px]">
                <div className="w-full h-full bg-black rounded-[1.3rem] flex items-center justify-center text-sm overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black italic text-compete-purple">{profile.username[0]}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-black" />
              </div>
            </Link>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/auth");
              }}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/20 hover:text-red-500 hover:border-red-500/30 hover:bg-red-500/10 transition-all"
              title="Terminate Session"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </>
        ) : (
          <button
            onClick={handleJoinClick}
            className="btn-magnetic rounded-[2rem] bg-compete-purple px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-purple-glow"
          >
            Authorize
          </button>
        )}
      </div>
    </nav>
  );
}