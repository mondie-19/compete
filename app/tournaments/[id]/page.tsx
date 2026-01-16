"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Shield, BookOpen, ChevronRight, LayoutDashboard, History, MessageSquare } from "lucide-react";

export default function TournamentDetails({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("bracket");

  const tabs = [
    { id: "bracket", label: "Bracket", icon: <LayoutDashboard size={16} /> },
    { id: "standings", label: "Standings", icon: <Trophy size={16} /> },
    { id: "rules", label: "Rules & Info", icon: <BookOpen size={16} /> },
    { id: "matches", label: "Match History", icon: <History size={16} /> },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="h-20" />

      {/* Hero Header */}
      <section className="relative h-[300px] flex items-end pb-12 px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070" 
            className="w-full h-full object-cover opacity-40"
            alt="Hero BG"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4 text-compete-purple font-bold text-xs uppercase tracking-[0.2em]">
              <Shield size={16} /> Verified Tournament
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">
              Valorant Champions <br /><span className="text-compete-purple">Arena</span>
            </h1>
          </div>
          
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-compete-purple text-white font-black uppercase tracking-widest italic shadow-purple-glow hover:scale-105 transition-transform">
              Join Tournament
            </button>
            <button className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="border-b border-white/5 bg-compete-card/10 sticky top-20 z-20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-6 text-xs font-bold uppercase tracking-widest transition-all relative ${
                activeTab === tab.id ? "text-compete-purple" : "text-compete-muted hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-compete-purple shadow-[0_0_10px_#9B5CFF]" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content Area */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === "bracket" && <BracketView />}
        {activeTab === "rules" && <RulesView />}
        {activeTab === "standings" && <StandingsView />}
      </section>
    </main>
  );
}

/* --- SUB-COMPONENTS --- */

function BracketView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
      <div className="space-y-8">
        <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Quarter Finals</h4>
        <BracketMatch team1="Team Liquid" team2="G2 Esports" score1="2" score2="1" />
        <BracketMatch team1="Sentinels" team2="Fnatic" score1="0" score2="2" />
      </div>
      <div className="space-y-8">
        <h4 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Semi Finals</h4>
        <BracketMatch team1="Team Liquid" team2="Fnatic" score1="-" score2="-" active />
      </div>
      <div className="text-center p-12 border-2 border-dashed border-compete-purple/20 rounded-3xl bg-compete-purple/5">
        <Trophy className="mx-auto text-compete-purple mb-4" size={48} />
        <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Grand Final</p>
        <h3 className="text-2xl font-black italic mt-2">TBD</h3>
      </div>
    </div>
  );
}

function BracketMatch({ team1, team2, score1, score2, active = false }: any) {
  return (
    <div className={`p-4 bg-compete-card/30 border ${active ? 'border-compete-purple shadow-purple-glow' : 'border-white/5'} rounded-xl space-y-2`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">{team1}</span>
        <span className="text-sm font-black text-compete-purple">{score1}</span>
      </div>
      <div className="h-px bg-white/5" />
      <div className="flex justify-between items-center">
        <span className="text-sm font-bold">{team2}</span>
        <span className="text-sm font-black text-compete-purple">{score2}</span>
      </div>
    </div>
  );
}

function RulesView() {
  const rules = [
    "5v5 Competitive Mode Only.",
    "Map Pool: Ascent, Bind, Haven, Icebox.",
    "No external third-party software allowed.",
    "Disputes must be raised within 15 minutes of match end."
  ];
  return (
    <div className="max-w-2xl space-y-6">
      <h3 className="text-2xl font-black uppercase italic italic text-white">General <span className="text-compete-purple">Rules</span></h3>
      <ul className="space-y-4">
        {rules.map((rule, i) => (
          <li key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-xl text-compete-muted text-sm">
            <span className="text-compete-purple font-bold">0{i + 1}</span>
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

function StandingsView() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-compete-card/20">
      <table className="w-full text-left">
        <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          <tr>
            <th className="p-5">Rank</th>
            <th className="p-5">Player / Team</th>
            <th className="p-5">W/L</th>
            <th className="p-5">Points</th>
          </tr>
        </thead>
        <tbody className="text-sm text-compete-muted">
          {[1, 2, 3, 4].map((rank) => (
            <tr key={rank} className="border-t border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-5 font-black text-white italic">#0{rank}</td>
              <td className="p-5 text-white font-bold">Competitive_User_{rank}</td>
              <td className="p-5">12 / 2</td>
              <td className="p-5 text-compete-purple font-black">2,450</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}