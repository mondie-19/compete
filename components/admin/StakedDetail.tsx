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
    <div className="space-y-4">
      {/* Regional Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filteredStats.map((stat, idx) => {
          const isWorld = stat.region === 'World';
          const percentage = worldStaked > 0 && !isWorld ? (stat.total_staked / worldStaked) * 100 : 0;
          
          return (
            <motion.div 
              key={stat.region}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-2.5 rounded-none border transition-all duration-200 group ${
                isWorld 
                ? 'col-span-full bg-orange-500/5 border-orange-500/20' 
                : 'bg-transparent border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <h4 className={`text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 ${isWorld ? 'text-orange-500' : 'text-white/40'}`}>
                    {stat.region}
                  </h4>
                  <p className={`${isWorld ? 'text-base' : 'text-xs'} font-black italic text-white tracking-tighter`}>
                    KSh {stat.total_staked.toLocaleString()}
                  </p>
                </div>
                <div className={`${isWorld ? 'w-7 h-7' : 'w-5 h-5'} rounded-none flex items-center justify-center border ${
                  isWorld ? 'bg-orange-500/15 border-orange-500/30 text-orange-500' : 'bg-transparent border-white/10 text-white/20'
                }`}>
                   <Target size={isWorld ? 14 : 10} />
                </div>
              </div>

              {!isWorld && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[6px] font-black uppercase tracking-widest text-white/20">
                    <span>Weight</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-none overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      className="h-full bg-orange-500"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[6px] font-black uppercase text-orange-500/70">
                    <Zap size={8} /> {stat.active_matches} Live
                  </div>
                </div>
              )}

              {isWorld && (
                <div className="flex gap-4 mt-1.5 pt-1.5 border-t border-white/5">
                  <div className="flex-1 flex justify-between items-center">
                    <p className="text-[6px] font-black uppercase text-white/20">Global Liquidity</p>
                    <p className="text-[8px] font-bold text-orange-500/80 uppercase">{stat.active_matches} Matches</p>
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
