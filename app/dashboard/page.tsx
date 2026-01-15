"use client";
import { motion } from "framer-motion";
import { Settings, Shield, Zap, Trophy, History, Star } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Global Rank", value: "#1,242", icon: <Trophy className="text-yellow-500" /> },
    { label: "Win Rate", value: "68%", icon: <Zap className="text-compete-purple" /> },
    { label: "Matches", value: "142", icon: <History className="text-blue-400" /> },
    { label: "Compete Level", value: "24", icon: <Star className="text-compete-purple-glow" /> },
  ];

  return (
    <div className="min-h-screen bg-compete-bg p-4 md:p-8 pt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar / Profile Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 space-y-6"
        >
          <div className="bg-compete-card border border-white/10 rounded-2xl p-6 text-center shadow-purple-glow">
            <div className="relative mx-auto w-24 h-24 rounded-full border-2 border-compete-purple p-1 mb-4">
              <div className="w-full h-full bg-compete-purple/20 rounded-full flex items-center justify-center text-3xl">
                👤
              </div>
              <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-compete-card" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase italic">NeonSlayer</h2>
            <p className="text-compete-muted text-xs tracking-widest uppercase">Elite Tier</p>
            <button className="mt-6 w-full py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Settings size={16} /> Edit Profile
            </button>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-9 space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className="bg-compete-card border border-white/5 p-4 rounded-xl">
                <div className="mb-2">{stat.icon}</div>
                <p className="text-compete-muted text-xs uppercase font-bold">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-compete-card/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold uppercase italic mb-6 flex items-center gap-2">
              <Shield className="text-compete-purple" /> Recent Match History
            </h3>
            <div className="space-y-4">
              {[1, 2, 3].map((match) => (
                <div key={match} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-compete-purple/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 text-green-500 rounded flex items-center justify-center font-bold">W</div>
                    <div>
                      <p className="text-white font-bold text-sm">Valorant Pro League</p>
                      <p className="text-compete-muted text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-compete-purple font-bold">+24 RP</p>
                    <p className="text-compete-muted text-xs">MVP</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}