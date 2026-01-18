"use client";
import { motion } from "framer-motion";

// Define the interface for the props
interface HeroProps {
  onJoinClick: () => void;
}

export default function Hero({ onJoinClick }: HeroProps) {
  return (
    <section className="relative flex h-[calc(100vh-80px)] items-center justify-center px-4">
      
      {/* 10% SIZE INCREASE: max-w-xl -> max-w-2xl, p-12 -> p-14 */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-compete-card/30 p-8 md:p-14 backdrop-blur-xl shadow-purple-glow"
      >
        
        {/* Hero Text Content */}
        <div className="mt-1 text-center">
          {/* FONT INCREASE: text-5xl -> text-6xl */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-white leading-none"
          >
            Unleash Your <br /> 
            <span className="text-compete-purple drop-shadow-[0_0_20px_rgba(155,92,255,0.8)]">Power</span>
          </motion.h1>

          {/* PARAGRAPH INCREASE: text-sm -> text-base, mt-4 -> mt-6 */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-6 max-w-sm text-base text-compete-muted leading-relaxed"
          >
            The world&apos;s premier platform for high-stakes esports. 
            Join millions of players competing for glory and rewards.
          </motion.p>

          {/* BUTTON INCREASE: px-6 py-2.5 -> px-8 py-3, text-xs -> text-sm */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col md:flex-row items-center justify-center gap-5"
          >
            <button 
              onClick={onJoinClick}
              className="px-8 py-3 bg-compete-purple text-white text-sm font-bold uppercase tracking-widest rounded-full btn-glow shadow-[0_0_25px_rgba(155,92,255,0.5)] cursor-pointer"
            >
              Start Your Journey
            </button>
            <button className="text-white text-sm font-bold uppercase tracking-widest hover:text-compete-purple transition-colors cursor-pointer">
              View Rankings —
            </button>
          </motion.div>
        </div>

        {/* Subtle Decorative Hexagon Grid Overlay */}
        <div className="absolute inset-0 z-[-1] opacity-15 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]" />
      </motion.div>

      {/* Background Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <div 
          key={i}
          className="particle"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 2.5}px`,
            height: `${Math.random() * 2.5}px`,
            animationDelay: `${Math.random() * 10}s`,
            background: i % 2 === 0 ? '#9B5CFF' : 'white'
          } as any}
        />
      ))}
    </section>
  );
}