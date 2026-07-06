"use client";
import { useState } from "react";
import { Users, Clock, Globe } from "lucide-react";
import Dropdown from "@/components/Dropdown";
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
    <div className="space-y-4">
      {/* Region Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2">
        {regionalStats.map((stat) => (
          <div 
            key={stat.region}
            onClick={() => setRegionFilter(stat.region === 'World' ? 'all' : stat.region)}
            className={`p-2.5 rounded-none border transition-all cursor-pointer group ${
              (regionFilter === 'all' && stat.region === 'World') || regionFilter === stat.region
              ? 'bg-compete-purple/5 border-compete-purple/35 shadow-purple-glow'
              : 'bg-transparent border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className={`p-1 rounded-none border ${stat.region === 'World' ? 'bg-compete-purple/15 text-compete-purple border-compete-purple/30' : 'bg-transparent border-white/10 text-white/20 group-hover:text-white'}`}>
                <Globe size={12} />
              </div>
              <div className="text-right">
                <p className="text-[8px] font-black uppercase tracking-[0.1em]">{stat.region}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-[6px] font-black uppercase tracking-widest text-green-400/60">Live</p>
                <p className="text-[9px] font-black text-green-400">{stat.active}</p>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-500" 
                  style={{ width: `${stat.active + stat.inactive > 0 ? (stat.active / (stat.active + stat.inactive)) * 100 : 0}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[6px] font-black uppercase tracking-widest text-red-400/60">Ghost</p>
                <p className="text-[9px] font-black text-red-400/80">{stat.inactive}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-white/5 w-full" />

      {/* List Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-2 items-stretch">
          <div className="flex bg-transparent p-1 rounded-none border border-white/10 flex-1 items-stretch">
            <button
              onClick={() => setTab('active')}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5 ${
                tab === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/25' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${tab === 'active' ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
              Active (24h)
            </button>
            <button
              onClick={() => setTab('inactive')}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1.5 ${
                tab === 'inactive' ? 'bg-red-500/10 text-red-400 border border-red-500/25' : 'text-white/40 hover:text-white'
              }`}
            >
              <div className={`w-1 h-1 rounded-full ${tab === 'inactive' ? 'bg-red-400' : 'bg-white/20'}`} />
              Inactive
            </button>
          </div>

          <div className="min-w-50">
            <Dropdown
              options={REGIONS.map(r => ({ value: r, label: r }))}
              value={regionFilter === 'all' ? 'World' : regionFilter}
              onChange={(val) => setRegionFilter(val === 'World' ? 'all' : val)}
              icon={<Globe size={12} />}
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center border border-white/10 rounded-none bg-transparent text-white/20">
              <Users className="mx-auto mb-2 opacity-50" size={24} />
              <p className="text-[9px] font-black uppercase tracking-widest">No connections in this sector</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div key={user.id} className="bg-transparent border border-white/10 p-3 rounded-none flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full ${user.isInactive ? 'bg-red-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="font-bold text-xs">{user.username}</p>
                    <p className="text-[8px] text-white/40 font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                      <Globe size={8} /> {user.region || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                    {user.isInactive ? 'Inactive for' : 'Active'}
                  </p>
                  <p className={`text-[10px] font-bold italic ${user.isInactive ? 'text-red-400' : 'text-green-400'}`}>
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
