"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Timer, Search, Filter, Gamepad2, Swords } from "lucide-react";

const TOURNAMENTS_DATA = [
  {
    id: 1,
    title: "Valorant Champions Arena",
    game: "Valorant",
    prize: "$5,000",
    status: "Live",
    players: "128/128",
    timeLeft: "2h 15m",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070",
    category: "FPS"
  },
  {
    id: 2,
    title: "League of Legends: Rift Rivals",
    game: "League of Legends",
    prize: "$2,500",
    status: "Upcoming",
    players: "42/64",
    timeLeft: "Starts in 5h",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071",
    category: "MOBA"
  },
  {
    id: 3,
    title: "CS2 Global Offensive Elite",
    game: "CS2",
    prize: "$10,000",
    status: "Upcoming",
    players: "12/16 Teams",
    timeLeft: "Starts in 1d",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=2130",
    category: "FPS"
  }
];

export default function TournamentsPage() {
  const [filter, setFilter] = useState("All");

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="h-20" /> {/* Navbar Spacer */}

      {/* Hero Header Section */}
      <section className="relative py-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-compete-purple/10 blur-[120px] rounded-full" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter"
          >
            Active <span className="text-compete-purple">Arenas</span>
          </motion.h1>
          <p className="text-compete-muted mt-4 max-w-2xl mx-auto">
            Compete in the world's most prestigious online tournaments. 
            Prove your skills and climb the global leaderboards.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-30 bg-black/80 backdrop-blur-md border-y border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {["All", "FPS", "MOBA", "Sports", "Battle Royale"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === cat ? "bg-compete-purple text-white shadow-purple-glow" : "bg-white/5 text-compete-muted hover:bg-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Search Tournament..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-compete-purple/50 transition-all"
            />
          </div>
        </div>
      </section>

      {/* Tournaments Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TOURNAMENTS_DATA.map((t) => (
            <motion.div 
              key={t.id}
              whileHover={{ y: -5 }}
              className="bg-compete-card/20 border border-white/5 rounded-2xl overflow-hidden group hover:border-compete-purple/30 transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${
                    t.status === 'Live' ? 'bg-red-500 animate-pulse' : 'bg-compete-purple'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-black uppercase italic leading-tight">{t.title}</h3>
                  <div className="flex items-center gap-1 text-compete-purple">
                    <Trophy size={16} />
                    <span className="font-bold">{t.prize}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-compete-muted text-xs font-bold uppercase tracking-widest mb-6">
                  <div className="flex items-center gap-1"><Gamepad2 size={14}/> {t.game}</div>
                  <div className="flex items-center gap-1"><Users size={14}/> {t.players}</div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-compete-muted text-xs">
                    <Timer size={14} className="text-compete-purple" />
                    {t.timeLeft}
                  </div>
                  <button className="px-6 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-compete-purple hover:text-white transition-all">
                    Register
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}