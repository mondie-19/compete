"use client";
import { useState } from "react";
import { Gamepad2, Users, Search, Globe } from "lucide-react";
import Dropdown from "@/components/Dropdown";
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2 items-stretch">
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-3.5 z-10 text-white/20" size={14} />
          <input
            type="text"
            placeholder="Search game or host..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border border-white/10 rounded-none py-2 pl-9 pr-3 text-xs outline-none focus:border-compete-purple placeholder:text-white/20 transition-colors h-full"
          />
        </div>
        
        <div className="min-w-50">
          <Dropdown
            options={[
              { value: 'all', label: 'All Regions' },
              ...REGIONS.filter(r => r !== 'World').map(r => ({ value: r, label: r })),
            ]}
            value={regionFilter}
            onChange={setRegionFilter}
            icon={<Globe size={12} />}
          />
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="py-8 text-center border border-white/10 rounded-none bg-transparent text-white/20">
            <Gamepad2 className="mx-auto mb-2 opacity-50" size={24} />
            <p className="text-[9px] font-black uppercase tracking-widest">No active deployments</p>
          </div>
        ) : (
          filteredMatches.map(match => (
            <div key={match.id} className="bg-transparent border border-white/10 rounded-none overflow-hidden hover:border-white/20 transition-all group">
              <div className="p-3 flex items-center justify-between border-b border-white/5 bg-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-transparent rounded-none flex items-center justify-center text-white/40 group-hover:text-compete-purple transition-colors border border-white/10">
                    <Gamepad2 size={16} />
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase leading-none text-xs">{match.game_name}</h4>
                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1 leading-none">
                      {match.platform} • {match.region}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black italic text-compete-purple leading-none">KSh {match.prize_pool.toLocaleString()}</p>
                  <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-1 leading-none">Prize Pool</p>
                </div>
              </div>

              <div className="bg-transparent p-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-0.5 leading-none">Host</p>
                    <p className="text-[10px] font-bold leading-none">{match.host?.username || 'Unknown'}</p>
                  </div>
                  <div className="h-3 w-px bg-white/10" />
                  <div>
                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-0.5 leading-none">Opponent</p>
                    <p className="text-[10px] font-bold text-white/60 leading-none">{match.opponent?.username || 'Waiting...'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-1.5 py-0.5 rounded-none border text-[7px] font-black uppercase tracking-widest ${
                    match.status === 'open' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                    match.status === 'in_progress' ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/20 animate-pulse' :
                    'bg-red-500/5 text-red-400 border-red-500/20'
                  }`}>
                    {match.status.replace('_', ' ')}
                  </span>
                  
                  <Link 
                    href={`/match/${match.id}`} 
                    target="_blank"
                    className="text-[9px] font-black uppercase tracking-widest text-compete-purple hover:text-white transition-colors"
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
