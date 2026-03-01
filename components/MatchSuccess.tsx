"use client";
import { motion } from "framer-motion";
import { Zap, Share2, Users, Trophy, ChevronRight, Terminal, Globe, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface MatchSuccessProps {
    challengeId: string;
    gameName: string;
    entryFee: number;
    finalPrize: number;
}

export default function MatchSuccess({ challengeId, gameName, entryFee, finalPrize }: MatchSuccessProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/match/${challengeId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
        } catch (err) {
            console.error("Failed to copy uplink:", err);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
            {/* SCANNING GRID OVERLAY */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-2xl w-full bg-compete-card border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(155,92,255,0.2)]"
            >
                {/* SUCCESS SCANNER ANIMATION */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-compete-purple to-transparent animate-scan" />

                <div className="flex flex-col items-center text-center space-y-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-compete-purple blur-3xl opacity-20 animate-pulse" />
                        <div className="w-20 h-20 rounded-full bg-compete-purple/20 border border-compete-purple/40 flex items-center justify-center text-compete-purple relative">
                            <ShieldCheck size={40} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-compete-purple">Uplink Established</p>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">Match <span className="text-transparent stroke-text">Live</span></h2>
                    </div>

                    {/* MATCH DATA STRIP */}
                    <div className="grid grid-cols-3 w-full gap-4 py-6 border-y border-white/5">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Target</p>
                            <p className="text-xs font-black uppercase truncate px-2">{gameName}</p>
                        </div>
                        <div className="space-y-1 border-x border-white/5">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Buy-In</p>
                            <p className="text-xs font-black uppercase">${entryFee}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Net Prize</p>
                            <p className="text-xs font-black uppercase text-compete-purple text-glow">${finalPrize.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="w-full space-y-4">
                        <Link 
                            href={`/match/${challengeId}`}
                            className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] italic rounded-2xl flex items-center justify-center gap-3 hover:bg-compete-purple hover:text-white transition-all group shadow-white/5 shadow-xl"
                        >
                            <span>Enter Battle Room</span>
                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleCopy}
                                className={`py-4 border rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                    copied 
                                    ? "bg-green-500/20 border-green-500 text-green-500" 
                                    : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                                }`}
                            >
                                {copied ? <Check size={14} /> : <Share2 size={14} />}
                                {copied ? "Uplink Copied" : "Copy Invite"}
                            </button>
                            <button className="py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white/40">
                                <Terminal size={14} /> View Logs
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2 animate-pulse"><Globe size={12}/> Global Broadcast Active</div>
                        <div className="flex items-center gap-2"><Users size={12}/> Signal: Secure</div>
                    </div>
                </div>
            </motion.div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(-100px); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateY(600px); opacity: 0; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
                .stroke-text {
                    -webkit-text-stroke: 1px #9b5cff;
                }
                .text-glow {
                    text-shadow: 0 0 10px rgba(155, 92, 255, 0.5);
                }
            `}</style>
        </motion.div>
    );
}