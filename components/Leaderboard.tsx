"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Medal, Flame, Zap, ChevronRight } from "lucide-react";
import { createClient } from "@/supabase/client";
import Link from "next/link";

export default function Leaderboard() {
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchRankings = async () => {
      const { data } = await supabase
        .from("user_rankings")
        .select("*")
        .limit(4);

      setTopPlayers(data || []);
      setLoading(false);
    };

    fetchRankings();
  }, [supabase]);
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
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-white/20 italic font-black uppercase tracking-widest animate-pulse">
                  Synchronizing Global Standings...
                </td>
              </tr>
            ) : topPlayers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-white/20 italic font-black uppercase tracking-widest">
                  No Match Data Found
                </td>
              </tr>
            ) : (
              topPlayers.map((player) => (
                <tr key={player.rank} className="hover:bg-compete-purple/5 transition-colors group">
                  <td className="p-6 font-bold">
                    {player.rank <= 3 ? (
                      <Medal className={player.rank === 1 ? "text-yellow-400" : "text-compete-muted"} size={20} />
                    ) : (
                      <span className="text-compete-muted ml-1">{player.rank}</span>
                    )}
                  </td>
                  <td className="p-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl overflow-hidden">
                      {player.avatar_url ? (
                        <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-black italic text-compete-purple">{player.username[0]}</span>
                      )}
                    </div>
                    <span className="font-bold text-white group-hover:text-compete-purple transition-colors">
                      {player.username}
                    </span>
                    {player.rank === 1 && <Flame size={16} className="text-orange-500 animate-pulse" />}
                  </td>
                  <td className="p-6 text-white font-mono font-black italic">${player.total_earnings.toLocaleString()}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/40 uppercase w-8">{player.win_rate}%</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden min-w-[100px]">
                        <div
                          className="h-full bg-compete-purple shadow-[0_0_10px_#9B5CFF]"
                          style={{ width: `${player.win_rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </motion.div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/rankings"
          className="group flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all shadow-xl"
        >
          View Full Hall of Fame
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}