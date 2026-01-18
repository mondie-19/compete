"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, Zap, History, Star, BarChart3, TrendingUp, DollarSign, Users, LogOut, Menu, X } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";

const PERFORMANCE_DATA = [
  { month: "Jan", wins: 24, losses: 8 },
  { month: "Feb", wins: 28, losses: 6 },
  { month: "Mar", wins: 35, losses: 7 },
  { month: "Apr", wins: 32, losses: 9 },
  { month: "May", wins: 38, losses: 5 },
  { month: "Jun", wins: 42, losses: 8 },
];

const REVENUE_DATA = [
  { week: "Week 1", revenue: 450 },
  { week: "Week 2", revenue: 620 },
  { week: "Week 3", revenue: 480 },
  { week: "Week 4", revenue: 900 },
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

const MATCH_HISTORY = [
  { id: 1, opponent: "VoidWalker", result: "win", score: "13-8", game: "Valorant", date: "2 days ago", duration: "42 min", stats: { kills: 28, deaths: 12, assists: 8 }, rating: 92 },
  { id: 2, opponent: "GhostPixel", result: "win", score: "2-1", game: "League of Legends", date: "4 days ago", duration: "38 min", stats: { kills: 15, deaths: 5, assists: 22 }, rating: 88 },
  { id: 3, opponent: "CyberPulse", result: "loss", score: "10-13", game: "Valorant", date: "1 week ago", duration: "45 min", stats: { kills: 24, deaths: 18, assists: 6 }, rating: 76 },
];

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: Trophy },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "matches", label: "Matches", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedMatch, setExpandedMatch] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-compete-bg text-white flex">
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {/* Sidebar */}
      <div
        className="fixed left-0 top-0 w-64 bg-compete-card h-screen overflow-y-auto z-40 pt-24 hide-scrollbar"
        style={{
          borderRight: "3px solid #9B5CFF",
          boxShadow: "inset -10px 0 20px rgba(155, 92, 255, 0.2), -5px 0 15px rgba(155, 92, 255, 0.3)"
        }}
      >
          <div className="p-6 space-y-6 pb-10">
            {/* Profile Section */}
            <div className="text-center border-b border-white/10 pb-6">
              <div className="relative mx-auto w-20 h-20 rounded-full border-2 border-compete-purple p-1 mb-4">
                <div className="w-full h-full bg-compete-purple/20 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-4 border-compete-card" />
              </div>
              <h2 className="text-lg font-bold uppercase italic">NeonSlayer</h2>
              <p className="text-compete-muted text-xs tracking-widest uppercase">Level 42 • Elite</p>
            </div>

            {/* Navigation Items */}
            <div className="space-y-2">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-widest transition-all ${
                      isActive
                        ? "bg-compete-purple text-white shadow-lg shadow-compete-purple/50"
                        : "text-compete-muted bg-white/5 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Logout */}
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-widest text-compete-muted bg-white/5 hover:bg-white/10 border border-white/5 transition-all mt-auto mb-5">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 pt-24 pb-20 px-6 md:px-8 overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">
              Performance <span className="text-compete-purple">Dashboard</span>
            </h1>
            <p className="text-compete-muted">Welcome back, <span className="text-white font-bold">NeonSlayer</span></p>
          </div>
        </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Top Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Trophy className="text-yellow-500" size={24} />
                      <span className="text-xs text-green-400 font-bold">+12%</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Global Rank</p>
                    <p className="text-3xl font-black text-white">#1,242</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="text-compete-purple" size={24} />
                      <span className="text-xs text-green-400 font-bold">+5%</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Win Rate</p>
                    <p className="text-3xl font-black text-white">68%</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <History className="text-blue-400" size={24} />
                      <span className="text-xs text-green-400 font-bold">+8</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Total Matches</p>
                    <p className="text-3xl font-black text-white">142</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Star className="text-compete-purple-glow" size={24} />
                      <span className="text-xs text-green-400 font-bold">+2</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Compete Level</p>
                    <p className="text-3xl font-black text-white">24</p>
                  </motion.div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-compete-card/30 border border-white/5 rounded-2xl p-6"
                  >
                    <h3 className="text-white font-bold uppercase italic mb-6 flex items-center gap-2">
                      <Trophy size={18} className="text-yellow-500" /> Match Statistics
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-compete-muted">Total Matches</span>
                        <span className="text-white font-bold">142</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-compete-muted">Wins</span>
                        <span className="text-green-400 font-bold">96</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-compete-muted">Losses</span>
                        <span className="text-red-400 font-bold">46</span>
                      </div>
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                        <span className="text-compete-muted">Win/Loss Ratio</span>
                        <span className="text-compete-purple font-bold">2.1:1</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-compete-card/30 border border-white/5 rounded-2xl p-6"
                  >
                    <h3 className="text-white font-bold uppercase italic mb-6">Member Since</h3>
                    <p className="text-4xl font-black text-compete-purple mb-2">March 15, 2023</p>
                    <p className="text-compete-muted text-sm">Active for 1,034 days</p>
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-compete-muted uppercase font-bold mb-2">Consistency</p>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "85%" }}
                          transition={{ duration: 1 }}
                          className="bg-gradient-to-r from-compete-purple to-pink-500 h-full rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Performance Tab */}
            {activeTab === "performance" && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Performance Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-compete-card/30 border border-white/5 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-compete-purple" />
                    Performance Trend
                  </h3>
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

                {/* Win/Loss & Skills */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-compete-card/30 border border-white/5 rounded-2xl p-6 flex flex-col items-center"
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
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-compete-card/30 border border-white/5 rounded-2xl p-6"
                  >
                    <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6">Skill Metrics</h3>
                    <div className="space-y-4">
                      {SKILL_METRICS.map((metric, i) => (
                        <div key={i}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-compete-muted font-bold">{metric.skill}</span>
                            <span className="text-sm text-compete-purple font-bold">{metric.value}%</span>
                          </div>
                          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${metric.value}%` }}
                              transition={{ duration: 0.8 }}
                              className="bg-gradient-to-r from-compete-purple to-pink-500 h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Financial Tab */}
            {activeTab === "financial" && (
              <motion.div
                key="financial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Financial Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="text-green-400" size={24} />
                      <span className="text-xs text-green-400 font-bold">+23%</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Total Earnings</p>
                    <p className="text-3xl font-black text-white">$12,450</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="text-compete-purple" size={24} />
                      <span className="text-xs text-green-400 font-bold">+18%</span>
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">This Month</p>
                    <p className="text-3xl font-black text-white">$2,450</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className="text-blue-400" size={24} />
                    </div>
                    <p className="text-compete-muted text-xs uppercase font-bold mb-1">Pending Payouts</p>
                    <p className="text-3xl font-black text-white">$450</p>
                  </motion.div>
                </div>

                {/* Revenue Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-compete-card/30 border border-white/5 rounded-2xl p-6"
                >
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={20} className="text-green-400" />
                    Revenue Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9B5CFF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#9B5CFF" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis stroke="rgba(155, 92, 255, 0.5)" />
                      <YAxis stroke="rgba(155, 92, 255, 0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#12121A",
                          border: "1px solid rgba(155, 92, 255, 0.3)",
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#9B5CFF" fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>
            )}

            {/* Matches Tab */}
            {activeTab === "matches" && (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4">Recent Matches</h3>
                <div className="space-y-4">
                  {MATCH_HISTORY.map((match) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-compete-card/30 border border-white/5 rounded-xl overflow-hidden hover:border-compete-purple/30 transition-all"
                    >
                      <button
                        onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                        className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
                            match.result === "win"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}>
                            {match.result === "win" ? "W" : "L"}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-bold">vs {match.opponent}</p>
                            <p className="text-compete-muted text-sm">{match.game} • {match.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold text-lg">{match.score}</p>
                          <p className="text-compete-muted text-sm">{match.duration}</p>
                        </div>
                      </button>

                      {expandedMatch === match.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-white/5 px-6 py-4 bg-white/5"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-compete-muted text-xs font-bold uppercase mb-2">Kills</p>
                              <p className="text-2xl font-bold text-white">{match.stats.kills}</p>
                            </div>
                            <div>
                              <p className="text-compete-muted text-xs font-bold uppercase mb-2">Deaths</p>
                              <p className="text-2xl font-bold text-white">{match.stats.deaths}</p>
                            </div>
                            <div>
                              <p className="text-compete-muted text-xs font-bold uppercase mb-2">Assists</p>
                              <p className="text-2xl font-bold text-white">{match.stats.assists}</p>
                            </div>
                            <div>
                              <p className="text-compete-muted text-xs font-bold uppercase mb-2">Rating</p>
                              <p className="text-2xl font-bold text-compete-purple">{match.rating}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-compete-card/30 border border-white/5 rounded-2xl p-8"
                >
                  <h3 className="text-2xl font-bold text-white uppercase italic mb-6">Settings & Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                      <div>
                        <p className="text-white font-bold">Email Notifications</p>
                        <p className="text-compete-muted text-sm">Receive updates about your matches</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                      <div>
                        <p className="text-white font-bold">Match Reminders</p>
                        <p className="text-compete-muted text-sm">Get notified before upcoming matches</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5">
                      <div>
                        <p className="text-white font-bold">Dark Mode</p>
                        <p className="text-compete-muted text-sm">Always enabled</p>
                      </div>
                      <input type="checkbox" defaultChecked disabled className="w-5 h-5" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
}