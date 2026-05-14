"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, TrendingDown, Minus, Crown, Award, Search, Filter, 
  ShieldCheck, Globe, ChevronDown, Zap, Map, Landmark, Compass, 
  Mountain, Snowflake, Waves, User
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import Link from "next/link";

const CONTINENTS = [
  { id: "All", name: "World", icon: <Globe size={14} /> },
  { id: "AF", name: "Africa", icon: <Map size={14} /> },
  { id: "AS", name: "Asia", icon: <Zap size={14} /> },
  { id: "EU", name: "Europe", icon: <Landmark size={14} /> },
  { id: "NA", name: "N. America", icon: <Compass size={14} /> },
  { id: "SA", name: "S. America", icon: <Mountain size={14} /> },
  { id: "OC", name: "Oceania", icon: <Waves size={14} /> },
  { id: "AN", name: "Antarctica", icon: <Snowflake size={14} /> },
];

export default function RankingsPage() {
  const supabase = createClient();
  useHeartbeat();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [rankings, setRankings] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: rankData } = await supabase
        .from("user_rankings")
        .select("*")
        .order("rank", { ascending: true });

      setRankings(rankData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let myData = rankData?.find(r => r.username === (user.user_metadata?.username || user.email?.split('@')[0]));
        
        if (!myData) {
          // Fetch live user stats if not in top rankings
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          const { count } = await supabase
            .from('challenges')
            .select('*', { count: 'exact', head: true })
            .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
            .eq('status', 'completed');

          // Get earnings from a sum if total_earnings isn't a direct field
          const { data: payments } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

          myData = {
            username: profile?.username || user.email?.split('@')[0],
            avatar_url: profile?.avatar_url,
            rank: ">99",
            total_earnings: payments?.balance || 0,
            total_matches: count || 0
          };
        }
        setMyRank(myData);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);


  const filteredPlayers = useMemo(() => {
    return rankings.filter(player => {
      const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = selectedCountry === "All" || player.region === selectedCountry;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedCountry, rankings]);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden pt-32">
      <div className="px-6">
        {/* Visual Background - Consistent with your particles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-compete-purple/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <section className="py-8 flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[10px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck size={12} /> Live Standings • Season 04
              </div>
              <h1 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                The <span className="text-compete-purple text-glow">Elite</span> List
              </h1>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row items-center gap-6 mb-10">
            {/* Reduced Search Input */}
            <div className="relative group flex-1 w-full lg:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-compete-purple transition-colors" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search players..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:bg-white/10 focus:border-compete-purple/50 outline-none transition-all font-bold placeholder:text-white/10 text-sm"
              />
            </div>

            {/* Continent Icon Tiles */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 lg:gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-full lg:w-auto">
              {CONTINENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${
                    selectedCountry === c.id 
                    ? "bg-compete-purple text-white shadow-purple-glow" 
                    : "text-compete-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {c.icon}
                  <span className="hidden min-[480px]:inline sm:inline">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed View - Table for Desktop, Cards for Mobile */}
          <section className="bg-white/[0.02] border border-white/5 rounded-2xl lg:rounded-[32px] overflow-hidden mb-16 backdrop-blur-xl shadow-2xl">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/5">
                    <th className="p-8">Rank</th>
                    <th className="p-8">Competitor</th>
                    <th className="p-8 text-center">Origin</th>
                    <th className="p-8">Performance</th>
                    <th className="p-8">Experience</th>
                    <th className="p-8 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-32 text-center text-white/20 italic font-black uppercase tracking-widest animate-pulse">
                        Synchronizing Global Standings...
                      </td>
                    </tr>
                  ) : filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, idx) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={player.username}
                        className="hover:bg-compete-purple/[0.03] transition-all group cursor-default"
                      >
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <span className={`text-2xl font-black italic tracking-tighter ${player.rank === 1 ? 'text-compete-purple text-glow' : 'text-white/10 group-hover:text-white/40'}`}>
                              #{player.rank.toString().padStart(2, '0')}
                            </span>
                            {player.rank === 1 && <Crown size={18} className="text-yellow-500 animate-bounce" />}
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform overflow-hidden">
                                {player.avatar_url ? (
                                  <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-black italic text-compete-purple">{player.username[0]}</span>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-black border border-white/10 flex items-center justify-center text-[10px] font-black text-compete-purple">
                                {Math.min(99, Math.floor(player.total_matches / 10) + 1)}
                              </div>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-tight text-white flex items-center gap-2">
                                {player.username}
                                {player.total_earnings > 1000 && <Award size={14} className="text-compete-purple" />}
                              </p>
                              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{player.total_matches} Deployments</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-8 text-center text-2xl filter saturate-50 group-hover:saturate-100 transition-all opacity-20">🌍</td>
                        <td className="p-8">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                              <span className="text-white/40">Win Rate</span>
                              <span className="text-compete-purple">{player.win_rate}%</span>
                            </div>
                            <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-compete-purple shadow-[0_0_8px_#9B5CFF]" style={{ width: `${player.win_rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <div className="font-mono font-black text-lg group-hover:text-compete-purple transition-colors">
                            ${player.total_earnings.toLocaleString()}
                            <span className="text-[10px] text-white/20 ml-1 uppercase font-sans">USD</span>
                          </div>
                        </td>
                        <td className="p-8 text-right">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 transition-colors ${player.rank <= 3 ? "group-hover:border-green-500/50" : "group-hover:border-white/20"
                            }`}>
                            {player.rank <= 3 ? <TrendingUp className="text-green-400" size={18} /> : <Minus className="text-white/20" size={18} />}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-32 text-center text-white/20 font-black uppercase italic tracking-widest">
                        No Competitors Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/[0.03]">
              {loading ? (
                <div className="p-16 text-center text-white/20 italic font-black uppercase tracking-widest animate-pulse text-xs">
                  Synchronizing Global Standings...
                </div>
              ) : filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, idx) => (
                  <motion.div
                    key={player.username}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-xl font-black italic tracking-tighter ${player.rank === 1 ? 'text-compete-purple' : 'text-white/10'}`}>
                          #{player.rank.toString().padStart(2, '0')}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black italic text-compete-purple text-xs">{player.username[0]}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-white text-xs flex items-center gap-1">
                            {player.username}
                            {player.total_earnings > 1000 && <Award size={10} className="text-compete-purple" />}
                          </p>
                          <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{player.total_matches} Deployments</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-white text-xs">${player.total_earnings.toLocaleString()}</p>
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Earnings</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter">
                            <span className="text-white/20">Win Rate</span>
                            <span className="text-compete-purple">{player.win_rate}%</span>
                          </div>
                          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-compete-purple" style={{ width: `${player.win_rate}%` }} />
                          </div>
                       </div>
                       <div className="flex justify-end items-center gap-2">
                          <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">Trend</span>
                          <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                            {player.rank <= 3 ? <TrendingUp className="text-green-400" size={12} /> : <Minus className="text-white/20" size={12} />}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center text-white/20 font-black uppercase italic tracking-widest text-xs">
                  No Competitors Found
                </div>
              )}
            </div>
          </section>

          {/* PERSONAL RANK STICKY BANNER - Optimized View */}
          {myRank && (
            <div className="sticky bottom-8 z-40 max-w-4xl mx-auto px-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-compete-purple/90 backdrop-blur-2xl border border-white/30 rounded-[24px] p-5 shadow-[0_20px_50px_rgba(155,92,255,0.3)] flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                    {myRank.avatar_url ? (
                      <img src={myRank.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-white/20" />
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-black/50 tracking-tighter mb-0.5">
                      Your Global Rank {myRank.rank !== ">99" ? `#${myRank.rank}` : ""}
                    </p>
                    <p className="font-black text-white uppercase italic text-lg leading-none">
                      {myRank.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="hidden md:block text-right">
                    <p className="text-[10px] font-black uppercase text-black/50 tracking-tighter mb-0.5">Total Deployments</p>
                    <p className="font-mono font-black text-white leading-none">{myRank.total_matches || "0"} Matches</p>
                  </div>
                  <Link href="/dashboard" className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white hover:text-black transition-all shadow-xl">
                    View Intelligence
                  </Link>
                </div>
              </motion.div>
            </div>
          )}
        </div>
        <div className="h-20" />
      </div>
    </main>
  );
}