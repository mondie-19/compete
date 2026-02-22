"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Chrome, ChevronLeft, Target, Fingerprint } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";
import Link from "next/link";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) console.error("Google Auth Error:", error.message);
    };

    const handleAuth = () => {
        localStorage.setItem("isLoggedIn", "true");
        router.push('/lobby');
    };

    return (
        <div className="relative min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 overflow-hidden selection:bg-compete-purple selection:text-white">
            
            {/* TACTICAL BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            {/* NEURAL SCAN LINE */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-10">
                <div className="w-full h-[2px] bg-compete-purple animate-scan shadow-[0_0_15px_#9B5CFF]" />
            </div>

            <Link href="/" className="absolute top-12 left-12 flex items-center gap-3 text-white/40 hover:text-white transition-all group z-20">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Abort Uplink</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-20 w-full max-w-[400px] bg-[#050505] border border-white/10 p-12 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* DECORATIVE CORNERS */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-compete-purple/40 rounded-tl-3xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-compete-purple/40 rounded-br-3xl" />

                <div className="mb-12 text-left">
                    <div className="flex items-center gap-2 text-compete-purple mb-4">
                        <Fingerprint size={20} className="animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em]">Identity Required</span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                        {isLogin ? "Neural" : "Operative"}<br />
                        <span className="text-transparent stroke-text">{isLogin ? "Uplink" : "Protocol"}</span>
                    </h1>
                </div>

                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative group"
                            >
                                <input
                                    type="text"
                                    placeholder="OPERATIVE NAME"
                                    className="w-full bg-black border border-white/10 p-5 pl-6 text-white outline-none focus:border-compete-purple transition-all font-black placeholder:text-white/5 uppercase tracking-widest text-[10px]"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="relative group">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="w-full bg-black border border-white/10 p-5 pl-6 text-white outline-none focus:border-compete-purple transition-all font-black placeholder:text-white/5 uppercase tracking-widest text-[10px]"
                        />
                    </div>

                    <div className="relative group">
                        <input
                            type="password"
                            placeholder="ACCESS KEY"
                            className="w-full bg-black border border-white/10 p-5 pl-6 text-white outline-none focus:border-compete-purple transition-all font-black placeholder:text-white/5 uppercase tracking-widest text-[10px]"
                        />
                    </div>

                    <button
                        onClick={handleAuth}
                        className="w-full bg-white text-black py-6 font-black uppercase tracking-[0.3em] italic hover:bg-compete-purple hover:text-white transition-all flex items-center justify-center gap-3 group overflow-hidden relative"
                    >
                        <Target size={18} className="group-hover:scale-125 transition-transform" />
                        <span>{isLogin ? "Authorize" : "Initialize"}</span>
                    </button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                    <button
                        onClick={handleGoogleSignIn}
                        className="flex-1 flex items-center justify-center gap-3 py-4 border border-white/5 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all font-black text-[9px] uppercase tracking-widest"
                    >
                        <Chrome size={14} /> Google - ID
                    </button>
                    <div className="w-[1px] h-8 bg-white/10" />
                    <div className="flex-1 text-right">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-[9px] font-black uppercase tracking-widest text-compete-purple hover:text-white transition-colors"
                        >
                            {isLogin ? "New Operative?" : "Old Guard?"}
                        </button>
                    </div>
                </div>

                {/* STATUS BAR */}
                <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center opacity-20">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-compete-purple rounded-full" />
                        <div className="w-1 h-1 bg-compete-purple rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-compete-purple rounded-full" />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-[0.4em]">Encrypted Connection Active</span>
                </div>
            </motion.div>

            <style jsx>{`
                .stroke-text {
                    -webkit-text-stroke: 1px rgba(155, 92, 255, 0.5);
                }
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 4s linear infinite;
                }
            `}</style>
        </div>
    );
}