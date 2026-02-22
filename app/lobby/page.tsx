"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Timer, Gamepad2, Search, Wallet, Activity, Zap, Terminal as TerminalIcon, ShieldCheck, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Ensure sonner is installed or use your preferred toast

export default function LobbyPage() {
    const router = useRouter();
    const supabase = createClient();

    // STATES
    const [balance, setBalance] = useState(0);
    const [challenges, setChallenges] = useState<any[]>([]);
    const [activeChallenge, setActiveChallenge] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState("ALL");
    const [isProcessing, setIsProcessing] = useState(false);
    const [recentActivations, setRecentActivations] = useState<any[]>([]);

    // REAL-TIME ENGINE
    useEffect(() => {
        const syncLobby = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("balance").eq("id", user.id).single();
                if (profile) setBalance(profile.balance);
            }

            const { data: initial } = await supabase.from("challenges").select("*, host:profiles!challenges_creator_id_fkey(username)").eq("status", "open").order('created_at', { ascending: false }).limit(20);
            if (initial) setChallenges(initial);

            // Fetch recent activations for Global Feed
            const { data: recent } = await supabase.from("challenges").select("*, host:profiles!challenges_creator_id_fkey(username)").order('created_at', { ascending: false }).limit(5);
            if (recent) setRecentActivations(recent);

            const channel = supabase.channel('lobby-updates')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'challenges' }, (payload) => {
                    // Refresh both
                    syncLobby();
                })
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'challenges' }, (payload) => {
                    syncLobby();
                })
                .subscribe();

            return () => { supabase.removeChannel(channel); };
        };
        syncLobby();
    }, [supabase]);

    // FILTER LOGIC
    const filteredChallenges = challenges.filter(c => {
        const matchesSearch = c.game_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlatform = selectedPlatform === "ALL" || c.platform.toUpperCase() === selectedPlatform;
        return matchesSearch && matchesPlatform;
    });

    // INTERCEPT LOGIC
    const handleJoin = async (challenge: any) => {
        if (isProcessing) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth");
            return;
        }

        setIsProcessing(true);

        try {
            // Use the secure RPC for atomic join and escrow deduction
            const { data, error } = await supabase.rpc('join_challenge_with_escrow', {
                p_challenge_id: challenge.id
            });

            if (error) {
                // Handle specific postgres errors raised by the RPC
                if (error.message.includes('Insufficient vault credits')) {
                    toast.error("INSUFFICIENT VAULT CREDITS");
                } else if (error.message.includes('Deployment no longer open')) {
                    toast.error("DEPLOYMENT NO LONGER OPEN");
                } else {
                    throw error;
                }
                return;
            }

            toast.success("INTERCEPT SUCCESSFUL. UPLINKING...");

            setTimeout(() => {
                router.push(`/match/${challenge.id}`);
            }, 1500);

        } catch (error) {
            console.error("Join Error:", error);
            toast.error("INTERCEPT FAILED: SYSTEM ERROR");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-compete-purple relative overflow-hidden font-sans">
            {/* TERMINAL SCANLINE EFFECT */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_3px,3px_100%]" />

            <Navbar onJoinClick={() => router.push("/auth")} />

            <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12 relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">System Status: Intercepting</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-2">
                            The <span className="text-compete-purple text-glow">Lobby</span>
                        </h1>
                        <p className="text-compete-muted font-mono text-xs uppercase tracking-widest">Feed synced. Ready for deployment, NeonSlayer.</p>
                    </motion.div>

                    <Link href="/wallet">
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(155,92,255,0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-4 bg-white/5 border border-white/10 p-1 pr-8 rounded-2xl hover:bg-compete-purple/10 transition-all shadow-xl backdrop-blur-md"
                        >
                            <div className="bg-compete-purple/20 p-4 rounded-xl group-hover:bg-compete-purple group-hover:text-white text-compete-purple transition-all">
                                <Wallet size={24} />
                            </div>
                            <div className="text-left">
                                <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mb-1">Vault Sync</p>
                                <p className="text-xl font-black text-white italic">${balance.toLocaleString()}</p>
                            </div>
                        </motion.button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Hero Section */}
                        <section>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
                                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                                    <div className="text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30 mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Live Uplink</span>
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-black uppercase italic text-white mb-6 leading-tight tracking-tighter">
                                            NeonSlayer <span className="text-white/20 not-italic">vs</span> Team Liquid
                                        </h3>
                                        <div className="flex gap-4">
                                            <button className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-compete-purple hover:text-white transition-all">Watch Intel</button>
                                            <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 transition-all">Stats</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Search & Filter Hub */}
                        <section className="bg-white/[0.03] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="text"
                                        placeholder="SEARCH DEPLOYMENTS..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-compete-purple outline-none transition-all"
                                    />
                                </div>
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 w-full md:w-auto overflow-x-auto">
                                    {["ALL", "PC", "PS5", "XBOX", "MOBILE"].map((plat) => (
                                        <button
                                            key={plat}
                                            onClick={() => setSelectedPlatform(plat)}
                                            className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-tighter transition-all whitespace-nowrap ${selectedPlatform === plat ? 'bg-compete-purple text-white shadow-lg' : 'text-white/30 hover:text-white'
                                                }`}
                                        >
                                            {plat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Challenges List */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3">
                                    <Zap size={18} className="text-compete-purple" /> New Deployments
                                </h2>
                                <Link
                                    href="/deploy"
                                    className="text-[10px] font-black uppercase text-compete-purple hover:text-white transition-colors tracking-[0.2em]"
                                >
                                    Host Challenge +
                                </Link>
                            </div>

                            <div className="space-y-3 min-h-[400px]">
                                <AnimatePresence mode="popLayout">
                                    {filteredChallenges.map((c) => (
                                        <motion.div
                                            layout
                                            key={c.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => setActiveChallenge(c)}
                                            className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center hover:bg-white/[0.05] transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/20 group-hover:text-compete-purple transition-colors">
                                                    <Gamepad2 size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{c.platform}</p>
                                                    <p className="text-sm font-black italic uppercase tracking-tighter">{c.game_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-compete-purple uppercase tracking-widest">${c.prize_pool} Pot</p>
                                                <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Intercept Now →</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>

                    {/* Terminal Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl sticky top-28">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-8 flex items-center gap-2">
                                <TerminalIcon size={14} /> Global Feed
                            </h3>
                            <div className="space-y-8 relative">
                                <div className="absolute left-[7px] top-0 bottom-0 w-[1px] bg-white/5" />
                                {recentActivations.map((c, i) => (
                                    <div key={c.id} className="relative pl-6">
                                        <div className="absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full bg-black border-2 border-compete-purple shadow-[0_0_10px_#9b5cff]" />
                                        <p className="text-[11px] leading-relaxed text-white/60 font-medium font-mono uppercase">
                                            {c.host?.username || "OPERATIVE"} <span className="text-white font-bold">DEPLOYED</span> <span className="text-compete-purple italic font-black">{c.game_name}</span> ON <span className="text-white font-bold">{c.platform}</span>.
                                        </p>
                                        <p className="text-[8px] font-black text-white/20 mt-1 uppercase tracking-widest">
                                            ${c.entry_fee} ENTRY • PRIZE POOL ${c.prize_pool}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            {/* INTERCEPT MODAL */}
            <AnimatePresence>
                {activeChallenge && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isProcessing && setActiveChallenge(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-neutral-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="p-8 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldCheck size={16} className="text-compete-purple" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-compete-purple">Deployment Intel</span>
                                        </div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter">{activeChallenge.game_name}</h2>
                                    </div>
                                    <button onClick={() => setActiveChallenge(null)} className="text-white/20 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Entry Fee</p>
                                        <p className="text-xl font-black italic">${activeChallenge.entry_fee}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Prize Pool</p>
                                        <p className="text-xl font-black italic text-compete-purple">${activeChallenge.prize_pool}</p>
                                    </div>
                                </div>
                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleJoin(activeChallenge)}
                                    className={`w-full py-5 font-black uppercase tracking-[0.2em] italic rounded-2xl transition-all shadow-purple-glow flex items-center justify-center gap-3 ${isProcessing ? "bg-white/10 text-white/20 cursor-wait" : "bg-white text-black hover:bg-compete-purple hover:text-white"
                                        }`}
                                >
                                    {isProcessing ? "SYNCHRONIZING..." : "Authorize Intercept"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}