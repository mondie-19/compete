"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp } from "lucide-react";

const PRIZE_POOL_DATA = {
  total: 1250000,
  distributed: 920000,
  upcoming: 330000,
};

const PRIZE_TIERS = [
  { tier: "1st Place", prize: 50000, percentage: 25 },
  { tier: "2nd Place", prize: 30000, percentage: 15 },
  { tier: "3rd Place", prize: 20000, percentage: 10 },
  { tier: "4th-10th", prize: 70000, percentage: 35 },
  { tier: "Participation", prize: 30000, percentage: 15 },
];

const TOURNAMENT_PRIZES = [
  { name: "Pro League Masters", prize: 50000, date: "Starts in 2h" },
  { name: "Shadow Strike Cup", prize: 15000, date: "Tomorrow" },
  { name: "Neon City Brawl", prize: 25000, date: "Jan 20" },
];

export default function PrizePoolTracker() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev + 1) % 100);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const animatedDistributed = Math.floor((PRIZE_POOL_DATA.distributed / PRIZE_POOL_DATA.total) * counter);

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent via-compete-purple/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
            Prize Pool <span className="text-compete-purple">Tracker</span>
          </h2>
          <p className="text-compete-muted max-w-2xl mx-auto">
            Watch how we&apos;re distributing competitive rewards to our top players and tournaments
          </p>
        </motion.div>

        {/* Main Prize Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Pool */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-compete-purple/20 to-compete-purple/5 border border-compete-purple/30 rounded-2xl p-8 text-center card-hover"
          >
            <p className="text-compete-muted uppercase tracking-widest text-sm mb-4">Total Prize Pool</p>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-compete-purple mb-2"
            >
              ${(PRIZE_POOL_DATA.total / 1000000).toFixed(1)}M
            </motion.div>
            <p className="text-white font-bold text-sm">Across all tournaments</p>
          </motion.div>

          {/* Distributed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 rounded-2xl p-8 text-center card-hover"
          >
            <p className="text-green-400 uppercase tracking-widest text-sm mb-4">Distributed</p>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-green-400 mb-2"
            >
              ${(PRIZE_POOL_DATA.distributed / 1000).toFixed(0)}K
            </motion.div>
            <p className="text-white font-bold text-sm">Paid to winners</p>
          </motion.div>

          {/* Upcoming */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl p-8 text-center card-hover"
          >
            <p className="text-blue-400 uppercase tracking-widest text-sm mb-4">Upcoming</p>
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              viewport={{ once: true }}
              className="text-5xl md:text-6xl font-black text-blue-400 mb-2"
            >
              ${(PRIZE_POOL_DATA.upcoming / 1000).toFixed(0)}K
            </motion.div>
            <p className="text-white font-bold text-sm">To be distributed</p>
          </motion.div>
        </div>

        {/* Distribution Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Prize Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-compete-card/30 border border-white/5 rounded-2xl p-6 card-hover"
          >
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <Zap size={20} className="text-compete-purple" />
              Prize Distribution
            </h3>
            <div className="space-y-4">
              {PRIZE_TIERS.map((tier, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-white font-bold">{tier.tier}</p>
                      <p className="text-xs text-compete-muted">${tier.prize.toLocaleString()}</p>
                    </div>
                    <span className="text-compete-purple font-bold">{tier.percentage}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${tier.percentage}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.6 }}
                      viewport={{ once: true }}
                      className="h-full bg-gradient-to-r from-compete-purple to-compete-purpleGlow"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Active Tournaments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-compete-card/30 border border-white/5 rounded-2xl p-6 card-hover"
          >
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-compete-purple" />
              Active Tournaments
            </h3>
            <div className="space-y-4">
              {TOURNAMENT_PRIZES.map((tournament, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-compete-purple/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{tournament.name}</p>
                      <p className="text-xs text-compete-muted">{tournament.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-compete-purple font-black text-xl">
                        ${(tournament.prize / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* All-time Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-compete-card/30 border border-white/5 rounded-2xl p-8 text-center card-hover"
        >
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8">Distribution Progress</h3>
          <div className="max-w-2xl mx-auto">
            <div className="h-4 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(PRIZE_POOL_DATA.distributed / PRIZE_POOL_DATA.total) * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                viewport={{ once: true }}
                className="h-full bg-gradient-to-r from-compete-purple via-compete-purpleGlow to-compete-purple"
              />
            </div>
            <p className="text-compete-muted">
              <span className="text-white font-bold">${(PRIZE_POOL_DATA.distributed / 1000).toFixed(0)}K</span> of{" "}
              <span className="text-white font-bold">${(PRIZE_POOL_DATA.total / 1000).toFixed(0)}K</span> distributed
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
