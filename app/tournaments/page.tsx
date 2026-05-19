"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Timer, ArrowLeft, Bell, Check, X, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { toast } from "sonner";

const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number }> = {
  "en-KE": { symbol: "KSh", rate: 129   },
  "sw-KE": { symbol: "KSh", rate: 129   },
  "en-NG": { symbol: "₦",   rate: 1580  },
  "en-GH": { symbol: "₵",   rate: 15    },
  "en-ZA": { symbol: "R",   rate: 18.5  },
  "en-UG": { symbol: "USh", rate: 3740  },
  "en-TZ": { symbol: "TSh", rate: 2570  },
  "en-GB": { symbol: "£",   rate: 0.79  },
  "fr-FR": { symbol: "€",   rate: 0.92  },
  "de-DE": { symbol: "€",   rate: 0.92  },
  "default": { symbol: "$", rate: 1     },
};

function getCurrencyConfig(locale: string) {
  if (CURRENCY_CONFIG[locale]) return CURRENCY_CONFIG[locale];
  const lang = locale.split("-")[0];
  const match = Object.entries(CURRENCY_CONFIG).find(([k]) => k.startsWith(lang));
  return match ? match[1] : CURRENCY_CONFIG["default"];
}

function formatPrize(usd: number, cfg: { symbol: string; rate: number }) {
  const val = usd * cfg.rate;
  if (val >= 1_000_000) return `${cfg.symbol}${(val / 1_000_000).toFixed(1)}M+`;
  if (val >= 1_000)    return `${cfg.symbol}${(val / 1_000).toFixed(0)}K+`;
  return `${cfg.symbol}${val.toFixed(0)}`;
}

function useCountUp(target: number, enabled: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!enabled || target === 0) return;
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, enabled]);
  return value;
}

export default function TournamentsPage() {
  const supabase = createClient();
  useHeartbeat();

  const [prizeUSD, setPrizeUSD]       = useState(10000);
  const [inView, setInView]           = useState(false);
  const [currencyCfg, setCurrencyCfg] = useState(CURRENCY_CONFIG["default"]);
  const [isLoggedIn, setIsLoggedIn]   = useState(false);
  const [userEmail, setUserEmail]     = useState("");

  // Notify modal state
  const [showNotify, setShowNotify]   = useState(false);
  const [email, setEmail]             = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [subscribed, setSubscribed]   = useState(false);

  // Locale
  useEffect(() => {
    const locale = navigator.language || "default";
    setCurrencyCfg(getCurrencyConfig(locale));
  }, []);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email ?? "");
        setUserEmail(user.email ?? "");
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
      if (session?.user?.email) {
        setEmail(session.user.email);
        setUserEmail(session.user.email);
      }
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // Live prize
  useEffect(() => {
    const fetchPrize = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("prize_pool")
        .eq("status", "completed");
      const total = data?.reduce((acc, c) => acc + (c.prize_pool || 0), 0) ?? 0;
      setPrizeUSD(Math.max(10000, total));
    };
    fetchPrize();
  }, [supabase]);

  const animatedPrize = useCountUp(prizeUSD, inView);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() })
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to subscribe");
      }

      setSubscribed(true);
      toast.success("You're on the list! We'll reach out when tournaments go live.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden pt-20">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-compete-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-compete-purple/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-[80vh] flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onAnimationComplete={() => setInView(true)}
          className="space-y-4"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-compete-purple text-[9px] font-black uppercase tracking-[0.3em]">
            <Trophy size={12} />
            Tournament System
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Coming <span className="text-compete-purple text-glow">Soon</span>
            </h1>
            <p className="text-compete-muted text-sm md:text-base max-w-2xl mx-auto font-medium">
              The ultimate arena for competitive excellence is under construction.
              Prepare your squad for the next generation of staking.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {/* Auth-aware back button */}
            <Link
              href={isLoggedIn ? "/lobby" : "/"}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-compete-purple hover:text-white transition-all rounded-sm"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              {isLoggedIn ? "Back to Lobby" : "Back to Home"}
            </Link>

            {/* Notify Me */}
            <button
              onClick={() => setShowNotify(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm"
            >
              <Bell size={14} />
              Notify Me
            </button>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto border-t border-white/5 pt-8">
            <div className="flex flex-col items-center gap-1">
              <div className="text-compete-purple mb-0.5 opacity-50"><Timer size={14} /></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Systems</span>
              <span className="text-xs font-bold text-white/80">Staging</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-compete-purple mb-0.5 opacity-50"><Trophy size={14} /></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Anti-Cheat</span>
              <span className="text-xs font-bold text-white/80">Active</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="text-compete-purple mb-0.5 opacity-50"><Trophy size={14} /></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Prize Pools</span>
              <span className="text-xs font-bold text-white tabular-nums">
                {formatPrize(animatedPrize, currencyCfg)} Locked
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* ── NOTIFY MODAL ── */}
      <AnimatePresence>
        {showNotify && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowNotify(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              {/* Close */}
              <button
                onClick={() => setShowNotify(false)}
                className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>

              <AnimatePresence mode="wait">
                {!subscribed ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col items-center text-center gap-2 mb-1">
                      <div className="p-3 rounded-xl bg-compete-purple/10 border border-compete-purple/20 text-compete-purple">
                        <Bell size={20} />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-tight">
                        Get Notified
                      </h2>
                      <p className="text-white/40 text-xs max-w-xs">
                        Be the first to know when tournaments go live. We'll send launch details, bracket info, and prize breakdowns directly to your inbox.
                      </p>
                    </div>

                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                        <input
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={submitting}
                          className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-xs text-white placeholder:text-white/20 focus:border-compete-purple focus:bg-white/[0.07] outline-none transition-all disabled:opacity-50"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-compete-purple text-white py-3 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-compete-purple/80 transition-all disabled:opacity-50"
                      >
                        {submitting ? (
                          <><Loader2 size={14} className="animate-spin" /> Subscribing...</>
                        ) : (
                          <><Bell size={14} /> Subscribe</>
                        )}
                      </button>
                      <p className="text-white/20 text-[9px] text-center tracking-wide">
                        No spam. Unsubscribe at any time. We only send tournament-related updates.
                      </p>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center gap-4 py-4"
                  >
                    <div className="p-5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                      <Check size={32} />
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">You're In</h2>
                    <p className="text-white/40 text-sm max-w-xs">
                      <span className="text-white font-bold">{email}</span> has been added to the list. We'll reach out the moment tournaments launch.
                    </p>
                    <button
                      onClick={() => setShowNotify(false)}
                      className="mt-2 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
