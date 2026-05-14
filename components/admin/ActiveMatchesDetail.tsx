"use client";
import { useState } from "react";
import { Gamepad2, Users, Search, Globe } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface ActiveMatchesDetailProps {
  matches: any[];
}

export function ActiveMatchesDetail({ matches }: ActiveMatchesDetailProps) {
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [search, setSearch] = useState("");

  const activeStatuses = ['open', 'in_progress', 'disputed'];
  const activeMatches = matches.filter(m => activeStatuses.includes(m.status));

  // Determine region from host
  const matchesWithRegion = activeMatches.map(m => ({
    ...m,
    region: m.host?.region || 'Unknown'
  }));

  const REGIONS = ['World', 'Africa', 'Asia', 'Europe', 'N. America', 'S. America', 'Oceania', 'Antarctica'];

  const filteredMatches = matchesWithRegion
    .filter(m => regionFilter === 'all' || regionFilter === 'World' || m.region === regionFilter)
    .filter(m => m.game_name.toLowerCase().includes(search.toLowerCase()) || m.host?.username?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 z-10 text-white/20" size={16} />
          <input
            type="text"
            placeholder="Search game or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-compete-purple placeholder:text-white/20 transition-colors h-full"
          />
        </div>
        
        <div className="relative min-w-[220px] flex items-center">
          <Globe className="absolute left-4 z-10 text-compete-purple pointer-events-none" size={14} />
          <select 
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="w-full h-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-[10px] font-black uppercase tracking-[0.1em] outline-none focus:border-compete-purple appearance-none cursor-pointer hover:bg-white/10 transition-all text-white/80"
          >
            <option value="all" className="bg-[#0A0A0F]">All Regions</option>
            {REGIONS.filter(r => r !== 'World').map(r => (
              <option key={r} value={r} className="bg-[#0A0A0F]">{r}</option>
            ))}
          </select>
          <div className="absolute right-4 z-10 pointer-events-none text-white/20 text-[10px] flex items-center">
             <span className="mt-[2px]">▼</span>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-[2rem] text-white/20">
            <Gamepad2 className="mx-auto mb-3 opacity-50" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">No active deployments</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all group">
              <div className="p-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/40 group-hover:text-compete-purple transition-colors border border-white/5">
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase leading-none">{match.game_name}</h4>
                    <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">
                      {match.platform} • {match.region}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black italic text-compete-purple">KSh {match.prize_pool.toLocaleString()}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Prize Pool</p>
                </div>
              </div>

              <div className="bg-white/[0.02] p-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">Host</p>
                    <p className="text-xs font-bold">{match.host?.username || 'Unknown'}</p>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-0.5">Opponent</p>
                    <p className="text-xs font-bold text-white/60">{match.opponent?.username || 'Waiting...'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded border text-[8px] font-black uppercase tracking-widest ${
                    match.status === 'open' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    match.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 animate-pulse' :
                    'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {match.status.replace('_', ' ')}
                  </span>
                  
                  <Link 
                    href={`/match/${match.id}`} 
                    target="_blank"
                    className="text-[10px] font-black uppercase tracking-widest text-compete-purple hover:text-white transition-colors"
                  >
                    View &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
