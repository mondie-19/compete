"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, Zap, History, Star, BarChart3, TrendingUp, DollarSign, Users, LogOut, Menu, X, ShieldAlert } from "lucide-react";
import { createClient } from "@/supabase/client";
import Link from "next/link";
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
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/";
        return;
      }

      // Fetch Profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch Transactions
      const { data: transData } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTransactions(transData || []);

      // Fetch Matches
      const { data: matchData } = await supabase
        .from("challenges")
        .select(`
          *,
          host:profiles!challenges_creator_id_fkey(username),
          opponent:profiles!challenges_opponent_id_fkey(username)
        `)
        .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .order("created_at", { ascending: false });
      setMatches(matchData || []);

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase">
        <Zap size={64} className="mb-4 animate-pulse text-compete-purple" />
        Syncing Neural Dashboard...
      </div>
    );
  }

  // Calculate dynamic stats
  const totalWins = matches.filter(m => m.winner_id === profile.id).length;
  const totalLosses = matches.filter(m => m.status === 'resolved' && m.winner_id !== profile.id && (m.host_id === profile.id || m.opponent_id === profile.id)).length;
  const winRate = matches.length > 0 ? Math.round((totalWins / (totalWins + totalLosses || 1)) * 100) : 0;
  const totalEarnings = transactions
    .filter(t => t.type === 'challenge_win')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSpent = Math.abs(transactions
    .filter(t => t.type === 'challenge_entry')
    .reduce((sum, t) => sum + Number(t.amount), 0));
  const netProfit = totalEarnings - totalSpent;

  // Aggregations for Charts
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const weeklyRevenue = transactions
    .filter(t => t.type === 'challenge_win' || t.type === 'deposit')
    .reduce((acc: any, t) => {
      const date = new Date(t.created_at);
      const week = `Week ${Math.ceil(date.getDate() / 7)}`;
      acc[week] = (acc[week] || 0) + Number(t.amount);
      return acc;
    }, {});

  const chartRevenueData = Object.keys(weeklyRevenue).map(week => ({
    week,
    revenue: weeklyRevenue[week]
  })).slice(-4);

  const monthlyPerformance = matches.reduce((acc: any, m) => {
    const month = monthNames[new Date(m.created_at).getMonth()];
    if (!acc[month]) acc[month] = { month, wins: 0, losses: 0 };
    if (m.winner_id === profile.id) acc[month].wins++;
    else if (m.status === 'resolved') acc[month].losses++;
    return acc;
  }, {});

  const chartPerformanceData = Object.values(monthlyPerformance).slice(-6);

  return (
    <div className="min-h-screen bg-compete-bg text-white relative">
      <div className="flex">
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
        {/* Sidebar */}
        <div
          className="w-64 bg-compete-card min-h-screen pt-24 shrink-0"
          style={{
            borderRight: "3px solid #9B5CFF",
            boxShadow: "inset -10px 0 20px rgba(155, 92, 255, 0.2), -5px 0 15px rgba(155, 92, 255, 0.3)"
          }}
        >
          <div className="p-6 space-y-6 pb-10 sticky top-24">
            {/* Profile Section */}
            <div className="text-center border-b border-white/10 pb-6">
              <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-compete-purple to-pink-500 p-[2px] mb-4">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center text-2xl overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black italic text-compete-purple">{profile?.username?.[0]}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-black" />
              </div>
              <h2 className="text-lg font-black uppercase italic tracking-tighter">{profile?.username}</h2>
              <p className="text-compete-purple text-[8px] font-black tracking-[0.3em] uppercase mt-1">
                {profile?.is_admin ? "SYSTEM ADMIN" : "Verified Competitor"}
              </p>
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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-widest transition-all ${isActive
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
        <div className="flex-1 pt-24 pb-20 px-6 md:px-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter mb-0">
                Performance <span className="text-compete-purple">Dashboard</span>
              </h1>
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
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Zap className="text-compete-purple" size={24} />
                      <span className={`text-xs font-bold ${winRate >= 50 ? 'text-green-400' : 'text-red-400'}`}>{winRate}%</span>
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Win Rate</p>
                    <p className="text-3xl font-black text-white italic">{winRate}%</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <History className="text-blue-400" size={24} />
                      <span className="text-xs text-white/40 font-bold">{matches.length}</span>
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Total Deployments</p>
                    <p className="text-3xl font-black text-white italic">{matches.length}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="text-green-500" size={24} />
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Vault Credits</p>
                    <p className="text-3xl font-black text-compete-purple italic">${profile?.balance || 0}</p>
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
                        <span className="text-compete-muted uppercase text-[10px] font-black tracking-widest">Total Matches</span>
                        <span className="text-white font-black italic">{matches.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-compete-muted uppercase text-[10px] font-black tracking-widest">Wins</span>
                        <span className="text-green-400 font-black italic">{totalWins}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-compete-muted uppercase text-[10px] font-black tracking-widest">Losses</span>
                        <span className="text-red-400 font-black italic">{totalLosses}</span>
                      </div>
                      <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                        <span className="text-compete-muted uppercase text-[10px] font-black tracking-widest">Win/Loss Ratio</span>
                        <span className="text-compete-purple font-black italic">{(totalWins / (totalLosses || 1)).toFixed(2)}:1</span>
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
                    <p className="text-4xl font-black text-compete-purple mb-2 uppercase italic leading-none">
                      {new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-compete-muted text-[10px] font-black uppercase tracking-widest">Secure Uplink Established</p>
                    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-compete-muted uppercase font-bold mb-2">Consistency Score</p>
                      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (matches.length / 10) * 100)}%` }}
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
                    <BarChart data={chartPerformanceData.length > 0 ? chartPerformanceData : PERFORMANCE_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(155, 92, 255, 0.5)" />
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
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="text-green-400" size={24} />
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Total Earnings</p>
                    <p className="text-3xl font-black text-white italic">${totalEarnings}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="text-compete-purple" size={24} />
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Total Entry Fees</p>
                    <p className="text-3xl font-black text-white italic">-${totalSpent}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-compete-card/50 border border-white/5 rounded-2xl p-6 hover:border-compete-purple/30 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className={` ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} size={24} />
                    </div>
                    <p className="text-compete-muted text-[10px] uppercase font-bold tracking-widest mb-1">Net Flow</p>
                    <p className={`text-3xl font-black italic ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netProfit >= 0 ? `+$${netProfit}` : `-$${Math.abs(netProfit)}`}
                    </p>
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
                    <AreaChart data={chartRevenueData.length > 0 ? chartRevenueData : REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9B5CFF" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#9B5CFF" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(155, 92, 255, 0.5)" />
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
                <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-3">
                  <History size={20} className="text-compete-purple" /> Deployment Log
                </h3>
                <div className="space-y-4">
                  {matches.length === 0 && (
                    <div className="h-40 bg-white/5 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/20 italic font-black uppercase tracking-widest">
                      No Match Data Found
                    </div>
                  )}
                  {matches.map((match) => {
                    const isWinner = match.winner_id === profile.id;
                    const opponent = match.host_id === profile.id ? match.opponent?.username : match.host?.username;
                    const resultLabel = match.status === 'resolved' ? (isWinner ? "WIN" : "LOSS") : match.status.toUpperCase();

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-compete-card/30 border border-white/5 rounded-xl overflow-hidden hover:border-compete-purple/30 transition-all shadow-lg"
                      >
                        <button
                          onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                          className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black italic text-lg ${match.status !== 'resolved' ? "bg-white/10 text-white/40" :
                              (isWinner ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")
                              }`}>
                              {resultLabel[0]}
                            </div>
                            <div className="text-left">
                              <p className="text-white font-black italic uppercase tracking-tighter text-lg">vs {opponent || 'UNKNOWN COMPETITOR'}</p>
                              <p className="text-compete-muted text-[10px] font-black uppercase tracking-widest">{match.game_name} • {new Date(match.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-black italic text-xl">${match.prize_pool}</p>
                            <p className={`text-[8px] font-black uppercase tracking-widest ${match.status === 'disputed' ? 'text-red-500 animate-pulse' : 'text-white/20'}`}>
                              {match.status === 'resolved' ? "FINALIZED" : match.status}
                            </p>
                          </div>
                        </button>

                        {expandedMatch === match.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 px-6 py-6 bg-black/40"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Match ID</p>
                                <p className="text-xs font-mono text-compete-purple">{match.id}</p>
                              </div>
                              <div className="flex gap-4">
                                <Link href={`/match/${match.id}`} className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                  View Intelligence
                                </Link>
                                {match.status === 'in_progress' && (
                                  <div className="flex items-center gap-2 text-[10px] font-black uppercase text-yellow-500">
                                    <Zap size={12} /> Active Deployment
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
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
    </div>
  );
}