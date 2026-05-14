"use client";
import { useState } from "react";
import { Users, Clock, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LiveUsersDetailProps {
  users: any[];
}

export function LiveUsersDetail({ users }: LiveUsersDetailProps) {
  const [tab, setTab] = useState<'active' | 'inactive'>('active');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const now = new Date();
  
  // Categorize users
  // Active = last_seen_at within the last 5 minutes (300000 ms)
  // For the sake of the user's specific request earlier: "threshold for inactivgity is a day ao"
  // Wait, user said "the threshold for inactivgity is a day ao". 
  // Let's use 24 hours as the active threshold.
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const categorizedUsers = users.map(u => {
    const lastSeen = new Date(u.last_seen_at || u.created_at);
    const isInactive = (now.getTime() - lastSeen.getTime()) > ONE_DAY_MS;
    return { ...u, isInactive, lastSeen };
  });

  const REGIONS = ['World', 'Africa', 'Asia', 'Europe', 'N. America', 'S. America', 'Oceania', 'Antarctica'];

  const regionalStats = REGIONS.map(region => {
    const regionUsers = categorizedUsers.filter(u => region === 'World' || (u.region || 'Unknown') === region);
    const active = regionUsers.filter(u => !u.isInactive).length;
    const inactive = regionUsers.filter(u => u.isInactive).length;
    return { region, active, inactive };
  });

  const filteredUsers = categorizedUsers
    .filter(u => (tab === 'active' ? !u.isInactive : u.isInactive))
    .filter(u => regionFilter === 'all' || regionFilter === 'World' || (u.region || 'Unknown') === regionFilter)
    .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());

  return (
    <div className="space-y-8">
      {/* Region Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
        {regionalStats.map((stat) => (
          <div 
            key={stat.region}
            onClick={() => setRegionFilter(stat.region === 'World' ? 'all' : stat.region)}
            className={`p-3 rounded-2xl border transition-all cursor-pointer group ${
              (regionFilter === 'all' && stat.region === 'World') || regionFilter === stat.region
              ? 'bg-compete-purple/10 border-compete-purple/40 shadow-[0_0_20px_rgba(155,92,255,0.05)]'
              : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${stat.region === 'World' ? 'bg-compete-purple/20 text-compete-purple' : 'bg-white/5 text-white/40 group-hover:text-white'}`}>
                <Globe size={14} />
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black uppercase tracking-[0.1em]">{stat.region}</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[7px] font-black uppercase tracking-widest text-green-400/60">Live</p>
                <p className="text-[10px] font-black text-green-400">{stat.active}</p>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)] transition-all duration-500" 
                  style={{ width: `${stat.active + stat.inactive > 0 ? (stat.active / (stat.active + stat.inactive)) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[7px] font-black uppercase tracking-widest text-red-400/60">Ghost</p>
                <p className="text-[10px] font-black text-red-400/80">{stat.inactive}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/5 w-full" />

      {/* List Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 flex-1 items-stretch">
            <button
              onClick={() => setTab('active')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${tab === 'active' ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
              Active (24h)
            </button>
            <button
              onClick={() => setTab('inactive')}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 ${
                tab === 'inactive' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${tab === 'inactive' ? 'bg-red-400' : 'bg-white/20'}`} />
              Inactive
            </button>
          </div>

          <div className="relative min-w-[220px] flex items-center">
            <Globe className="absolute left-4 z-10 text-compete-purple pointer-events-none" size={14} />
            <select 
              value={regionFilter === 'all' ? 'World' : regionFilter}
              onChange={(e) => setRegionFilter(e.target.value === 'World' ? 'all' : e.target.value)}
              className="w-full h-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-[0.1em] outline-none focus:border-compete-purple appearance-none cursor-pointer hover:bg-white/10 transition-all text-white/80"
            >
              {REGIONS.map(r => (
                <option key={r} value={r} className="bg-[#0A0A0F]">{r}</option>
              ))}
            </select>
            <div className="absolute right-4 z-10 pointer-events-none text-white/20 text-[10px] flex items-center">
               <span className="mt-[2px]">▼</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-white/5 rounded-[2rem] text-white/20">
              <Users className="mx-auto mb-3 opacity-50" size={32} />
              <p className="text-[10px] font-black uppercase tracking-widest">No connections in this sector</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${user.isInactive ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                  <div>
                    <p className="font-bold text-sm">{user.username}</p>
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Globe size={10} /> {user.region || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                    {user.isInactive ? 'Inactive for' : 'Active'}
                  </p>
                  <p className={`text-xs font-bold italic ${user.isInactive ? 'text-red-400' : 'text-green-400'}`}>
                    {formatDistanceToNow(user.lastSeen, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
