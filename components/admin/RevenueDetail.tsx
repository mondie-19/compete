"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, DollarSign, Calendar, Globe } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface RevenueDetailProps {
  stats: any[];
  timeline: any[];
}

export function RevenueDetail({ stats, timeline }: RevenueDetailProps) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('all');

  // Filter stats to only include the 8 specific regions
  const allowedRegions = ['World', 'Africa', 'Asia', 'Europe', 'N. America', 'S. America', 'Oceania', 'Antarctica'];
  const filteredStats = allowedRegions.map(regionName => {
    return stats.find(s => s.region === regionName) || { region: regionName, total_revenue: 0, active_users: 0 };
  });

  const worldRevenue = filteredStats.find(s => s.region === 'World')?.total_revenue || 0;

  return (
    <div className="space-y-8">
      {/* Time Range Switcher */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
        {(['24h', '7d', '30d', 'all'] as const).map((r) => (
          <button
            key={r}
            onClick={() => setTimeRange(r)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
              timeRange === r ? 'bg-compete-purple text-white shadow-purple-glow' : 'text-white/40 hover:text-white'
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Regional Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredStats.map((stat, idx) => {
          const isWorld = stat.region === 'World';
          const share = worldRevenue > 0 && !isWorld ? (stat.total_revenue / worldRevenue) * 100 : 0;
          
          return (
            <motion.div 
              key={stat.region}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-3 rounded-2xl border transition-all duration-300 group ${
                isWorld 
                ? 'col-span-full bg-compete-purple/10 border-compete-purple/30 shadow-[0_0_20px_rgba(155,92,255,0.05)]' 
                : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className={`text-[8px] font-black uppercase tracking-[0.1em] mb-0.5 ${isWorld ? 'text-compete-purple' : 'text-white/40'}`}>
                    {stat.region}
                  </h4>
                  <p className={`${isWorld ? 'text-lg' : 'text-sm'} font-black italic text-white tracking-tighter`}>
                    KSh {stat.total_revenue.toLocaleString()}
                  </p>
                </div>
                <div className={`${isWorld ? 'w-8 h-8' : 'w-6 h-6'} rounded-lg flex items-center justify-center border ${
                  isWorld ? 'bg-compete-purple/20 border-compete-purple/40 text-compete-purple' : 'bg-white/5 border-white/10 text-white/20'
                }`}>
                  {isWorld ? <Globe size={16} /> : <DollarSign size={12} />}
                </div>
              </div>

              {!isWorld && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-white/20">
                    <span>Share</span>
                    <span>{share.toFixed(1)}%</span>
                  </div>
                  <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${share}%` }}
                      className="h-full bg-compete-purple shadow-[0_0_5px_rgba(155,92,255,0.5)]"
                    />
                  </div>
                </div>
              )}

              {isWorld && (
                <div className="flex gap-4 mt-2 pt-2 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[7px] font-black uppercase text-white/20 mb-0.5">Aggregated Yield</p>
                    <p className="text-[10px] font-bold text-white/60 uppercase">Nominal</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Revenue Velocity (Daily)</h3>
          <Calendar size={16} className="text-compete-purple" />
        </div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeline.filter(t => t.region === 'World').reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="day" 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                stroke="rgba(255,255,255,0.2)"
                fontSize={8}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={8}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `KSh ${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0A0A0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#9B5CFF', fontWeight: 'bold', fontSize: '10px' }}
                labelStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: '8px', marginBottom: '4px' }}
                labelFormatter={(val) => new Date(val).toLocaleDateString()}
              />
              <Bar dataKey="revenue" fill="#9B5CFF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
