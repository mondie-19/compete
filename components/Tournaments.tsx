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
  const [prizeUSD, setPrizeUSD] = useState(0);
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
      setPrizeUSD(total);
    };
    fetchPrize();
  }, [supabase]);

  const animatedPrize = useCountUp(prizeUSD, inView);

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden font-mono">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-compete-purple text-xs font-black tracking-[0.2em] mb-2 uppercase">ONGOING EVENTS</h2>
          <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
            ACTIVE TOURNAMENTS
          </h3>
        </div>
        <Link href="/tournaments" className="text-compete-purple text-xs font-black tracking-widest flex items-center gap-2 hover:underline group uppercase">
          CHECK STATUS <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        onViewportEnter={() => setInView(true)}
        className="relative bg-[#0F0F16]/60 border border-white/10 rounded-2xl p-10 md:p-16 overflow-hidden text-center backdrop-blur-md"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 0.95, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center p-5 rounded-full bg-compete-purple/10 text-compete-purple border border-compete-purple/20 mb-6"
        >
          <Trophy size={36} />
        </motion.div>

        <h4 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-4 uppercase">
          ARENA UNDER <span className="text-compete-purple">CONSTRUCTION</span>
        </h4>
        <p className="text-white/40 text-xs max-w-xl mx-auto mb-8 leading-relaxed">
          Tournament features are being built. Fair matches, high stakes, and instant payments are coming soon.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: "PHASE",    value: "DEPLOYMENT" },
            { label: "SECURITY", value: "LOCKED"     },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[9px] font-black tracking-widest text-compete-purple mb-1">{stat.label}</span>
              <span className="text-sm font-black text-white">{stat.value}</span>
            </div>
          ))}
          {/* Live Prize Stat */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black tracking-widest text-compete-purple mb-1">REWARDS</span>
            <span className="text-sm font-black text-white tabular-nums">
              {formatPrize(animatedPrize, currencyCfg)}
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
