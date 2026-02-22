"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Crown, Award, Search, Filter, ShieldCheck, Globe, ChevronDown, Zap } from "lucide-react";
import { createClient } from "@/supabase/client";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function RankingsPage() {
  const supabase = createClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [rankings, setRankings] = useState<any[]>([]);
  const [myRank, setMyRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: rankData } = await supabase
        .from("user_rankings")
        .select("*")
        .order("rank", { ascending: true });

      setRankings(rankData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const myData = rankData?.find(r => r.username === (user.user_metadata?.username || user.email?.split('@')[0]));
        setMyRank(myData);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const countries = ["All", "USA", "KOR", "GER", "JPN", "CAN"]; // Mock countries for now as they aren't in the DB view yet

  const filteredPlayers = useMemo(() => {
    return rankings.filter(player => {
      const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm, rankings]);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      <Navbar />
      <div className="px-6">
        {/* Visual Background - Consistent with your particles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-compete-purple/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="h-24" />

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header Section */}
          <section className="py-12 flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[10px] font-black uppercase tracking-widest mb-4">
                <ShieldCheck size={12} /> Live Standings • Season 04
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
                The <span className="text-compete-purple text-glow">Elite</span> List
              </h1>
            </div>

            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              <button className="px-6 py-2 bg-compete-purple text-[10px] font-black uppercase tracking-widest rounded-xl shadow-purple-glow">Global</button>
              <button className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-compete-muted hover:text-white transition-colors">Friends</button>
            </div>
          </section>

          {/* Search and Filters - Redesigned for better UX */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12">
            <div className="md:col-span-8 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-compete-purple transition-colors" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find an operative..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 focus:bg-white/10 focus:border-compete-purple/50 outline-none transition-all font-bold placeholder:text-white/10"
              />
            </div>

            <div className="md:col-span-4 relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-compete-purple transition-colors" size={18} />
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full appearance-none bg-white/5 border border-white/10 px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] outline-none hover:bg-white/10 cursor-pointer transition-all"
              >
                {countries.map(c => <option key={c} value={c} className="bg-neutral-900">{c} Region</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Full Detailed Table */}
          <section className="bg-white/[0.02] border border-white/5 rounded-[32px] overflow-hidden mb-16 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
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
                  <AnimatePresence mode="popLayout">
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
                          exit={{ opacity: 0, scale: 0.95 }}
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
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <td colSpan={6} className="p-32 text-center">
                          <div className="text-white/10 flex flex-col items-center gap-4">
                            <Globe size={48} />
                            <p className="font-black uppercase italic tracking-widest">No Gladiators Found</p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </section>

          {/* PERSONAL RANK STICKY BANNER - Smoother Styling */}
          <div className="sticky bottom-8 z-40 max-w-4xl mx-auto px-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-compete-purple/90 backdrop-blur-2xl border border-white/30 rounded-[24px] p-5 shadow-[0_20px_50px_rgba(155,92,255,0.3)] flex items-center justify-between"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center font-black italic text-xl">
                  {myRank ? `#${myRank.rank}` : "???"}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-black/50 tracking-tighter mb-0.5">Your Global Rank</p>
                  <p className="font-black text-white uppercase italic text-lg leading-none">
                    {myRank?.username || "OPERATIVE"}
                    <span className="text-black/40 text-sm not-italic ml-2">(${myRank?.total_earnings?.toLocaleString() || "0"})</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden md:block text-right">
                  <p className="text-[10px] font-black uppercase text-black/50 tracking-tighter mb-0.5">Total Deployments</p>
                  <p className="font-mono font-black text-white leading-none">{myRank?.total_matches || "0"} Matches</p>
                </div>
                <Link href="/dashboard" className="bg-black text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-white hover:text-black transition-all shadow-xl">
                  View Intelligence
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="h-20" />
      </div>
    </main>
  );
}