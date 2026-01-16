"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Crown, Award } from "lucide-react";

const RANKINGS_DATA = [
  { rank: 1, name: "NeonSlayer", xp: "154,200", winRate: "78%", trend: "up", avatar: "🎮", profilePic: "👨‍💻" },
  { rank: 2, name: "ShadowStep", xp: "142,800", winRate: "72%", trend: "down", avatar: "👤", profilePic: "🧑‍🎮" },
  { rank: 3, name: "VoidWalker", xp: "139,500", winRate: "71%", trend: "up", avatar: "🌌", profilePic: "👩‍💻" },
  { rank: 4, name: "PulseFire", xp: "128,100", winRate: "65%", trend: "neutral", avatar: "🔥", profilePic: "🧔" },
  { rank: 5, name: "ArcticFox", xp: "115,400", winRate: "63%", trend: "up", avatar: "🦊", profilePic: "👱" },
];

export default function RankingsPage() {
  return (
    <main className="relative min-h-screen bg-compete-bg text-white px-6 overflow-hidden">
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

      <div className="h-20" /> {/* Navbar Spacer */}

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <section className="py-16 text-center">
          <p className="text-compete-purple font-bold tracking-widest uppercase mb-2">GLOBAL LEADERBOARD</p>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Top Players
          </h1>
          <p className="text-compete-muted max-w-2xl mx-auto">Join the elite competitive scene and earn your place on the leaderboard</p>
        </section>

        {/* Top 3 Cards */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:items-end">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all order-2 md:order-1 h-full"
            >
              <div className="relative h-40 bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-5xl overflow-hidden group">
                {RANKINGS_DATA[1].avatar}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-slate-300">2</span>
                  <Award className="text-slate-300" size={24} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">{RANKINGS_DATA[1].profilePic}</div>
                  <h3 className="text-lg font-bold">{RANKINGS_DATA[1].name}</h3>
                </div>
                <p className="text-sm text-compete-muted mb-4">{RANKINGS_DATA[1].xp} XP • {RANKINGS_DATA[1].winRate} WR</p>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-slate-400 rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-compete-purple/20 to-compete-purple/5 border border-compete-purple/30 rounded-2xl overflow-hidden hover:border-compete-purple/50 transition-all order-1 md:order-2 h-full"
            >
              <div className="relative h-56 bg-gradient-to-br from-compete-purple/40 to-purple-900 flex items-center justify-center text-6xl overflow-hidden group">
                {RANKINGS_DATA[0].avatar}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-black text-compete-purple">1</span>
                  <Crown className="text-yellow-400" size={28} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-compete-purple/50 flex items-center justify-center text-2xl">{RANKINGS_DATA[0].profilePic}</div>
                  <h3 className="text-xl font-bold">{RANKINGS_DATA[0].name}</h3>
                </div>
                <p className="text-sm text-compete-muted mb-4">{RANKINGS_DATA[0].xp} XP • {RANKINGS_DATA[0].winRate} WR</p>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-compete-purple rounded-full" />
                </div>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all order-3 md:order-3 h-full"
            >
              <div className="relative h-28 bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-5xl overflow-hidden group">
                {RANKINGS_DATA[2].avatar}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-amber-600">3</span>
                  <Award className="text-amber-600" size={24} />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xl">{RANKINGS_DATA[2].profilePic}</div>
                  <h3 className="text-lg font-bold">{RANKINGS_DATA[2].name}</h3>
                </div>
                <p className="text-sm text-compete-muted mb-4">{RANKINGS_DATA[2].xp} XP • {RANKINGS_DATA[2].winRate} WR</p>
                <div className="h-1 bg-gradient-to-r from-white/5 to-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-amber-600 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Full Rankings */}
        <section>
          <h2 className="text-2xl font-bold mb-6">All Players</h2>
          <div className="space-y-3">
            {RANKINGS_DATA.map((player, idx) => (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all group"
              >
                <div className="text-2xl font-black text-compete-purple/60 w-8 text-center">
                  #{player.rank}
                </div>
                <div className="text-2xl">{player.avatar}</div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-white">{player.name}</h4>
                  <p className="text-xs text-compete-muted">{player.xp} XP</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{player.winRate}</p>
                  <p className="text-xs text-compete-muted">Win Rate</p>
                </div>
                <div className="w-6 flex justify-center">
                  {player.trend === "up" && <TrendingUp className="text-green-400" size={18} />}
                  {player.trend === "down" && <TrendingDown className="text-red-400" size={18} />}
                  {player.trend === "neutral" && <Minus className="text-white/20" size={18} />}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}