"use client";
import { motion } from "framer-motion";
import { Medal, Flame } from "lucide-react";

const TOP_PLAYERS = [
  { rank: 1, name: "NeonSlayer", score: "2,840", winRate: "82%", avatar: "🟣" },
  { rank: 2, name: "VoidWalker", score: "2,610", winRate: "78%", avatar: "⚪" },
  { rank: 3, name: "GhostPixel", score: "2,450", winRate: "75%", avatar: "⚫" },
  { rank: 4, name: "CyberPulse", score: "2,100", winRate: "71%", avatar: "🔘" },
];

export default function Leaderboard() {
  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
          Hall of <span className="text-compete-purple">Fame</span>
        </h2>
        <p className="text-compete-muted mt-2">The top competitors this season</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-compete-card/30 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-compete-muted text-xs uppercase tracking-widest">
              <th className="p-6">Rank</th>
              <th className="p-6">Player</th>
              <th className="p-6">Score</th>
              <th className="p-6">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {TOP_PLAYERS.map((player) => (
              <tr key={player.rank} className="hover:bg-compete-purple/5 transition-colors group">
                <td className="p-6 font-bold">
                  {player.rank <= 3 ? (
                    <Medal className={player.rank === 1 ? "text-yellow-400" : "text-compete-muted"} size={20} />
                  ) : (
                    <span className="text-compete-muted ml-1">{player.rank}</span>
                  )}
                </td>
                <td className="p-6 flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <span className="font-bold text-white group-hover:text-compete-purple transition-colors">
                    {player.name}
                  </span>
                  {player.rank === 1 && <Flame size={16} className="text-orange-500 animate-pulse" />}
                </td>
                <td className="p-6 text-white font-mono">{player.score}</td>
                <td className="p-6">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-compete-purple shadow-[0_0_10px_#9B5CFF]" 
                      style={{ width: player.winRate }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}