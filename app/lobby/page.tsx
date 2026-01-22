"use client";
import { motion } from "framer-motion";
import { Trophy, Users, Timer, Gamepad2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import AuthModal from "@/components/AuthModal";

const LIVE_MATCH = {
    game: "Valorant",
    map: "Ascent",
    opponent: "Team Liquid",
    score: "7 - 5",
    status: "LIVE",
    viewers: "12.5K",
    time: "32:45"
};

const ACTIVE_TOURNAMENTS = [
    {
        id: 1,
        title: "Valorant Champions Arena",
        game: "Valorant",
        prize: "$5,000",
        status: "Live",
        players: "128/128",
        image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070",
    },
    {
        id: 2,
        title: "League of Legends: Rift Rivals",
        game: "League of Legends",
        prize: "$2,500",
        status: "Upcoming",
        players: "42/64",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=2071",
    }
];

export default function LobbyPage() {
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    return (
        <div className="min-h-screen bg-compete-bg text-white">
            <Navbar onJoinClick={() => setIsAuthOpen(true)} />

            <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
                        Welcome to the <span className="text-compete-purple">Lobby</span>
                    </h1>
                    <p className="text-compete-muted">Find your next battle, NeonSlayer.</p>
                </div>

                {/* Live Match Hero Section */}
                <section>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-compete-purple/20 to-transparent border border-compete-purple/30 rounded-3xl p-8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6">
                            <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/50 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                <span className="text-red-500 text-xs font-black uppercase tracking-widest">Live Match</span>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                            <div className="text-center md:text-left">
                                <p className="text-compete-muted text-sm font-bold uppercase tracking-widest mb-2">{LIVE_MATCH.game} • {LIVE_MATCH.map}</p>
                                <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white mb-4">
                                    NeonSlayer <span className="text-compete-muted not-italic text-2xl mx-4">vs</span> {LIVE_MATCH.opponent}
                                </h3>
                                <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                                    <div className="bg-black/40 px-6 py-3 rounded-xl border border-white/10">
                                        <span className="text-4xl font-mono font-bold text-compete-purple">{LIVE_MATCH.score}</span>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-compete-muted uppercase font-bold mb-1">Match Time</p>
                                        <p className="text-xl text-white font-mono">{LIVE_MATCH.time}</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs text-compete-muted uppercase font-bold mb-1">Viewers</p>
                                        <p className="text-xl text-white font-mono">{LIVE_MATCH.viewers}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 justify-center md:justify-start">
                                    <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-compete-purple hover:text-white transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                        Watch Stream
                                    </button>
                                    <button className="px-8 py-4 bg-white/5 text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-white/10 transition-all border border-white/10">
                                        View Match Stats
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                            <Gamepad2 size={400} />
                        </div>
                    </motion.div>
                </section>

                {/* Active Tournaments Grid */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold uppercase italic tracking-wider flex items-center gap-3">
                            <Trophy className="text-yellow-500" /> Active Tournaments
                        </h2>
                        <button className="text-sm font-bold text-compete-purple uppercase tracking-widest hover:text-white transition-colors">
                            View All Tournaments
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ACTIVE_TOURNAMENTS.map((t) => (
                            <motion.div
                                key={t.id}
                                whileHover={{ y: -5 }}
                                className="bg-compete-card/30 border border-white/5 rounded-2xl overflow-hidden group hover:border-compete-purple/30 transition-all cursor-pointer"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img src={t.image} alt={t.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${t.status === 'Live' ? 'bg-red-500 animate-pulse' : 'bg-compete-purple'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-black uppercase italic leading-tight mb-2">{t.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-compete-muted mb-4">
                                        <span className="flex items-center gap-1"><Gamepad2 size={14} /> {t.game}</span>
                                        <span className="flex items-center gap-1"><Users size={14} /> {t.players}</span>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2 text-compete-purple font-bold">
                                            <Trophy size={16} />
                                            {t.prize}
                                        </div>
                                        <span className="text-xs font-bold uppercase text-white group-hover:text-compete-purple transition-colors">Join Now →</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </div>
    );
}
