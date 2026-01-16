"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Globe, Coins, Target, Users } from "lucide-react";

export default function AboutSection() {
  const perks = [
    {
      title: "Instant Payouts",
      desc: "No more waiting weeks for your prize. Our smart-contracts trigger payments the second victory is confirmed.",
      icon: <Zap className="text-yellow-400" />,
      grid: "md:col-span-2",
      bg: "bg-yellow-400/5"
    },
    {
      title: "Pro Anti-Cheat",
      desc: "Kernel-level protection ensuring every match is 100% fair.",
      icon: <ShieldCheck className="text-blue-400" />,
      grid: "md:col-span-1",
      bg: "bg-blue-400/5"
    },
    {
      title: "Global Reach",
      desc: "Compete with the best from every continent on low-latency servers.",
      icon: <Globe className="text-compete-purple" />,
      grid: "md:col-span-1",
      bg: "bg-compete-purple/5"
    },
    {
      title: "Zero Entry Fees",
      desc: "Access our 'Founders Arenas' for free and build your bankroll from scratch.",
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
        >
          <h2 className="text-xs font-black tracking-[0.4em] text-compete-purple uppercase mb-4">
            The New Standard
          </h2>
          <h3 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-6">
            We are the <span className="text-compete-purple text-glow">Frontier</span> of Digital Combat.
          </h3>
          <p className="text-compete-muted text-lg leading-relaxed mb-8">
            Compete was born from a simple frustration: professional gaming shouldn't be gated by politics or slow bureaucracies. We built a decentralized arena where skill is the only currency that matters.
          </p>
          <div className="flex gap-8">
            <div>
              <p className="text-3xl font-black italic">500K+</p>
              <p className="text-xs uppercase font-bold text-compete-muted tracking-widest">Active Players</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div>
              <p className="text-3xl font-black italic">$2.4M</p>
              <p className="text-xs uppercase font-bold text-compete-muted tracking-widest">Prizes Paid</p>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="absolute inset-0 bg-compete-purple/20 blur-[100px] rounded-full" />
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070" 
            alt="Gaming Culture" 
            className="relative z-10 rounded-3xl border border-white/10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl"
          />
        </div>
      </section>

      {/* --- PERKS & BENEFITS SECTION --- */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-xl">
            <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">
              Why players <span className="text-compete-purple">Choose Us</span>
            </h3>
          </div>
          <p className="text-compete-muted text-sm max-w-xs md:text-right">
            Engineered by pro-gamers, for pro-gamers. Every feature is designed for speed and security.
          </p>
        </div>

        {/* Bento Grid Layout */}
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