"use client";
import { motion } from "framer-motion";
import { Trophy, ArrowUpRight } from "lucide-react";
import Link from 'next/link';
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";

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
  if (val >= 1_000_000) return `${cfg.symbol}${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000)    return `${cfg.symbol}${(val / 1_000).toFixed(0)}K`;
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

export default function Tournaments() {
  const supabase = createClient();
  const [prizeUSD, setPrizeUSD] = useState(10000);
  const [inView, setInView] = useState(false);
  const [currencyCfg, setCurrencyCfg] = useState(CURRENCY_CONFIG["default"]);

  useEffect(() => {
    const locale = navigator.language || "default";
    setCurrencyCfg(getCurrencyConfig(locale));
  }, []);

  useEffect(() => {
    const fetchPrize = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("prize_pool")
        .eq("status", "resolved");

      const total = data?.reduce((acc, c) => acc + (c.prize_pool || 0), 0) ?? 0;
      setPrizeUSD(Math.max(10000, total));
    };
    fetchPrize();
  }, [supabase]);

  const animatedPrize = useCountUp(prizeUSD, inView);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-compete-purple/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-compete-purple font-bold tracking-widest mb-2">Ongoing Events</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
            Active Tournaments
          </h3>
        </div>
        <Link href="/tournaments">
          <button className="text-compete-purple font-bold flex items-center gap-2 hover:underline group">
            Check Status <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onViewportEnter={() => setInView(true)}
        className="relative bg-compete-card/30 border border-white/5 rounded-3xl p-12 md:p-20 overflow-hidden text-center backdrop-blur-sm"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 0.9, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center p-6 rounded-2xl bg-compete-purple/20 text-compete-purple mb-8"
        >
          <Trophy size={48} />
        </motion.div>

        <h4 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-4">
          Arena Under <span className="text-compete-purple">Construction</span>
        </h4>
        <p className="text-compete-muted text-lg max-w-xl mx-auto mb-10">
          Tournament infrastructure is being finalised. High-stakes brackets, fair match rules, and instant disbursements — launching soon.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: "Phase",    value: "Deployment" },
            { label: "Security", value: "Locked"     },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] font-black tracking-widest text-compete-purple mb-1">{stat.label}</span>
              <span className="text-xl font-bold text-white">{stat.value}</span>
            </div>
          ))}
          {/* Live Prize Stat */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black tracking-widest text-compete-purple mb-1">Rewards</span>
            <span className="text-xl font-bold text-white tabular-nums">
              {formatPrize(animatedPrize, currencyCfg)}
            </span>
          </div>
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      </motion.div>
    </section>
  );
}
