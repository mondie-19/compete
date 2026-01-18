"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Trophy, Target, Clock, Users } from "lucide-react";

const MATCH_HISTORY = [
  {
    id: 1,
    opponent: "VoidWalker",
    result: "win",
    score: "13-8",
    game: "Valorant",
    date: "2 days ago",
    duration: "42 min",
    stats: { kills: 28, deaths: 12, assists: 8 },
    rating: 92,
  },
  {
    id: 2,
    opponent: "GhostPixel",
    result: "win",
    score: "2-1",
    game: "League of Legends",
    date: "4 days ago",
    duration: "38 min",
    stats: { kills: 15, deaths: 5, assists: 22 },
    rating: 88,
  },
  {
    id: 3,
    opponent: "CyberPulse",
    result: "loss",
    score: "10-13",
    game: "Valorant",
    date: "1 week ago",
    duration: "45 min",
    stats: { kills: 24, deaths: 18, assists: 6 },
    rating: 76,
  },
  {
    id: 4,
    opponent: "NeonShade",
    result: "win",
    score: "2-0",
    game: "CS2",
    date: "1 week ago",
    duration: "35 min",
    stats: { kills: 32, deaths: 8, assists: 4 },
    rating: 95,
  },
  {
    id: 5,
    opponent: "PhantomX",
    result: "win",
    score: "13-5",
    game: "Valorant",
    date: "2 weeks ago",
    duration: "38 min",
    stats: { kills: 30, deaths: 10, assists: 5 },
    rating: 94,
  },
];

export default function MatchHistory() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");

  const filteredMatches = MATCH_HISTORY.filter(
    (match) => filter === "all" || match.result === filter
  );

  const stats = {
    total: MATCH_HISTORY.length,
    wins: MATCH_HISTORY.filter((m) => m.result === "win").length,
    losses: MATCH_HISTORY.filter((m) => m.result === "loss").length,
  };

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
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-8">
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
                className="bg-compete-card/30 border border-white/5 rounded-lg p-4 text-center"
              >
                <p className="text-compete-muted text-xs uppercase tracking-widest mb-2">{stat.label}</p>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(["all", "win", "loss"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                  filter === f
                    ? "bg-compete-purple text-white"
                    : "bg-white/5 text-compete-muted hover:bg-white/10"
                }`}
              >
                {f === "all" ? "All" : f === "win" ? "Wins" : "Losses"}
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
                  className="w-full bg-compete-card/30 border border-white/5 rounded-xl p-6 transition-all hover:border-compete-purple/30 text-left card-hover"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Result Badge */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                          match.result === "win"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {match.result === "win" ? "W" : "L"}
                      </div>

                      {/* Match Info */}
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-bold truncate">vs {match.opponent}</p>
                        <p className="text-sm text-compete-muted">{match.game} • {match.date}</p>
                      </div>
                    </div>

                    {/* Score and Rating */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-compete-purple">{match.score}</p>
                      <p className="text-sm text-compete-muted">{match.duration}</p>
                    </div>

                    {/* Expand Icon */}
                    <motion.div
                      animate={{ rotate: expandedId === match.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={20} className="text-compete-purple" />
                    </motion.div>
                  </div>
                </motion.button>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedId === match.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-compete-card/20 border border-t-0 border-white/5 rounded-b-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Stats */}
                        {[
                          { icon: Trophy, label: "Kills", value: match.stats.kills },
                          { icon: Target, label: "Deaths", value: match.stats.deaths },
                          { icon: Users, label: "Assists", value: match.stats.assists },
                        ].map((stat, i) => {
                          const Icon = stat.icon;
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                            >
                              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <Icon size={20} className="text-compete-purple" />
                                <div>
                                  <p className="text-xs text-compete-muted uppercase tracking-widest">{stat.label}</p>
                                  <p className="text-2xl font-black text-white">{stat.value}</p>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Performance Rating */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-compete-card/20 border border-t-0 border-white/5 rounded-b-xl px-6 pb-6"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-bold">Performance Rating</span>
                          <span className="text-compete-purple font-black">{match.rating}/100</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${match.rating}%` }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="h-full bg-gradient-to-r from-compete-purple to-compete-purpleGlow"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredMatches.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 text-compete-muted"
          >
            No matches found for this filter
          </motion.div>
        )}
      </div>
    </section>
  );
}
