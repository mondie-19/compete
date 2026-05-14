"use client";
import { motion } from "framer-motion";
import { Zap, Target } from "lucide-react";

interface StakedDetailProps {
  stats: any[];
}

export function StakedDetail({ stats }: StakedDetailProps) {
  const allowedRegions = ['World', 'Africa', 'Asia', 'Europe', 'N. America', 'S. America', 'Oceania', 'Antarctica'];
  const filteredStats = allowedRegions.map(regionName => {
    return stats.find(s => s.region === regionName) || { region: regionName, total_staked: 0, active_matches: 0 };
  });

  const worldStaked = filteredStats.find(s => s.region === 'World')?.total_staked || 0;

  return (
    <div className="space-y-8">
      {/* Regional Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStats.map((stat, idx) => {
          const isWorld = stat.region === 'World';
          const percentage = worldStaked > 0 && !isWorld ? (stat.total_staked / worldStaked) * 100 : 0;
          
          return (
            <motion.div 
              key={stat.region}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-2xl border transition-all duration-300 group ${
                isWorld 
                ? 'col-span-full bg-orange-500/10 border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={`text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 ${isWorld ? 'text-orange-500' : 'text-white/40'}`}>
                    {stat.region}
                  </h4>
                  <p className={`${isWorld ? 'text-lg' : 'text-sm'} font-black italic text-white tracking-tighter`}>
                    KSh {stat.total_staked.toLocaleString()}
                  </p>
                </div>
                <div className={`${isWorld ? 'w-8 h-8' : 'w-6 h-6'} rounded-lg flex items-center justify-center border ${
                  isWorld ? 'bg-orange-500/20 border-orange-500/40 text-orange-500' : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                   <Target size={isWorld ? 16 : 12} />
                </div>
              </div>

              {!isWorld && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/20">
                    <span>Weight</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.5)]"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[7px] font-black uppercase text-orange-500/70">
                    <Zap size={8} /> {stat.active_matches} Live
                  </div>
                </div>
              )}

              {isWorld && (
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[7px] font-black uppercase text-white/20 mb-0.5">Global Liquidity</p>
                    <p className="text-[10px] font-bold text-orange-500/80 uppercase">{stat.active_matches} Matches</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
