"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Trophy, Zap, History, Star, BarChart3, TrendingUp, DollarSign, Users, LogOut, Menu, X, ShieldAlert, Globe, Activity, Wallet, Camera, Check, Eye, EyeOff, Copy, Edit3, Loader2 } from "lucide-react";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { toast } from "sonner";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts";
import BlackHoleLoader from "@/components/BlackHoleLoader";
import Switch from "@/components/Switch";

const VaultTab = dynamic(() => import("@/components/dashboard/VaultTab"), { ssr: false });

const SIDEBAR_ITEMS = [
  { id: "overview", label: "Overview", icon: Trophy },
  { id: "performance", label: "Performance", icon: BarChart3 },
  { id: "financial", label: "Financial", icon: DollarSign },
  { id: "matches", label: "Matches", icon: History },
  { id: "vault", label: "Vault", icon: Wallet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Dashboard() {
  const supabase = createClient();
  useHeartbeat();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdPopup, setShowIdPopup] = useState(false);
  const [isSelectingAvatar, setIsSelectingAvatar] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [revealSignature, setRevealSignature] = useState(false);
  const [ranking, setRanking] = useState<any>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [updatingName, setUpdatingName] = useState(false);
  const [locationForm, setLocationForm] = useState({ country: "", city: "" });
  const [savingLocation, setSavingLocation] = useState(false);

  const getLevelInfo = (lvl: number) => {
    if (lvl <= 50) return { name: "Initiate", bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400" };
    if (lvl <= 100) return { name: "Specialist", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400" };
    if (lvl <= 150) return { name: "Elite", bg: "bg-compete-purple/10", border: "border-compete-purple/20", text: "text-compete-purple" };
    if (lvl <= 200) return { name: "Operative", bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400" };
    if (lvl <= 250) return { name: "Veteran", bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400" };
    return { name: "Master", bg: "bg-white/10", border: "border-white/20", text: "text-white" };
  };

  const levelInfo = getLevelInfo(ranking?.level || 1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/";
          return;
        }

        // Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);
        setNewUsername(profileData.username);
        setLocationForm({ country: profileData.country || "", city: profileData.city || "" });

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
            host:profiles!host_id(username),
            opponent:profiles!opponent_id(username)
          `)
          .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .order("created_at", { ascending: false });
        setMatches(matchData || []);
        
        // Fetch Ranking
        if (profileData) {
          const { data: rankingData } = await supabase
            .from("user_rankings")
            .select("*")
            .eq("username", profileData.username)
            .single();
          setRanking(rankingData);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Dashboard Fetch Error:", err);
        toast.error("Neural Uplink Failed: " + (err.message || "Check connection"));
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  useEffect(() => {
    const handleLocationChange = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam && ["overview", "performance", "financial", "matches", "vault", "settings"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };
    handleLocationChange();
    const interval = setInterval(handleLocationChange, 200);
    return () => clearInterval(interval);
  }, []);

  const handleNameUpdate = async () => {
    if (!newUsername || newUsername === profile.username) {
      setIsEditingName(false);
      return;
    }

    setUpdatingName(true);
    try {
      // Uniqueness check is handled by the DB constraint, but we can catch it
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', profile.id);

      if (error) {
        if (error.code === '23505') {
          toast.error("Neural Signature Occupied: Name already taken");
        } else {
          throw error;
        }
        return;
      }

      setProfile({ ...profile, username: newUsername });
      
      // Re-fetch ranking for the new name
      const { data: rankingData } = await supabase
        .from("user_rankings")
        .select("*")
        .eq("username", newUsername)
        .single();
      if (rankingData) setRanking(rankingData);

      toast.success("Neural Identity Re-encoded");
      setIsEditingName(false);
    } catch (err: any) {
      console.error(err);
      toast.error("Re-encoding Failed: " + err.message);
    } finally {
      setUpdatingName(false);
    }
  };

  const handleAvatarUpdate = async (url: string) => {
    setUpdatingAvatar(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({ ...profile, avatar_url: url });
      toast.success("Neural Identity Updated");
      setIsSelectingAvatar(false);
    } catch (err) {
      toast.error("Uplink Failed: Could not sync avatar");
    } finally {
      setUpdatingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <BlackHoleLoader label="Syncing Dashboard..." />
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
    <div className="min-h-screen bg-black text-white relative font-mono selection:bg-compete-purple">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .mobile-nav-active {
            color: #9B5CFF !important;
            background: rgba(155, 92, 255, 0.1) !important;
            border-color: rgba(155, 92, 255, 0.2) !important;
          }
        }
      `}</style>

        {/* Sidebar (Desktop) / Mobile Nav (Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:relative lg:w-60 bg-[#0F0F16]/90 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-t lg:border-t-0 lg:border-r border-white/10 py-2 lg:pt-8 lg:shrink-0 h-auto lg:min-h-screen">
          <div className="flex lg:flex-col items-center lg:items-stretch justify-around lg:justify-start px-2 lg:px-4 lg:space-y-8 lg:sticky lg:top-8">
            {/* Universal Neural Identity Profile Section */}
            <button
              onClick={() => setShowIdPopup(true)}
              className="hidden lg:block w-full text-left bg-white/[0.02] border border-white/10 p-4 rounded-2xl mb-6 mt-10 group hover:border-compete-purple/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-compete-purple/5 -mr-8 -mt-8 rounded-full blur-xl group-hover:bg-compete-purple/10 transition-all" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-white/30 tracking-widest uppercase">NEURAL ID</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <p className="text-sm font-black italic text-compete-purple tracking-tighter truncate uppercase">{profile?.username}</p>
              <p className={`text-[6px] font-black tracking-[0.3em] mt-1 ${levelInfo.text} uppercase`}>LEVEL {ranking?.level || 1} • {levelInfo.name.toUpperCase()}</p>
            </button>

            {/* Navigation Items */}
            <div className="flex lg:flex-col w-full justify-around lg:justify-start lg:space-y-1 overflow-x-auto no-scrollbar">
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all relative ${isActive
                        ? "text-compete-purple lg:text-white lg:bg-white/5 lg:border lg:border-white/10"
                        : "text-white/30 hover:text-white"
                      }`}
                  >
                    <Icon size={14} className={isActive ? "text-compete-purple" : ""} />
                    <span className="text-[7px] lg:text-[9px] font-black tracking-[0.2em] uppercase">{item.label}</span>
                  </button>
                );
              })}
              
              <div className="hidden lg:block w-full h-px bg-white/10 my-2" />
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/auth";
                }}
                className="flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-2 lg:px-4 py-2 lg:py-2.5 rounded-xl transition-all text-white/30 hover:text-red-500 hover:bg-white/5"
              >
                <LogOut size={14} />
                <span className="text-[7px] lg:text-[9px] font-black tracking-[0.2em] uppercase">LOGOUT</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center pt-8 lg:pt-8 pb-24 lg:pb-8 px-4 lg:px-8 max-w-6xl mx-auto w-full">
          <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md py-4 -mx-4 lg:-mx-8 px-4 lg:px-8 border-b border-white/5 mb-6 lg:mb-8 flex items-center justify-between transition-all duration-300">
            <div>
              <h1 className="text-lg lg:text-2xl font-black text-white italic tracking-tighter leading-none">
                Neural <span className="text-compete-purple">Dashboard</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[7px] lg:text-[10px] font-black tracking-[0.3em] text-white/20">Status: Operational</p>
                <div className="flex items-center gap-2 opacity-50">
                  <div className="w-8 h-px bg-gradient-to-r from-compete-purple/50 to-transparent" />
                  <Activity size={12} className="text-compete-purple animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === "vault" && <VaultTab />}
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Top Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                  {[
                    { label: 'STANDING', value: `#${ranking?.rank || '---'}`, icon: Trophy, color: 'text-yellow-500', trend: `${ranking?.xp || 0} XP` },
                    { label: 'WIN RATE', value: `${winRate}%`, icon: Zap, color: 'text-compete-purple', trend: winRate >= 50 ? '+4%' : '-2%' },
                    { label: 'MISSIONS', value: matches.length, icon: History, color: 'text-blue-400' },
                    { label: 'VAULT', value: `Ksh ${profile?.balance || 0}`, icon: DollarSign, color: 'text-green-500' }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-2xl p-4 hover:border-compete-purple/50 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-xl bg-white/5 ${stat.color}`}>
                          <stat.icon className="w-3.5 h-3.5" />
                        </div>
                        {stat.trend && (
                          <span className={`text-[7px] lg:text-[8px] font-black ${stat.trend.startsWith('+') ? 'text-green-400' : stat.trend.includes('XP') ? 'text-compete-purple' : 'text-red-400'} uppercase tracking-wider`}>
                            {stat.trend}
                          </span>
                        )}
                      </div>
                      <p className="text-[8px] font-black text-white/30 tracking-widest mb-1 uppercase">{stat.label}</p>
                      <p className="text-base lg:text-xl font-black text-white italic tracking-tighter leading-none uppercase">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6"
                  >
                    <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 flex items-center gap-2 opacity-50 uppercase">
                      <Trophy className="w-[14px] h-[14px] text-yellow-500" /> DEPLOYMENT METRICS
                    </h3>
                    <div className="space-y-4">
                      {[
                        { label: 'TOTAL ENGAGEMENTS', value: matches.length, color: 'text-white' },
                        { label: 'SUCCESSFUL MISSIONS', value: totalWins, color: 'text-green-400' },
                        { label: 'FAILED MISSIONS', value: totalLosses, color: 'text-red-400' },
                        { label: 'W/L RATIO', value: (totalWins / (totalLosses || 1)).toFixed(2), color: 'text-compete-purple' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white/[0.02] border border-white/10 p-3.5 rounded-2xl">
                          <span className="text-white/30 text-[8px] font-black tracking-widest uppercase">{item.label}</span>
                          <span className={`${item.color} font-black italic text-xs lg:text-sm uppercase`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] opacity-50 uppercase">IDENTITY GENESIS</h3>
                      <div className={`px-3 py-1 ${levelInfo.bg} ${levelInfo.border} border rounded-full text-[8px] font-black ${levelInfo.text} tracking-widest uppercase`}>
                        LVL {ranking?.level || 1}
                      </div>
                    </div>
                    <p className="text-xl lg:text-3xl font-black text-white mb-1 italic leading-none tracking-tighter uppercase">
                      {new Date(profile?.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-white/20 text-[7px] font-black tracking-[0.3em] uppercase">OPERATIONAL SINCE LAUNCH</p>
                    
                    <div className="mt-8 p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-[7px] text-white/30 font-black tracking-widest uppercase">PROGRESS TO LEVEL {(ranking?.level || 1) + 1}</p>
                        <p className="text-[8px] text-compete-purple font-black uppercase tracking-wider">{ranking?.xp || 0} / {((ranking?.level || 1) + 1) * 100} XP</p>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(ranking?.xp % 100) || 0}%` }}
                          transition={{ duration: 1 }}
                          className="bg-gradient-to-r from-compete-purple to-compete-purple-glow h-full rounded-full shadow-[0_0_10px_rgba(155,92,255,0.5)]"
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
                  className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6"
                >
                  <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 flex items-center gap-2 opacity-50 uppercase">
                    <BarChart3 className="w-[14px] h-[14px] text-compete-purple" /> PERFORMANCE TREND
                  </h3>
                  <div className="h-[200px] lg:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis 
                          dataKey="month" 
                          stroke="rgba(255, 255, 255, 0.1)" 
                          fontSize={9} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.1)" 
                          fontSize={9} 
                          tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0B0B10",
                            border: "1px solid rgba(155, 92, 255, 0.2)",
                            borderRadius: "12px",
                            fontSize: "9px",
                            fontWeight: "bold",
                          }}
                          labelStyle={{ color: "#9B5CFF" }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Bar dataKey="wins" fill="#9B5CFF" radius={[2, 2, 0, 0]} name="WISSIONS WON" />
                        <Bar dataKey="losses" fill="rgba(155, 92, 255, 0.1)" radius={[2, 2, 0, 0]} name="MISSIONS LOST" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Win/Loss Record */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center"
                >
                  <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 opacity-50 uppercase self-start">TOTAL RECORD</h3>
                  {totalWins === 0 && totalLosses === 0 ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-white/20 text-[10px] font-black tracking-[0.3em] uppercase">No matches yet</p>
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Wins", value: totalWins, fill: "#9B5CFF" },
                          { name: "Losses", value: totalLosses, fill: "rgba(155, 92, 255, 0.1)" }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {[
                          { name: "Wins", value: totalWins, fill: "#9B5CFF" },
                          { name: "Losses", value: totalLosses, fill: "rgba(155, 92, 255, 0.1)" }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255, 255, 255, 0.05)" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B0B10",
                          border: "1px solid rgba(155, 92, 255, 0.2)",
                          borderRadius: "12px",
                          fontSize: "9px"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  )}
                </motion.div>
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
                    className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 hover:border-compete-purple/50 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="text-green-400" size={20} />
                    </div>
                    <p className="text-white/30 text-[8px] font-black tracking-widest mb-1 uppercase">TOTAL EARNINGS</p>
                    <p className="text-2xl font-black text-white italic uppercase">Ksh {totalEarnings}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 hover:border-compete-purple/50 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <DollarSign className="text-compete-purple" size={20} />
                    </div>
                    <p className="text-white/30 text-[8px] font-black tracking-widest mb-1 uppercase">TOTAL ENTRY FEES</p>
                    <p className="text-2xl font-black text-white italic uppercase">-Ksh {totalSpent}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 hover:border-compete-purple/50 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <Users className={`${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} size={20} />
                    </div>
                    <p className="text-white/30 text-[8px] font-black tracking-widest mb-1 uppercase">NET FLOW</p>
                    <p className={`text-2xl font-black italic uppercase ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {netProfit >= 0 ? `+Ksh ${netProfit}` : `-Ksh ${Math.abs(netProfit)}`}
                    </p>
                  </motion.div>
                </div>

                {/* Revenue Trend */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6"
                >
                  <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 flex items-center gap-2 opacity-50 uppercase">
                    <BarChart3 size={14} className="text-green-400" /> REVENUE TREND
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartRevenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9B5CFF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#9B5CFF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="week" 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        fontSize={9}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="rgba(255, 255, 255, 0.1)" 
                        fontSize={9}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}
                        tickFormatter={(value) => `Ksh ${value}`}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B0B10",
                          border: "1px solid rgba(155, 92, 255, 0.2)",
                          borderRadius: "12px",
                          fontSize: "9px"
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#9B5CFF" fillOpacity={1} fill="url(#colorRevenue)" name="REVENUE" />
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
                <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 flex items-center gap-2 opacity-50 uppercase">
                  <History size={14} className="text-compete-purple" /> DEPLOYMENT LOG
                </h3>
                <div className="space-y-4">
                  {matches.length === 0 && (
                    <div className="h-40 bg-[#0F0F16]/60 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-white/20 italic font-black tracking-widest uppercase">
                      NO DEPLOYMENT DATA FOUND
                    </div>
                  )}
                  {matches.map((match) => {
                    const isWinner = match.winner_id === profile.id;
                    const opponent = match.host_id === profile.id ? match.opponent?.username : match.host?.username;
                    const resultLabel = match.status === 'resolved' ? (isWinner ? "Win" : "Loss") : match.status;

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-compete-purple/50 transition-all shadow-lg"
                      >
                        <button
                          onClick={() => setExpandedMatch(expandedMatch === match.id ? null : match.id)}
                          className="w-full p-4 lg:p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3 lg:gap-4">
                            <div className={`w-8 h-8 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center font-black italic text-sm lg:text-lg ${match.status !== 'resolved' ? "bg-white/10 text-white/40" :
                              (isWinner ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")
                              } uppercase`}>
                              {resultLabel[0]}
                            </div>
                            <div className="text-left font-mono">
                              <p className="text-white font-black italic tracking-tighter text-xs lg:text-lg uppercase">vs {opponent || 'ANONYMOUS'}</p>
                              <p className="text-white/30 text-[8px] lg:text-[9px] font-black tracking-widest uppercase">{match.game_name} • {new Date(match.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <p className="text-white font-black italic text-sm lg:text-xl uppercase">{match.prize_pool}</p>
                            <p className={`text-[7px] lg:text-[8px] font-black tracking-widest ${match.status === 'disputed' ? 'text-red-500 animate-pulse' : 'text-white/20'} uppercase`}>
                              {match.status === 'resolved' ? "FINALIZED" : match.status}
                            </p>
                          </div>
                        </button>

                        {expandedMatch === match.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 px-6 py-6 bg-[#0B0B10]/80"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[8px] font-black text-white/30 tracking-widest mb-1 uppercase">MATCH ID</p>
                                <p className="text-xs font-mono text-compete-purple uppercase">{match.id}</p>
                              </div>
                              <div className="flex gap-4">
                                <Link href={`/match/${match.id}`} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black tracking-widest hover:bg-white/10 hover:border-compete-purple/50 transition-all uppercase">
                                  VIEW INTELLIGENCE
                                </Link>
                                {match.status === 'in_progress' && (
                                  <div className="flex items-center gap-2 text-[9px] font-black text-yellow-500 uppercase tracking-wider">
                                    <Zap size={12} /> ACTIVE DEPLOYMENT
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
                  className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 lg:p-8"
                >
                  <h3 className="text-white font-black italic tracking-[0.25em] text-[8px] lg:text-[9px] mb-6 opacity-50 uppercase">SETTINGS & PREFERENCES</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider">EMAIL NOTIFICATIONS</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">Receive updates about your matches</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider">MATCH REMINDERS</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">Get notified before upcoming matches</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/10">
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-wider">DARK MODE</p>
                        <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-1">Always enabled</p>
                      </div>
                      <Switch defaultChecked disabled />
                    </div>

                    <div className="pt-6 border-t border-white/10">
                      <p className="text-[8px] font-black text-compete-purple tracking-[0.25em] mb-4 uppercase">LOCATION</p>
                      <div className="space-y-3">
                        {/* Continent */}
                        <div className="relative group flex items-center">
                          <Globe className="absolute left-4 z-10 text-compete-purple pointer-events-none" size={14} />
                          <select
                            value={profile?.region || ''}
                            onChange={async (e) => {
                              const newRegion = e.target.value;
                              const { error } = await supabase
                                .from('profiles')
                                .update({ region: newRegion })
                                .eq('id', profile.id);
                              if (error) {
                                toast.error("Failed to update continent");
                              } else {
                                setProfile({ ...profile, region: newRegion });
                                toast.success("Continent updated");
                              }
                            }}
                            className="w-full bg-white/[0.03] border border-white/10 p-4 pl-12 pr-10 text-white outline-none focus:border-compete-purple transition-all font-mono font-black tracking-[0.1em] text-[10px] appearance-none cursor-pointer rounded-2xl"
                          >
                            <option value="" className="bg-[#0A0A0F]">SELECT CONTINENT</option>
                            {[
                              { code: 'AF', name: 'Africa' },
                              { code: 'AS', name: 'Asia' },
                              { code: 'EU', name: 'Europe' },
                              { code: 'NA', name: 'N. America' },
                              { code: 'SA', name: 'S. America' },
                              { code: 'OC', name: 'Oceania' },
                              { code: 'AN', name: 'Antarctica' },
                            ].map(r => (
                              <option key={r.code} value={r.code} className="bg-[#0A0A0F]">{r.name.toUpperCase()}</option>
                            ))}
                          </select>
                          <div className="absolute right-4 z-10 pointer-events-none text-white/20 text-[10px]">▼</div>
                        </div>

                        {/* Country */}
                        <input
                          type="text"
                          placeholder="COUNTRY (e.g. Kenya)"
                          value={locationForm.country}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, country: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/10 p-4 text-white outline-none focus:border-compete-purple transition-all font-mono font-black tracking-[0.1em] text-[10px] placeholder:text-white/20 rounded-2xl uppercase"
                        />

                        {/* City */}
                        <input
                          type="text"
                          placeholder="CITY (e.g. Nairobi)"
                          value={locationForm.city}
                          onChange={(e) => setLocationForm(prev => ({ ...prev, city: e.target.value }))}
                          className="w-full bg-white/[0.03] border border-white/10 p-4 text-white outline-none focus:border-compete-purple transition-all font-mono font-black tracking-[0.1em] text-[10px] placeholder:text-white/20 rounded-2xl uppercase"
                        />

                        <button
                          onClick={async () => {
                            setSavingLocation(true);
                            const { error } = await supabase
                              .from('profiles')
                              .update({
                                country: locationForm.country.trim() || null,
                                city: locationForm.city.trim() || null,
                              })
                              .eq('id', profile.id);
                            setSavingLocation(false);
                            if (error) {
                              toast.error("Failed to save location");
                            } else {
                              setProfile({ ...profile, ...locationForm });
                              toast.success("Location saved — rankings updated");
                            }
                          }}
                          disabled={savingLocation}
                          className="w-full py-3 bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-compete-purple hover:text-white transition-all disabled:opacity-50"
                        >
                          {savingLocation ? "Saving..." : "Save Location"}
                        </button>

                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase">
                          Your city, country, and continent determine which leaderboard tiers you appear on.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ID Popup for Moderator */}
      <AnimatePresence>
        {showIdPopup && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!updatingAvatar) {
                  setShowIdPopup(false);
                  setIsSelectingAvatar(false);
                }
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative bg-[#0A0A0F] border border-white/10 p-6 rounded-[2rem] max-w-[320px] w-full shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden font-mono"
            >
              {/* Decorative Scanline */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
                <motion.div
                  animate={{ y: ['0%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-full h-1 bg-gradient-to-r from-transparent via-compete-purple to-transparent"
                />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} className="text-compete-purple" />
                    <span className="text-[8px] font-black text-white/40 tracking-[0.3em] uppercase">NEURAL ID</span>
                  </div>
                  <button
                    onClick={() => { setShowIdPopup(false); setIsSelectingAvatar(false); }}
                    className="text-white/20 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setIsSelectingAvatar(!isSelectingAvatar)}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-compete-purple to-pink-500 p-[1.5px] cursor-pointer relative overflow-hidden"
                    >
                      <div className="w-full h-full bg-black rounded-full flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                          <span className="text-2xl font-black italic text-compete-purple uppercase">{profile?.username?.[0]}</span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                        <Camera size={20} className="text-white" />
                      </div>
                    </motion.div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-[#0A0A0F] flex items-center justify-center">
                      <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 mt-4">
                      <input 
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="bg-white/5 border border-white/10 rounded-full px-3 py-1.5 text-xs font-black italic text-white outline-none focus:border-compete-purple w-32 font-mono uppercase"
                        autoFocus
                      />
                      <button onClick={handleNameUpdate} className="text-green-400 hover:text-green-300">
                        {updatingName ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      </button>
                      <button onClick={() => { setIsEditingName(false); setNewUsername(profile.username); }} className="text-red-400 hover:text-red-300">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-4 group">
                      <h3 className="text-lg font-black italic tracking-tighter text-white leading-none uppercase">{profile?.username}</h3>
                      <button 
                        onClick={() => setIsEditingName(true)}
                        className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                      >
                        <Edit3 size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                  <p className={`${levelInfo.text} text-[7px] font-black tracking-[0.4em] mt-2 opacity-70 uppercase`}>LEVEL {ranking?.level || 1} • {levelInfo.name.toUpperCase()}</p>
                </div>

                <AnimatePresence mode="wait">
                  {isSelectingAvatar ? (
                    <motion.div
                      key="selector"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-[8px] font-black text-white/30 tracking-widest uppercase">SELECT AVATAR</p>
                        <button onClick={() => setIsSelectingAvatar(false)} className="text-[8px] font-black text-compete-purple uppercase">BACK</button>
                      </div>
                      <div className="flex items-center justify-center py-6 border border-white/10 rounded-2xl bg-white/[0.02]">
                        <p className="text-white/20 text-[9px] font-black tracking-[0.3em] uppercase">Custom photo upload coming soon</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="details"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="space-y-2.5"
                    >
                      <div className="bg-[#0F0F16]/60 border border-white/10 p-3.5 rounded-2xl">
                        <p className="text-[8px] font-black text-white/30 tracking-widest mb-1 uppercase">NEURAL SIGNATURE</p>
                        <div className="flex items-center justify-between gap-2 bg-black/40 border border-white/10 p-2.5 rounded-xl group/sig">
                          <p className="text-[9px] font-mono text-compete-purple truncate uppercase">
                            {revealSignature ? profile?.id : `${profile?.id?.slice(0, 8)}••••••••${profile?.id?.slice(-4)}`}
                          </p>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => setRevealSignature(!revealSignature)}
                              className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-white"
                              title={revealSignature ? "Mask Signature" : "Reveal Signature"}
                            >
                              {revealSignature ? <EyeOff size={10} /> : <Eye size={10} />}
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(profile?.id || "");
                                toast.success("Signature Uplinked to Clipboard");
                              }}
                              className="p-1 hover:bg-white/10 rounded transition-colors text-white/30 hover:text-white"
                              title="Copy Signature"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#0F0F16]/60 border border-white/10 p-3 rounded-2xl text-center">
                          <p className="text-[8px] font-black text-white/30 tracking-widest mb-1 uppercase">STATUS</p>
                          <p className="text-[9px] font-black text-green-500 tracking-widest uppercase">OPERATIONAL</p>
                        </div>
                        <div className="bg-[#0F0F16]/60 border border-white/10 p-3 rounded-2xl text-center">
                          <p className="text-[8px] font-black text-white/30 tracking-widest mb-1 uppercase">UPLINK</p>
                          <p className="text-[9px] font-black text-blue-400 tracking-widest uppercase">STABLE</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}