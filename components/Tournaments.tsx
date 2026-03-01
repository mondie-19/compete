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
    <section className="py-24 px-4 max-w-7xl mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-64 bg-compete-purple/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-compete-purple font-bold tracking-widest uppercase mb-2">Ongoing Events</h2>
          <h3 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
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
        className="relative bg-compete-card/30 border border-white/5 rounded-3xl p-12 md:p-20 overflow-hidden text-center backdrop-blur-sm"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center p-6 rounded-2xl bg-compete-purple/20 text-compete-purple mb-8"
        >
          <Trophy size={48} />
        </motion.div>

        <h4 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
          Arena Under <span className="text-compete-purple">Construction</span>
        </h4>
        <p className="text-compete-muted text-lg max-w-xl mx-auto mb-10">
          We're engineering a revolutionary tournament experience.
          High stakes, fair play, and instant rewards are being forged as we speak.
        </p>

        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: "Phase", value: "Deployment" },
            { label: "Security", value: "Locked" },
            { label: "Rewards", value: "$50,000" }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-compete-purple mb-1">{stat.label}</span>
              <span className="text-xl font-bold text-white">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      </motion.div>
    </section>
  );
}
