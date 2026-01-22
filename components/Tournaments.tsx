"use client";
import { motion } from "framer-motion";
import { Trophy, Users, Clock, ArrowUpRight } from "lucide-react";
import Link from 'next/link';

const TOURNAMENTS = [
  {
    id: 1,
    title: "Pro League Masters",
    game: "Valorant",
    prize: "$50,000",
    date: "Starts in 2h",
    slots: "48/64",
    status: "Live",
  },
  {
    id: 2,
    title: "Shadow Strike Cup",
    game: "CS:GO 2",
    prize: "$15,000",
    date: "Tomorrow",
    slots: "120/128",
    status: "Open",
  },
  {
    id: 3,
    title: "Neon City Brawl",
    game: "League of Legends",
    prize: "$25,000",
    date: "Jan 20",
    slots: "12/32",
    status: "Open",
  },
];

export default function Tournaments() {
  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-compete-purple font-bold tracking-widest uppercase mb-2">Ongoing Events</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
            Active Tournaments
          </h3>
        </div>
        <Link href="/tournaments">
          <button className="text-compete-purple font-bold flex items-center gap-2 hover:underline">
            View All <ArrowUpRight size={20} />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TOURNAMENTS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="group relative bg-compete-card/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-compete-purple/50 transition-all duration-300 card-hover"
          >
            {/* Status Badge */}
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                t.status === 'Live' ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-compete-purple/20 text-compete-purple'
              }`}>
                {t.status}
              </span>
              <Trophy className="text-compete-purple/50 group-hover:text-compete-purple transition-colors" />
            </div>

            <h4 className="text-2xl font-bold text-white mb-1">{t.title}</h4>
            <p className="text-compete-muted text-sm mb-6">{t.game}</p>

            <div className="space-y-3 border-t border-white/5 pt-6">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-compete-muted"><Clock size={16}/> {t.date}</span>
                <span className="text-white font-bold">{t.prize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-compete-muted"><Users size={16}/> Registered</span>
                <span className="text-white font-bold">{t.slots}</span>
              </div>
            </div>

            <button className="w-full mt-8 py-3 rounded-xl bg-white/5 text-white font-bold uppercase tracking-widest btn-glow hover:bg-compete-purple hover:text-white">
              Join Tournament
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}