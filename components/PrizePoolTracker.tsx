import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Loader2 } from "lucide-react";
import { createClient } from "@/supabase/client";

export default function PrizePoolTracker() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    distributed: 0,
    upcoming: 0,
  });
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      // 1. Fetch Total Prize Pool (Sum of all prizes ever)
      const { data: allChallenges } = await supabase
        .from("challenges")
        .select("prize_pool, status");

      if (allChallenges) {
        const total = allChallenges.reduce((acc, c) => acc + (Number(c.prize_pool) || 0), 0);
        
        // 2. Fetch Distributed (Winner payouts minus rake)
        // Actually, let's query transactions for more accuracy
        const { data: payouts } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "challenge_win");
        
        const distributed = payouts?.reduce((acc, t) => acc + (Number(t.amount) || 0), 0) || 0;

        // 3. Upcoming (Open and In Progress)
        const upcoming = allChallenges
          .filter(c => c.status === 'open' || c.status === 'in_progress')
          .reduce((acc, c) => acc + (Number(c.prize_pool) || 0), 0);

        setStats({ total, distributed, upcoming });

        // 4. Fetch logic for "Active Tournaments" - recent big matches
        const { data: recent } = await supabase
          .from("challenges")
          .select("game_name, prize_pool, created_at")
          .order("created_at", { ascending: false })
          .limit(3);
        
        if (recent) setRecentTournaments(recent);
      }
      setLoading(false);
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-30">
        <Loader2 className="animate-spin text-compete-purple mb-4" size={40} />
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center opacity-30">
        <Loader2 className="animate-spin text-compete-purple mb-4" size={40} />
        <p className="text-[10px] font-black tracking-[0.4em]">Synching Prize Matrix...</p>
      </div>
    );
  }

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
          <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter mb-4">
            Global <span className="text-compete-purple">Vault</span>
          </h2>
          <p className="text-compete-muted max-w-2xl mx-auto text-sm font-mono tracking-widest">
            Live distribution tracker for competitive rewards and ecosystem payouts
          </p>
        </motion.div>

        {/* Main Prize Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Pool */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-compete-purple opacity-20" />
            <p className="text-white/20 tracking-[0.3em] text-[10px] font-black mb-6">Aggregate Stakes</p>
            <div className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-2">
              KSh{(stats.total / 1000).toFixed(1)}K
            </div>
            <p className="text-compete-purple font-black text-[10px] tracking-widest">Lifetime Liquidity</p>
          </motion.div>

          {/* Distributed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-green-500/5 border border-green-500/20 rounded-[2.5rem] p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-green-500 opacity-20" />
            <p className="text-green-500/30 tracking-[0.3em] text-[10px] font-black mb-6">Paid to Victors</p>
            <div className="text-5xl md:text-6xl font-black text-green-500 italic tracking-tighter mb-2">
              KSh{(stats.distributed / 1000).toFixed(1)}K
            </div>
            <p className="text-white font-black text-[10px] tracking-widest">Transferred to Wallets</p>
          </motion.div>

          {/* Upcoming */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-compete-purple/10 border border-compete-purple/30 rounded-[2.5rem] p-10 text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-compete-purple animate-pulse" />
            <p className="text-compete-purple/40 tracking-[0.3em] text-[10px] font-black mb-6">Active Bounties</p>
            <div className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-2">
              KSh{(stats.upcoming / 1000).toFixed(1)}K
            </div>
            <p className="text-compete-purple font-black text-[10px] tracking-widest">In Play / Escrow</p>
          </motion.div>
        </div>

        {/* Distribution Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Prize Tiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8"
          >
            <h3 className="text-xs font-black text-white tracking-[0.4em] mb-10 flex items-center gap-3">
              <Zap size={18} className="text-compete-purple" />
              Strategic Yield Breakdown
            </h3>
            <div className="space-y-6">
              {[
                { label: "Winner Payout", percent: 85, color: "from-compete-purple to-compete-purpleGlow" },
                { label: "Platform Maintenance", percent: 10, color: "from-white/20 to-white/5" },
                { label: "Ecosystem Burn", percent: 5, color: "from-red-500/40 to-red-500/5" },
              ].map((tier, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-white/40 tracking-widest">{tier.label}</p>
                    <span className="text-white font-black italic">{tier.percent}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${tier.percent}%` }}
                      transition={{ delay: idx * 0.1 + 0.2, duration: 0.8 }}
                      viewport={{ once: true }}
                      className={`h-full bg-gradient-to-r ${tier.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Tournaments - Replaced with Recently Deployed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8"
          >
            <h3 className="text-xs font-black text-white tracking-[0.4em] mb-10 flex items-center gap-3">
              <TrendingUp size={18} className="text-compete-purple" />
              Live Deployment Feed
            </h3>
            <div className="space-y-4">
              {recentTournaments.map((tournament, idx) => (
                <div
                  key={idx}
                  className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 group hover:border-compete-purple/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-white text-xs italic tracking-tight">{tournament.game_name}</p>
                      <p className="text-[9px] text-white/20 font-black tracking-widest mt-1">
                        Deployed {new Date(tournament.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-compete-purple font-black text-2xl italic tracking-tighter">
                        KSh{tournament.prize_pool?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Global Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-12 text-center"
        >
          <h3 className="text-[10px] font-black text-white/30 tracking-[0.5em] mb-10">Liquidity Distribution Index</h3>
          <div className="max-w-3xl mx-auto">
            <div className="h-6 bg-white/5 rounded-full overflow-hidden mb-6 p-1 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(stats.distributed / stats.total) * 100}%` }}
                transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className="h-full bg-gradient-to-r from-compete-purple via-compete-purpleGlow to-white rounded-full shadow-[0_0_20px_rgba(155,92,255,0.4)]"
              />
            </div>
            <p className="text-[11px] font-black tracking-widest text-white/40">
              <span className="text-white">KSh{stats.distributed.toLocaleString()}</span> distributed from <span className="text-white">KSh{stats.total.toLocaleString()}</span> global pool
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
