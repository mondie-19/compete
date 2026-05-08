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
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
          What Competitors <span className="text-compete-purple">Say</span>
        </h2>
        <p className="text-compete-muted mt-2">Hear from real competitors cashing out on the platform</p>
      </div>

      <div className="relative h-80">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="h-full bg-compete-card/30 border border-white/5 rounded-2xl p-8 flex gap-8 items-stretch">
              <div
                className="w-48 h-full rounded-lg bg-cover bg-center flex-shrink-0 hidden md:block"
                style={{ backgroundImage: `url(${REVIEWS[current].bg})` }}
              />
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
                      {REVIEWS[current].avatar}
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">{REVIEWS[current].name}</p>
                      <p className="text-sm text-compete-muted">{REVIEWS[current].title}</p>
                    </div>
                  </div>
                  <p className="text-white italic leading-relaxed text-lg">{REVIEWS[current].text}</p>
                </div>
                <div className="text-compete-purple font-bold text-xl">{REVIEWS[current].rating}★</div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-14 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-compete-purple" />
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-14 p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronRight size={24} className="text-compete-purple" />
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
