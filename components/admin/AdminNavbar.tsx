"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Activity, LogOut, LayoutDashboard, Globe, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/supabase/client";

interface AdminNavbarProps {
    profile: any;
}

export function AdminNavbar({ profile }: AdminNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0F]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            {/* Commanding Top Bar */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-compete-purple to-transparent opacity-50" />
            
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo & Core Status */}
                <div className="flex items-center gap-6">
                    <Link href="/admin" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-compete-purple/10 rounded-xl flex items-center justify-center border border-compete-purple/40 shadow-[0_0_20px_rgba(155,92,255,0.2)] group-hover:shadow-[0_0_30px_rgba(155,92,255,0.4)] transition-all duration-500 relative">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.2, 1],
                                    rotate: [45, 45, 45],
                                    opacity: [0.8, 1, 0.8],
                                    boxShadow: [
                                        "0 0 10px rgba(155,92,255,0.3)",
                                        "0 0 20px rgba(155,92,255,0.6)",
                                        "0 0 10px rgba(155,92,255,0.3)"
                                    ]
                                }}
                                transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                }}
                                className="w-5 h-5 bg-compete-purple rounded-sm"
                            />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic  tracking-tighter leading-none flex items-center gap-2">
                                Admin <span className="text-compete-purple text-glow">Core</span>
                                <motion.span 
                                    animate={{ opacity: [0.4, 1, 0.4] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-1.5 h-1.5 rounded-full bg-compete-purple"
                                />
                            </h1>
                            <p className="text-[8px] font-black  text-white/30 tracking-[0.4em] mt-1">Intelligence Network v4.0</p>
                        </div>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center gap-1 ml-8">
                        <Link 
                            href="/admin" 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black  tracking-widest transition-all ${
                                pathname === '/admin' 
                                ? 'bg-compete-purple text-white shadow-purple-glow' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <LayoutDashboard size={14} /> Dashboard
                        </Link>
                        <Link 
                            href="/lobby" 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black  tracking-widest transition-all ${
                                pathname === '/lobby' 
                                ? 'bg-compete-purple text-white shadow-purple-glow' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <Globe size={14} /> Intelligence Lobby
                        </Link>
                    </nav>
                </div>

                {/* Right Side: Admin Badge & Exit */}
                <div className="flex items-center gap-6">
                    {/* Admin Badge */}
                    <div className="flex items-center gap-4 py-2 pl-4 pr-2 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="text-right">
                            <p className="text-xs font-black text-white  tracking-widest leading-none mb-1">
                                {profile?.username || "Admin"}
                            </p>
                            <p className="text-[9px] text-compete-purple font-black  tracking-widest leading-none">
                                Verified Admin
                            </p>
                        </div>
                        <div className="relative w-10 h-10 rounded-none bg-gradient-to-br from-compete-purple to-compete-purple-glow p-[1px]">
                            <div className="w-full h-full bg-[#0A0A0F] rounded-none flex items-center justify-center overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-black italic text-compete-purple text-sm">{profile?.username?.[0] || "A"}</span>
                                )}
                            </div>
                            {/* Online Status Dot */}
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0A0A0F] shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>
                    </div>

                    <button 
                        onClick={handleSignOut}
                        className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                        title="Terminate Session"
                    >
                        <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Subtle Scanning Line Animation */}
            <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[2px] bg-compete-purple/5 pointer-events-none z-[-1]"
            />
        </header>
    );
}
