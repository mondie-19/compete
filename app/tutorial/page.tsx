"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Info, Star, Shield, Zap, Target } from "lucide-react";

const GALAXY_TIPS = [
  { icon: <Star size={14} />, text: "Tip: Check your Vault daily to see your balance and payouts.", color: "text-yellow-400" },
  { icon: <Shield size={14} />, text: "Tip: Always record your matches to guarantee quick dispute decisions.", color: "text-blue-400" },
  { icon: <Zap size={14} />, text: "Tip: Go to the Lobby to find open matches instantly.", color: "text-compete-purple" },
  { icon: <Target size={14} />, text: "Tip: View the Rankings tab to see the top players.", color: "text-green-400" },
  { icon: <Info size={14} />, text: "Tip: Read the match rules carefully before you start playing.", color: "text-white" },
  { icon: <Star size={14} />, text: "Tip: Make sure you double-check your match settings before starting.", color: "text-red-400" },
  { icon: <Zap size={14} />, text: "Tip: You can request cash withdrawals directly from your Vault.", color: "text-cyan-400" }
];

function GalaxyTip({ tip, delay }: { tip: any, delay: number }) {
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const randomTop = Math.floor(Math.random() * 80) + 10;
    const randomLeft = Math.floor(Math.random() * 80) + 10;
    setPosition({ top: `${randomTop}%`, left: `${randomLeft}%` });
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className="absolute group z-0"
      style={{
        top: position.top,
        left: position.left,
        animation: `float 10s infinite linear`,
        animationDelay: `${delay}s`
      }}
    >
      <div className={`h-1.5 w-1.5 rounded-full bg-current ${tip.color} cursor-help shadow-[0_0_10px_currentColor]`} />
      
      {/* Brutalist Tooltip */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 font-mono">
        <div className="bg-[#0A0A0F] border border-white/20 rounded-xl p-3 shadow-xl backdrop-blur-sm text-left">
          <div className={`flex items-center gap-2 mb-1 ${tip.color}`}>
            {tip.icon}
            <span className="text-[9px] font-black uppercase tracking-wider">ALERT</span>
          </div>
          <p className="text-[9px] text-white/60 leading-relaxed">{tip.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function TutorialPage() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = [...Array(15)].map((_, i) => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
      animationDelay: `${Math.random() * 5}s`,
      background: i % 3 === 0 ? '#9B5CFF' : 'rgba(255, 255, 255, 0.1)'
    }));
    setParticles(generated);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white relative overflow-hidden pt-24 pb-20 font-mono">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle rounded-full"
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

      {/* Galaxy Tips */}
      <div className="absolute inset-0 overflow-hidden pointer-events-auto">
        {GALAXY_TIPS.map((tip, i) => (
          <GalaxyTip key={i} tip={tip} delay={i * 0.5} />
        ))}
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-white/40 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          BACK TO HOME
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 italic">
            HOW TO COMPETE
          </h1>
          <p className="text-white/40 text-xs leading-relaxed max-w-2xl">
            Welcome to Compete! Follow this simple step-by-step guide to start playing matches, staking your rewards, and safely collecting your winnings. Hover over the glowing alert dots on this page for helpful, quick tips!
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <section className="bg-transparent border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-8 rounded-full border border-compete-purple text-compete-purple flex items-center justify-center font-black text-xs">
                01
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">STARTING A MATCH</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Ready for a game? Go to the <Link href="/deploy" className="text-compete-purple hover:underline font-bold">[ DEPLOY ]</Link> page. Choose the game you want to play, enter your exact game details, and select the amount you want to stake on the outcome.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-compete-purple font-black">&raquo;</span>
                    Enter your exact in-game ID inside the deployment page.
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-compete-purple font-black">&raquo;</span>
                    Agree on how many rounds you will play before starting.
                  </li>
                </ul>
              </div>
              <div className="border border-white/5 bg-[#0D0D14] rounded-xl p-4 flex items-center justify-center text-center">
                <div>
                  <Target className="w-6 h-6 text-compete-purple mx-auto mb-2 opacity-50" />
                  <p className="text-[8px] font-black tracking-[0.2em] text-white/30 uppercase">MATCH SETTINGS</p>
                </div>
              </div>
            </div>
          </section>

          {/* CRITICAL BEST PRACTICE BANNER */}
          <section className="bg-compete-purple/10 border border-compete-purple/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-compete-purple" size={18} />
              <h3 className="text-xs font-black uppercase tracking-widest text-white">BEST PRACTICES: SCREENSHOTS & INSTANT RESOLUTION</h3>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed mb-4">
              To make sure you get paid immediately and resolve any disputes easily, follow these key best practices:
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-[10px]">
              <div className="border border-white/10 p-3 bg-black/40 rounded-lg">
                <p className="font-bold text-compete-purple uppercase tracking-wider mb-1">&bull; BEFORE THE GAME</p>
                <p className="text-white/40 leading-relaxed">
                  Take a screenshot of the game lobby or match invite showing both players' names. This proves both of you are ready and connected.
                </p>
              </div>
              <div className="border border-white/10 p-3 bg-black/40 rounded-lg">
                <p className="font-bold text-compete-purple uppercase tracking-wider mb-1">&bull; AFTER THE GAME</p>
                <p className="text-white/40 leading-relaxed">
                  Take a screenshot of the final score screen as soon as the game ends. This provides solid proof of who won the match.
                </p>
              </div>
              <div className="border border-white/10 p-3 bg-black/40 rounded-lg">
                <p className="font-bold text-compete-purple uppercase tracking-wider mb-1">&bull; INSTANT RESOLUTION</p>
                <p className="text-white/40 leading-relaxed">
                  Always agree on who won! If both you and your opponent report the same winner, the match will be resolved and payouts released instantly.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-transparent border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-8 rounded-full border border-blue-500 text-blue-400 flex items-center justify-center font-black text-xs">
                02
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">REPORTING RESULTS & DISPUTES</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-white/5 bg-[#0D0D14] rounded-xl p-4 flex items-center justify-center text-center">
                <div>
                  <Shield className="w-6 h-6 text-blue-400 mx-auto mb-2 opacity-50" />
                  <p className="text-[8px] font-black tracking-[0.2em] text-white/30 uppercase">DISPUTE CENTER</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  Both you and your opponent report who won. If your reports match, the winner gets paid instantly. If your reports do not match, a moderator will review your screenshots to declare the winner.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-blue-400 font-black">&raquo;</span>
                    You must report your match results before starting a new one.
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-blue-400 font-black">&raquo;</span>
                    Reporting fake or incorrect results will result in an account ban.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-transparent border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-8 w-8 rounded-full border border-green-500 text-green-400 flex items-center justify-center font-black text-xs">
                03
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">MANAGING YOUR VAULT</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-white/60 leading-relaxed mb-4">
                  The Vault is your secure personal digital wallet. Use it to check your transaction history, lock your funds, and request quick cash withdrawals.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-green-400 font-black">&raquo;</span>
                    Withdrawal requests are processed directly and securely to your bank.
                  </li>
                  <li className="flex items-start gap-2 text-[10px] text-white/40 uppercase tracking-wide">
                    <span className="text-green-400 font-black">&raquo;</span>
                    Keep your account verification details up to date inside your dashboard.
                  </li>
                </ul>
              </div>
              <div className="border border-white/5 bg-[#0D0D14] rounded-xl p-4 flex items-center justify-center text-center">
                <div>
                  <Zap className="w-6 h-6 text-green-400 mx-auto mb-2 opacity-50" />
                  <p className="text-[8px] font-black tracking-[0.2em] text-white/30 uppercase">SAFE PAYOUTS</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/lobby" className="inline-block bg-white text-black px-8 py-3 rounded-full text-xs font-black tracking-[0.2em] border border-white hover:bg-transparent hover:text-white transition-all">
            ENTER THE LOBBY
          </Link>
        </div>
      </div>
    </main>
  );
}
