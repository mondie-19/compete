"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Timer, MessageSquare, Trophy, AlertTriangle, CheckCircle2, Upload } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

export default function MatchRoom() {
    const { id } = useParams();
    const supabase = createClient();
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchMatch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            const { data, error } = await supabase
                .from("challenges")
                .select(`*, host:profiles!challenges_creator_id_fkey(username, avatar_url), opponent:profiles!challenges_opponent_id_fkey(username, avatar_url)`)
                .eq("id", id)
                .single();

            if (data) setMatch(data);
            setLoading(false);
        };

        fetchMatch();

        // REAL-TIME SYNC: Listen for score submissions or status changes
        const channel = supabase.channel(`match-${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'challenges', filter: `id=eq.${id}` }, (payload) => {
                setMatch((prev: any) => ({ ...prev, ...payload.new }));
                if (payload.new.status === 'completed') {
                    toast.success("MATCH FINALIZED. CREDITS TRANSFERRED.");
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [id, supabase]);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-black tracking-widest text-white/20 animate-pulse">ESTABLISHING UPLINK...</div>;

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: MATCH INTEL */}
                <div className="lg:col-span-8 space-y-6">
                    <header className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><Shield size={120} /></div>
                        
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Live Combat Session</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                <Timer size={14} className="text-compete-purple" />
                                <span className="font-mono text-xs">14:59</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between relative z-10">
                            <PlayerCard name={match?.host?.username || "Host"} side="Left" />
                            <div className="text-center">
                                <div className="text-4xl font-black italic text-white/20 mb-2">VS</div>
                                <div className="bg-compete-purple/20 text-compete-purple px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-compete-purple/30">
                                    ${match?.prize_pool} POT
                                </div>
                            </div>
                            <PlayerCard name={match?.opponent?.username || "Interceptor"} side="Right" />
                        </div>
                    </header>

                    {/* ACTION ZONE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Upload size={16} className="text-compete-purple" /> Submit Evidence
                            </h3>
                            <p className="text-[10px] text-white/40 leading-relaxed">Upload a screenshot of the final scoreboards. Fraudulent claims result in permanent ban.</p>
                            <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest">
                                Select Image
                            </button>
                        </div>

                        <div className="bg-neutral-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Trophy size={16} className="text-yellow-500" /> Result Entry
                            </h3>
                            <div className="flex gap-2">
                                <button className="flex-1 py-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl hover:bg-green-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">I Won</button>
                                <button className="flex-1 py-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">I Lost</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: TACTICAL CHAT */}
                <div className="lg:col-span-4 flex flex-col h-[600px] bg-neutral-900/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                            <MessageSquare size={14} /> Encrypted Comms
                        </h3>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-y-auto font-mono text-[11px]">
                        <div className="text-compete-purple">[SYSTEM]: Match Initialized. Contact opponent.</div>
                        <div className="flex flex-col gap-1">
                            <span className="text-white/40 text-[9px]">Opponent:</span>
                            <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">Ready for the invite? ID is Ghost_01#2234</div>
                        </div>
                    </div>
                    <div className="p-4 bg-black/40 border-t border-white/5">
                        <input 
                            type="text" 
                            placeholder="TYPE MESSAGE..."
                            className="w-full bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none p-2"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ name, side }: { name: string, side: string }) {
    return (
        <div className={`flex items-center gap-4 ${side === 'Right' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-compete-purple to-blue-600 p-[2px]">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center font-black text-xl italic uppercase">
                    {name[0]}
                </div>
            </div>
            <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{side} Player</p>
                <p className="text-xl font-black italic uppercase tracking-tighter">{name}</p>
                <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-3 h-1 bg-compete-purple rounded-full" />)}
                </div>
            </div>
        </div>
    );
}
