"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Trophy, Target, Zap, BarChart3, Calendar } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const PLAYER_STATS = {
  username: "NeonSlayer",
  level: 42,
  rank: 1,
  totalMatches: 487,
  winRate: 78.5,
  mainGame: "Valorant",
  joinDate: "2023-03-15",
};

const PERFORMANCE_DATA = [
  { month: "Jan", wins: 24, losses: 8 },
  { month: "Feb", wins: 28, losses: 6 },
  { month: "Mar", wins: 35, losses: 7 },
  { month: "Apr", wins: 32, losses: 9 },
  { month: "May", wins: 38, losses: 5 },
  { month: "Jun", wins: 42, losses: 8 },
];

const WIN_LOSS_DATA = [
  { name: "Wins", value: 383, fill: "#9B5CFF" },
  { name: "Losses", value: 104, fill: "rgba(155, 92, 255, 0.2)" },
];

const SKILL_METRICS = [
  { skill: "Aim", value: 92 },
  { skill: "Strategy", value: 88 },
  { skill: "Teamwork", value: 85 },
  { skill: "Reflexes", value: 90 },
  { skill: "Game Sense", value: 87 },
];

export default function StatsDashboard() {
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");

  const stats = [
    { icon: Trophy, label: "Total Matches", value: PLAYER_STATS.totalMatches, color: "text-yellow-500" },
    { icon: TrendingUp, label: "Win Rate", value: `${PLAYER_STATS.winRate}%`, color: "text-compete-purple" },
    { icon: Zap, label: "Current Rank", value: `#${PLAYER_STATS.rank}`, color: "text-red-500" },
    { icon: Target, label: "Level", value: PLAYER_STATS.level, color: "text-blue-500" },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
                Performance <span className="text-compete-purple">Dashboard</span>
              </h2>
              <p className="text-compete-muted">Player: <span className="text-white font-bold">{PLAYER_STATS.username}</span></p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-compete-muted text-sm">Member since</p>
              <p className="text-white font-bold">{new Date(PLAYER_STATS.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.1 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-compete-card/30 border border-white/5 rounded-xl p-6 card-hover group"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} size={24} />
                  <div className="text-xs uppercase tracking-widest text-compete-muted font-bold">{stat.label}</div>
                </div>
                <p className="text-3xl font-black text-white">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Performance Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-compete-card/30 border border-white/5 rounded-2xl p-6 card-hover"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <BarChart3 size={20} className="text-compete-purple" />
                Performance Trend
              </h3>
              <div className="flex gap-2">
                {(["week", "month", "all"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest transition-all ${
                      timeframe === period
                        ? "bg-compete-purple text-white"
                        : "bg-white/5 text-compete-muted hover:bg-white/10"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={PERFORMANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(155, 92, 255, 0.5)" />
                <YAxis stroke="rgba(155, 92, 255, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12121A",
                    border: "1px solid rgba(155, 92, 255, 0.3)",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#9B5CFF" }}
                />
                <Legend />
                <Bar dataKey="wins" fill="#9B5CFF" />
                <Bar dataKey="losses" fill="rgba(155, 92, 255, 0.3)" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Win/Loss Pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-compete-card/30 border border-white/5 rounded-2xl p-6 card-hover flex flex-col items-center justify-center"
          >
            <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6">Total Record</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={WIN_LOSS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {WIN_LOSS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12121A",
                    border: "1px solid rgba(155, 92, 255, 0.3)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center text-sm text-compete-muted">
              <p><span className="text-white font-bold">{WIN_LOSS_DATA[0].value}</span> wins</p>
              <p><span className="text-white font-bold">{WIN_LOSS_DATA[1].value}</span> losses</p>
            </div>
          </motion.div>
        </div>

        {/* Skill Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-compete-card/30 border border-white/5 rounded-2xl p-6 card-hover"
        >
          <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-8">Skill Breakdown</h3>
          <div className="space-y-6">
            {SKILL_METRICS.map((skill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{skill.skill}</span>
                  <span className="text-compete-purple font-bold">{skill.value}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.value}%` }}
                    transition={{ delay: idx * 0.05 + 0.2, duration: 0.8 }}
                    viewport={{ once: true }}
                    className="h-full bg-gradient-to-r from-compete-purple to-compete-purpleGlow"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
