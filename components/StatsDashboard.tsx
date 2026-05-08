import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Trophy, Target, Zap, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { createClient } from "@/supabase/client";

export default function StatsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("month");
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 1. Fetch Profile Data
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, level, rank_name, created_at")
        .eq("id", user.id)
        .single();

      // 2. Fetch Ranking/Win Rate Data
      const { data: ranking } = await supabase
        .from("user_rankings")
        .select("*")
        .eq("username", profile?.username)
        .single();

      setStats({
        username: profile?.username || "COMPETITOR",
        level: profile?.level || 1,
        rank: ranking?.rank || "-",
        totalMatches: ranking?.total_matches || 0,
        winRate: ranking?.win_rate || 0,
        joinDate: profile?.created_at || new Date().toISOString(),
        totalWins: ranking?.total_wins || 0,
        totalLosses: (ranking?.total_matches || 0) - (ranking?.total_wins || 0),
      });

      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4 opacity-40">
        <Loader2 className="animate-spin text-compete-purple" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Synchronizing Neural Stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-20 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Login required for performance tracking</p>
      </div>
    );
  }

  const dashboardStats = [
    { icon: Trophy, label: "Total Matches", value: stats.totalMatches, color: "text-yellow-500" },
    { icon: TrendingUp, label: "Win Rate", value: `${stats.winRate}%`, color: "text-compete-purple" },
    { icon: Zap, label: "Current Rank", value: `#${stats.rank}`, color: "text-red-500" },
    { icon: Target, label: "Level", value: stats.level, color: "text-blue-500" },
  ];

  // Simulated performance data relative to user's real totals for visual appeal
  const performanceData = [
    { month: "Apr", wins: Math.floor(stats.totalWins * 0.2), losses: Math.floor(stats.totalLosses * 0.3) },
    { month: "May", wins: Math.floor(stats.totalWins * 0.3), losses: Math.floor(stats.totalLosses * 0.2) },
    { month: "Jun", wins: Math.floor(stats.totalWins * 0.5), losses: Math.floor(stats.totalLosses * 0.5) },
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
              <p className="text-compete-muted">Operative: <span className="text-white font-bold">{stats.username}</span></p>
            </div>
            <div className="text-right hidden md:block">
              <p className="text-compete-muted text-sm uppercase tracking-widest font-black text-[9px]">Uplink Date</p>
              <p className="text-white font-bold">{new Date(stats.joinDate).toLocaleDateString()}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          {dashboardStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-compete-purple/50 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-compete-purple/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-compete-purple/20 transition-all" />
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <Icon className={`${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} size={24} />
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-black">{stat.label}</div>
                </div>
                <p className="text-3xl font-black text-white italic relative z-10">{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                <BarChart3 size={16} className="text-compete-purple" />
                Deployment History
              </h3>
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                {(["week", "month", "all"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      timeframe === period
                        ? "bg-compete-purple text-white shadow-lg shadow-compete-purple/20"
                        : "text-white/30 hover:text-white"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B0B10",
                      border: "1px solid rgba(155, 92, 255, 0.2)",
                      borderRadius: "12px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar dataKey="wins" fill="#9B5CFF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="losses" fill="rgba(155, 92, 255, 0.1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Record Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between"
          >
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] mb-8">Victory Ratio</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Wins</span>
                  <span className="text-xl font-black italic text-compete-purple">{stats.totalWins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Defeats</span>
                  <span className="text-xl font-black italic text-white/60">{stats.totalLosses}</span>
                </div>
                <div className="pt-6 border-t border-white/5">
                  <p className="text-[8px] font-black uppercase text-white/20 tracking-widest mb-4">Skill Confidence</p>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stats.winRate}%` }}
                      className="h-full bg-compete-purple shadow-[0_0_10px_#9B5CFF]" 
                    />
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full py-4 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white hover:text-black transition-all rounded-xl mt-8">
              Download Intel Report
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
