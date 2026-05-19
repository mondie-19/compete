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
    <main className="relative min-h-screen bg-[#0A0A0F] text-white overflow-hidden pt-32 font-mono">
      <div className="px-6">

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <section className="py-4 flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[9px] font-black uppercase tracking-widest mb-2">
                <ShieldCheck size={10} /> LIVE STANDINGS • SEASON 01
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                THE <span className="text-compete-purple text-glow">ELITE</span> LIST
              </h1>
            </div>
          </section>

          <div className="flex flex-col lg:flex-row items-center gap-4 mb-6">
            {/* Reduced Search Input */}
            <div className="relative group flex-1 w-full lg:max-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-compete-purple transition-colors" size={12} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH PLAYERS..."
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-3 focus:bg-black/60 focus:border-compete-purple/50 outline-none transition-all placeholder:text-white/20 text-xs font-black uppercase text-white"
              />
            </div>

            {/* Continent Icon Tiles */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1 p-1 bg-black/40 border border-white/10 rounded-xl w-full lg:w-auto">
              {CONTINENTS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCountry(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                    selectedCountry === c.id 
                    ? "bg-compete-purple text-white shadow-md" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {c.icon}
                  <span className="hidden min-[480px]:inline sm:inline">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed View - Table for Desktop, Cards for Mobile */}
          <section className="bg-[#0F0F16]/60 border border-white/10 rounded-2xl overflow-hidden mb-16 backdrop-blur-md shadow-2xl">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 border-b border-white/10">
                    <th className="px-6 py-4">RANK</th>
                    <th className="px-6 py-4">COMPETITOR</th>
                    <th className="px-6 py-4 text-center">ORIGIN</th>
                    <th className="px-6 py-4">PERFORMANCE</th>
                    <th className="px-6 py-4">EXPERIENCE</th>
                    <th className="px-6 py-4 text-right">TREND</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-32 text-center text-white/20 italic font-black uppercase tracking-widest animate-pulse">
                        SYNCHRONIZING GLOBAL STANDINGS...
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
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-xl font-black italic tracking-tighter ${player.rank === 1 ? 'text-compete-purple text-glow' : 'text-white/10 group-hover:text-white/40'}`}>
                              #{player.rank.toString().padStart(2, '0')}
                            </span>
                            {player.rank === 1 && <Crown size={14} className="text-yellow-500 animate-bounce" />}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform overflow-hidden">
                                {player.avatar_url ? (
                                  <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-black italic text-compete-purple">{player.username[0].toUpperCase()}</span>
                                )}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black border border-white/10 flex items-center justify-center text-[7px] font-black text-compete-purple">
                                {Math.min(99, Math.floor(player.total_matches / 10) + 1)}
                              </div>
                            </div>
                            <div>
                              <p className="font-black uppercase tracking-tight text-white text-sm flex items-center gap-1.5">
                                {player.username}
                                {player.total_earnings > 1000 && <Award size={12} className="text-compete-purple" />}
                              </p>
                              <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{player.total_matches} DEPLOYMENTS</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center text-xl filter saturate-50 group-hover:saturate-100 transition-all opacity-20">🌍</td>
                        <td className="px-6 py-3">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                              <span className="text-white/40">WIN RATE</span>
                              <span className="text-compete-purple">{player.win_rate}%</span>
                            </div>
                            <div className="w-20 h-0.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-compete-purple shadow-[0_0_8px_#9B5CFF]" style={{ width: `${player.win_rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <div className="font-mono font-black text-base group-hover:text-compete-purple transition-colors uppercase">
                            ${player.total_earnings.toLocaleString()}
                            <span className="text-[9px] text-white/20 ml-1 uppercase">USD</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className={`inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 border border-white/10 transition-colors ${player.rank <= 3 ? "group-hover:border-green-500/50" : "group-hover:border-white/20"
                            }`}>
                            {player.rank <= 3 ? <TrendingUp className="text-green-400" size={12} /> : <Minus className="text-white/20" size={12} />}
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-32 text-center text-white/20 font-black uppercase italic tracking-widest">
                        NO COMPETITORS FOUND
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
                  SYNCHRONIZING GLOBAL STANDINGS...
                </div>
              ) : filteredPlayers.length > 0 ? (
                filteredPlayers.map((player, idx) => (
                  <motion.div
                    key={player.username}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-3 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black italic tracking-tighter ${player.rank === 1 ? 'text-compete-purple' : 'text-white/10'}`}>
                          #{player.rank.toString().padStart(2, '0')}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                          {player.avatar_url ? (
                            <img src={player.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-black italic text-compete-purple text-[10px]">{player.username[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-white text-[10px] flex items-center gap-1">
                            {player.username}
                            {player.total_earnings > 1000 && <Award size={9} className="text-compete-purple" />}
                          </p>
                          <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">{player.total_matches} DEPLOYMENTS</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-white text-[10px]">${player.total_earnings.toLocaleString()}</p>
                        <p className="text-[7px] font-black uppercase text-white/20 tracking-widest">EARNINGS</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-1">
                       <div className="space-y-1">
                          <div className="flex justify-between text-[7px] font-black uppercase tracking-tighter">
                            <span className="text-white/20">WIN RATE</span>
                            <span className="text-compete-purple">{player.win_rate}%</span>
                          </div>
                          <div className="w-full h-0.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-compete-purple" style={{ width: `${player.win_rate}%` }} />
                          </div>
                       </div>
                       <div className="flex justify-end items-center gap-2">
                          <span className="text-[7px] font-black uppercase text-white/20 tracking-widest">TREND</span>
                          <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            {player.rank <= 3 ? <TrendingUp className="text-green-400" size={10} /> : <Minus className="text-white/20" size={10} />}
                          </div>
                       </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-16 text-center text-white/20 font-black uppercase italic tracking-widest text-xs">
                  NO COMPETITORS FOUND
                </div>
              )}
            </div>
          </section>

          {/* PERSONAL RANK STICKY BANNER - Optimized View */}
          {myRank && (
            <div className="sticky bottom-8 z-40 max-w-4xl mx-auto px-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-compete-purple border border-white/20 rounded-2xl p-4 shadow-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center overflow-hidden">
                    {myRank.avatar_url ? (
                      <img src={myRank.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} className="text-white/20" />
                    )}
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-white/50 tracking-tighter mb-0.5">
                      YOUR GLOBAL RANK {myRank.rank !== ">99" ? `#${myRank.rank}` : ""}
                    </p>
                    <p className="font-black text-white uppercase italic text-base leading-none">
                      {myRank.username}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-[9px] font-black uppercase text-white/50 tracking-tighter mb-0.5">TOTAL DEPLOYMENTS</p>
                    <p className="font-mono font-black text-white leading-none text-sm">{myRank.total_matches || "0"} MATCHES</p>
                  </div>
                  <Link href="/dashboard" className="bg-black text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic hover:bg-white hover:text-black transition-all shadow-xl">
                    VIEW INTEL
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