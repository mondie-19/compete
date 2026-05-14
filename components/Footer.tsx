"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/supabase/client";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[11px] font-medium text-white/40 hover:text-white transition-colors tracking-wide w-fit">
      {children}
    </Link>
  );
}

function FooterIcon({ path, label, href }: { path: string; label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white/20 hover:text-compete-purple transition-all duration-300 transform hover:scale-110"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" className="fill-current">
        <path d={path} />
      </svg>
    </a>
  );
}

export default function Footer() {
  const pathname = usePathname();
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const generated = [...Array(8)].map((_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3}px`,
      height: `${Math.random() * 3}px`,
      animationDelay: `${Math.random() * 10}s`,
      background: i % 2 === 0 ? '#9B5CFF' : 'white'
    }));
    setParticles(generated);

    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (pathname === "/coming-soon") return null;

  return (
    <footer className="relative w-full bg-black border-t border-white/5 text-compete-muted overflow-hidden z-50">

      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              top: p.top,
              left: p.left,
              width: p.width,
              height: p.height,
              animationDelay: p.animationDelay,
              background: p.background
            } as any}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-14">

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand Column */}
          <div className="md:col-span-1 flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 shadow-[0_0_10px_#9B5CFF] group-hover:scale-110 transition-transform" />
              <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
            </Link>
            <p className="text-[11px] text-white/30 leading-relaxed max-w-[220px]">
              Peer-to-peer competitive gaming with skill-based wagering and real cash payouts.
            </p>
            <nav className="flex gap-4 items-center mt-1">
              <FooterIcon label="X" href="https://x.com" path="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              <FooterIcon label="Discord" href="https://discord.com" path="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              <FooterIcon label="Instagram" href="https://instagram.com" path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
              <FooterIcon label="TikTok" href="https://tiktok.com" path="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.38 6.38 0 0 1-2.22-2.02V15.5c.09 4.03-2.85 7.73-6.83 8.37-3.98.64-8.03-1.89-9.13-5.74-1.1-3.85 1.15-8.1 5.03-9.35 1.17-.38 2.42-.49 3.64-.32V12.6c-2.02-.37-4.1.66-4.87 2.55a4.26 4.26 0 0 0 2.92 5.59c2 .53 4.25-.46 4.93-2.39.11-.32.16-.65.17-.98V.02z" />
            </nav>
          </div>

          {/* Platform Links */}
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black tracking-[0.35em] text-white/30 mb-1">Platform</p>
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/tournaments">Tournaments</FooterLink>
            <FooterLink href="/rankings">Rankings</FooterLink>
            {isLoggedIn && <FooterLink href="/lobby">Lobby</FooterLink>}
            {isLoggedIn && <FooterLink href="/deploy">Deploy a Match</FooterLink>}
            <FooterLink href="/faq">FAQ</FooterLink>
          </div>

          {/* Account Links */}
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black tracking-[0.35em] text-white/30 mb-1">Account</p>
            {!isLoggedIn ? (
              <FooterLink href="/auth">Sign In</FooterLink>
            ) : (
              <>
                <FooterLink href="/dashboard">Dashboard</FooterLink>
                <FooterLink href="/wallet">Vault</FooterLink>
              </>
            )}
          </div>

          {/* Legal Links */}
          <div className="flex flex-col gap-4">
            <p className="text-[9px] font-black tracking-[0.35em] text-white/30 mb-1">Legal</p>
            <FooterLink href="/terms-of-use">Terms of Use</FooterLink>
            <FooterLink href="/terms-of-agreement">User Agreement</FooterLink>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-white/20 leading-relaxed text-center md:text-left max-w-2xl">
            Compete is not affiliated with, endorsed by, or sponsored by any game publisher, platform holder, or hardware manufacturer. All referenced game titles, trademarks, and associated imagery remain the property of their respective rights holders.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <p className="text-[10px] font-bold tracking-widest text-white/20">
              © {new Date().getFullYear()} Compete
            </p>
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-white/30 hover:text-compete-purple transition-all"
            >
              Top
              <div className="p-1.5 rounded bg-white/5 border border-white/10 group-hover:border-compete-purple group-hover:shadow-purple-glow transition-all">
                <ChevronUp size={12} />
              </div>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}