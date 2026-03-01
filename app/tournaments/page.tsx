"use client";
import { motion } from "framer-motion";
import { Trophy, Timer, ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";

export default function TournamentsPage() {
  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-compete-purple/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-compete-purple/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-compete-purple text-[10px] font-black uppercase tracking-[0.3em]">
            <Trophy size={14} />
            Tournament System
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
              Coming <span className="text-compete-purple text-glow">Soon</span>
            </h1>
            <p className="text-compete-muted text-lg md:text-xl max-w-2xl mx-auto font-medium">
              The ultimate arena for competitive excellence is under construction.
              Prepare your squad for the next generation of staking.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/lobby"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-compete-purple hover:text-white transition-all rounded-sm"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Back to Lobby
            </Link>
            <button className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-sm">
              <Bell size={16} />
              Notify Me
            </button>
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto border-t border-white/5 pt-12">
            {[
              { label: "Systems", value: "Staging", icon: <Timer size={16} /> },
              { label: "Anti-Cheat", value: "Active", icon: <Trophy size={16} /> },
              { label: "Prize Pools", value: "$50k+ Locked", icon: <Trophy size={16} /> }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="text-compete-purple mb-1 opacity-50">{item.icon}</div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{item.label}</span>
                <span className="text-sm font-bold text-white/80">{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    </main>
  );
}
