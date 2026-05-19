"use client";
import React, { useEffect, useRef } from "react";
import Link from 'next/link';
import gsap from "gsap";
import LiveStars from "./LiveStars";

interface HeroProps {
  onJoinClick: () => void;
}

export default function Hero({ onJoinClick }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Staggered fade-up for hero elements
      gsap.fromTo(
        ".hero-anim",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          delay: 0.1
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative flex h-[100dvh] w-full items-end pb-24 md:pb-32 px-6 md:px-12 xl:px-24 overflow-hidden"
    >
      {/* Absolute Black Base Layer */}
      <div className="absolute inset-0 z-[-1] bg-[#020205]" />
      
      {/* Deep Immersive Galaxy Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-screen"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2560&auto=format&fit=crop')" }}
      />
      
      {/* Canvas Layer for live colored stars and shooting stars */}
      <LiveStars />
      
      {/* Heavy primary-to-black gradient overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-compete-bg via-compete-purple/30 to-compete-bg/20" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-compete-bg/90 via-compete-bg/30 to-transparent" />
      
      {/* Content - Pushed to bottom-left third */}
      <div className="relative z-20 flex w-full max-w-3xl flex-col items-start gap-4 font-mono">
        
        {/* Typography Scale Contrast */}
        <div className="flex flex-col">
          {/* Authentic, non-generic prefix */}
          <span className="hero-anim text-2xl md:text-4xl lg:text-5xl font-black tracking-tighter text-white/60 leading-[0.9] uppercase">
            DOMINATE_THE
          </span>
          {/* Second part in anime sci-fi oriented font (inherited globally) */}
          <h1 className="hero-anim text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[9rem] tracking-tight text-compete-purple leading-[0.8] -ml-1 italic font-black">
            ARENA
          </h1>
        </div>

        <p className="hero-anim max-w-lg text-xs md:text-sm text-white/50 leading-relaxed mt-4">
          Zero casual queues. Pure high-stakes brackets. Climb the leaderboards, crush your rivals, and turn mechanical skill into cash payouts.
        </p>

        {/* Action-oriented CTA */}
        <div className="hero-anim mt-6 flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onJoinClick}
            className="rounded-full bg-compete-purple hover:bg-compete-purpleGlow px-8 py-3.5 text-xs font-black tracking-[0.2em] text-white shadow-lg whitespace-nowrap transition-all"
          >
            ENTER MATCHMAKING
          </button>
          
          <Link href="/rankings" className="rounded-full bg-white/5 backdrop-blur-md border border-white/10 px-8 py-3.5 text-xs font-black tracking-[0.2em] text-white hover:bg-white/10 transition-all whitespace-nowrap">
            VIEW LEADERBOARDS
          </Link>
        </div>
      </div>
    </section>
  );
}