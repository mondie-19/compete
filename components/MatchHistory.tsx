import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy, Target, Clock, Users } from "lucide-react";
import BlackHoleLoader from "@/components/BlackHoleLoader";
import { createClient } from "@/supabase/client";

export default function MatchHistory() {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("challenges")
        .select(`
          id,
          game_name,
          prize_pool,
          winner_id,
          resolved_at,
          host_id,
          opponent_id,
          host:profiles!host_id(username),
          opponent:profiles!opponent_id(username)
        `)
        .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .eq("status", "resolved")
        .order("resolved_at", { ascending: false });

      if (data) {
        const formatted = data.map((m: any) => {
          const isHost = m.host_id === user.id;
          const result = m.winner_id === user.id ? "win" : "loss";
          const opponentName = isHost ? m.opponent?.username : m.host?.username;
          
          return {
            id: m.id,
            opponent: opponentName || "Unknown Operative",
            result,
            score: "COMPLETED",
            game: m.game_name,
            date: new Date(m.resolved_at).toLocaleDateString(),
            duration: "Bout Resolved",
            prize: m.prize_pool,
            stats: { 
              kills: result === "win" ? "Verified" : "Defeated", 
              deaths: "-", 
              assists: "-" 
            },
            rating: result === "win" ? 100 : 0,
          };
        });
        setMatches(formatted);
      }
      setLoading(false);
    };
    fetchHistory();
  }, [supabase]);

  const filteredMatches = matches.filter(
    (match) => filter === "all" || match.result === filter
  );

  const stats = {
    total: matches.length,
    wins: matches.filter((m) => m.result === "win").length,
    losses: matches.filter((m) => m.result === "loss").length,
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <BlackHoleLoader label="Retrieving Combat Logs..." />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="py-20 text-center opacity-20">
        <p className="text-[10px] font-black  tracking-[0.5em]">No deployment history detected</p>
      </div>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white italic  tracking-tighter mb-8">
            Match <span className="text-compete-purple">History</span>
          </h2>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total", value: stats.total, color: "text-white" },
              { label: "Wins", value: stats.wins, color: "text-green-400" },
              { label: "Losses", value: stats.losses, color: "text-red-400" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 text-center"
              >
                <p className="text-white/20 text-[9px] font-black  tracking-widest mb-2">{stat.label}</p>
                <p className={`text-3xl font-black italic ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(["all", "win", "loss"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black  tracking-widest transition-all ${
                  filter === f
                    ? "bg-compete-purple text-white shadow-lg shadow-compete-purple/20"
                    : "bg-white/5 text-white/30 hover:bg-white/10"
                }`}
              >
                {f === "all" ? "All Logs" : f === "win" ? "Victories" : "Defeats"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Match Cards */}
        <div className="space-y-3">
          <AnimatePresence>
            {filteredMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: idx * 0.05 }}
                className="group"
              >
                {/* Match Card Header */}
                <motion.button
                  onClick={() => setExpandedId(expandedId === match.id ? null : match.id)}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-2xl p-6 transition-all hover:bg-white/[0.05] hover:border-compete-purple/30 text-left"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-6 flex-1">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl italic ${
                          match.result === "win"
                            ? "bg-green-500/10 text-green-500 border border-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                        }`}
                      >
                        {match.result === "win" ? "VICTORY" : "DEFEAT"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black  tracking-widest text-white/20 mb-1">Combatant</p>
                        <p className="text-white font-bold text-lg">vs {match.opponent}</p>
                        <p className="text-xs text-compete-muted font-mono">{match.game} • {match.date}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] font-black  tracking-widest text-white/20 mb-1">Payout</p>
                      <p className="text-2xl font-black text-compete-purple italic">KSh {match.prize?.toLocaleString()}</p>
                    </div>

                    <motion.div
                      animate={{ rotate: expandedId === match.id ? 180 : 0 }}
                      className="text-white/20"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {expandedId === match.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/[0.01] border-x border-b border-white/5 rounded-b-[2rem] p-8 -mt-4 pt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { icon: Trophy, label: "Verification", value: match.stats.kills },
                          { icon: Clock, label: "Deployment", value: "UPLINK SUCCESS" },
                          { icon: Users, label: "Protocol", value: "SECURE ESCROW" },
                        ].map((stat, i) => {
                          const Icon = stat.icon;
                          return (
                            <div key={i} className="bg-black/40 border border-white/5 p-5 rounded-2xl">
                              <div className="flex items-center gap-3 mb-3">
                                <Icon size={16} className="text-compete-purple" />
                                <span className="text-[9px] font-black  text-white/20 tracking-widest">{stat.label}</span>
                              </div>
                              <p className="text-lg font-black text-white italic">{stat.value}</p>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
