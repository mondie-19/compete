"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Coins } from "lucide-react";
import { createClient } from "@/supabase/client";

// Currency config per locale
const CURRENCY_CONFIG: Record<string, { symbol: string; code: string; rate: number }> = {
  "en-KE": { symbol: "KSh", code: "KES", rate: 129 },
  "sw-KE": { symbol: "KSh", code: "KES", rate: 129 },
  "en-NG": { symbol: "₦",   code: "NGN", rate: 1580 },
  "en-GH": { symbol: "₵",   code: "GHS", rate: 15   },
  "en-ZA": { symbol: "R",   code: "ZAR", rate: 18.5 },
  "en-UG": { symbol: "USh", code: "UGX", rate: 3740 },
  "en-TZ": { symbol: "TSh", code: "TZS", rate: 2570 },
  "en-GB": { symbol: "£",   code: "GBP", rate: 0.79 },
  "en-EU": { symbol: "€",   code: "EUR", rate: 0.92 },
  "fr-FR": { symbol: "€",   code: "EUR", rate: 0.92 },
  "de-DE": { symbol: "€",   code: "EUR", rate: 0.92 },
  "default": { symbol: "$", code: "USD", rate: 1    },
};

function getCurrencyConfig(locale: string) {
  if (CURRENCY_CONFIG[locale]) return CURRENCY_CONFIG[locale];
  const lang = locale.split("-")[0];
  const match = Object.entries(CURRENCY_CONFIG).find(([k]) => k.startsWith(lang));
  return match ? match[1] : CURRENCY_CONFIG["default"];
}

function formatPrize(usd: number, cfg: { symbol: string; rate: number }) {
  const val = usd * cfg.rate;
  if (val >= 1_000_000) return `${cfg.symbol}${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)    return `${cfg.symbol}${(val / 1_000).toFixed(0)}K`;
  return `${cfg.symbol}${val.toFixed(0)}`;
}

function formatUsers(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M+`;
  if (count >= 1_000)    return `${(count / 1_000).toFixed(0)}K+`;
  return `${count}+`;
}

// Animates a number from 0 to target over ~1.5s
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

export default function AboutSection() {
  const supabase = createClient();
  const [userCount, setUserCount]   = useState(10000);
  const [prizeUSD, setPrizeUSD]     = useState(50000);
  const [inView, setInView]         = useState(false);
  const [currencyCfg, setCurrencyCfg] = useState(CURRENCY_CONFIG["default"]);

  // Detect locale for currency
  useEffect(() => {
    const locale = navigator.language || "default";
    setCurrencyCfg(getCurrencyConfig(locale));
  }, []);

  // Fetch live stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      // User count: total profiles
      const { count: profileCount } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });

      // Total prizes paid: sum of prize_pool on completed challenges
      const { data: prizeData } = await supabase
        .from("challenges")
        .select("prize_pool")
        .eq("status", "resolved");

      const totalPrize = prizeData?.reduce((acc, c) => acc + (c.prize_pool || 0), 0) ?? 0;

      // Use live data if meaningful, otherwise keep seeded floor
      setUserCount(Math.max(10000, profileCount ?? 0));
      setPrizeUSD(Math.max(50000, totalPrize));
    };

    fetchStats();
  }, [supabase]);

  const animatedUsers = useCountUp(userCount, inView);
  const animatedPrize = useCountUp(prizeUSD, inView);

  const perks = [
    {
      title: "Instant Payouts",
      desc: "Funds move the moment match results are verified. No delays, no disputes left pending indefinitely.",
      icon: <Zap className="text-yellow-400" />,
      grid: "md:col-span-2",
      bg: "bg-yellow-400/5"
    },
    {
      title: "Pro Anti-Cheat",
      desc: "Every match is monitored. Suspicious activity is flagged, reviewed, and actioned swiftly.",
      icon: <ShieldCheck className="text-blue-400" />,
      grid: "md:col-span-1",
      bg: "bg-blue-400/5"
    },
    {
      title: "Global Reach",
      desc: "Challengers from across Africa, Europe, and beyond. One arena, no borders.",
      icon: <Globe className="text-compete-purple" />,
      grid: "md:col-span-1",
      bg: "bg-compete-purple/5"
    },
    {
      title: "Skill-Based Entry",
      desc: "Stakes range from beginner wagers to high-tier deployments. Every level is competitive.",
      icon: <Coins className="text-green-400" />,
      grid: "md:col-span-2",
      bg: "bg-green-400/5"
    }
  ];

  return (
    <div className="bg-black text-white">
      {/* --- ABOUT US SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onViewportEnter={() => setInView(true)}
        >
          <h2 className="text-xs font-black tracking-[0.4em] text-compete-purple uppercase mb-4">
            The New Standard
          </h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">
            We are the <span className="text-compete-purple text-glow">Frontier</span> of Cash Bouts.
          </h3>
          <p className="text-compete-muted text-lg leading-relaxed mb-8">
            Compete was built to settle one argument: that raw mechanical skill deserves a cash return. Stop playing for nothing. Wager, outplay, and collect — no middlemen.
          </p>

          {/* Live Stats */}
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-black italic tabular-nums">
                {formatUsers(animatedUsers)}
              </p>
              <p className="text-xs uppercase font-bold text-compete-muted tracking-widest mt-1">
                Registered Competitors
              </p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl font-black italic tabular-nums">
                {formatPrize(animatedPrize, currencyCfg)}
              </p>
              <p className="text-xs uppercase font-bold text-compete-muted tracking-widest mt-1">
                Prizes Paid Out
              </p>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 bg-compete-purple/20 blur-[100px] rounded-full" />
          <img
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070"
            alt="Competitive gaming"
            className="relative z-10 rounded-3xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
        </div>
      </section>

      {/* --- PERKS & BENEFITS SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
              Why competitors <span className="text-compete-purple">Choose Us</span>
            </h3>
          </div>
          <p className="text-compete-muted text-sm max-w-xs md:text-right">
            Built by people who understand competitive gaming — not boardrooms. Every feature ships to serve the player first.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {perks.map((perk, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className={`${perk.grid} ${perk.bg} border border-white/5 rounded-3xl p-8 flex flex-col justify-between group transition-all`}
            >
              <div className="mb-12">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-compete-purple/50 transition-colors">
                  {perk.icon}
                </div>
                <h4 className="text-2xl font-bold uppercase italic mb-3">{perk.title}</h4>
                <p className="text-compete-muted text-sm leading-relaxed">{perk.desc}</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-compete-purple transition-colors">
                System Active <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}