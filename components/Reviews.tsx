"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const REVIEWS = [
  {
    id: 1,
    name: "RazeMaster",
    title: "High-roller Competitor",
    avatar: "⚡",
    rating: 5,
    bg: "https://images.unsplash.com/photo-1538481143235-5d630e3fbc45?w=400&h=300&fit=crop",
    text: "The fastest payouts I've ever seen. Pure skill-based matchmaking where I can actually turn my gaming hours into raw cash.",
  },
  {
    id: 2,
    name: "LunarFox",
    title: "Streamer & Competitor",
    avatar: "🌙",
    rating: 5,
    bg: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
    text: "No amateur hour here. Best wager brackets on the market. The stakes are real, and the competitors are serious.",
  },
  {
    id: 3,
    name: "Arcane",
    title: "Esports Analyst",
    avatar: "🔮",
    rating: 4,
    bg: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
    text: "I stopped playing for amusement. The transparent leaderboards and rapid matchmaking let me grind cash games all night.",
  },
  {
    id: 4,
    name: "PhantomX",
    title: "FPS Competitor",
    avatar: "👻",
    rating: 5,
    bg: "https://images.unsplash.com/photo-1516762898749-f1c4e7c51f55?w=400&h=300&fit=crop",
    text: "High-stakes. Zero latency. Instant payouts. If you want to put your money where your mouth is, this is the only platform you need.",
  },
];

export default function Reviews() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % REVIEWS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % REVIEWS.length);
  const prev = () => setCurrent((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto font-mono">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">
          WHAT COMPETITORS <span className="text-compete-purple">SAY</span>
        </h2>
        <p className="text-white/40 text-xs mt-2">Hear from real competitors cashing out on the platform</p>
      </div>

      <div className="relative min-h-[520px] md:h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="h-full bg-[#0F0F16]/60 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-stretch relative backdrop-blur-md">
              <div
                className="w-full md:w-48 h-32 md:h-full rounded-xl bg-cover bg-center flex-shrink-0 border border-white/10"
                style={{ backgroundImage: `url(${REVIEWS[current].bg})` }}
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      {REVIEWS[current].avatar}
                    </div>
                    <div>
                      <p className="font-black text-white text-base uppercase">{REVIEWS[current].name}</p>
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-wider">{REVIEWS[current].title}</p>
                    </div>
                  </div>
                  <p className="text-white/70 italic leading-relaxed text-xs">"{REVIEWS[current].text}"</p>
                </div>
                <div className="text-compete-purple font-black text-sm pt-4">{REVIEWS[current].rating} / 5 STAR</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-14 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <ChevronLeft size={20} className="text-compete-purple" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-14 p-2 hover:bg-white/10 rounded-full transition-colors z-20"
        >
          <ChevronRight size={20} className="text-compete-purple" />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === current ? "bg-compete-purple w-6" : "bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
