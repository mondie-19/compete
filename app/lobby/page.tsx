"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Timer, Gamepad2, Search, Wallet, Activity, Zap, Terminal as TerminalIcon, ShieldCheck, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [username, setUsername] = useState("COMPETITOR");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // REAL-TIME ENGINE
    useEffect(() => {
        const syncLobby = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("balance, username").eq("id", user.id).single();
                if (profile) {
                    setBalance(profile.balance);
                    setUsername(profile.username);
                }
            }

            const { data: initial } = await supabase.from("challenges").select("*, host:profiles!challenges_creator_id_fkey(username)").eq("status", "open").order('created_at', { ascending: false }).limit(50);
            if (initial) setChallenges(initial);

            // Fetch recent messages for World Chat with full profile data
            const { data: recentMsgs } = await supabase
                .from("messages")
                .select("*, profile:profiles(username, avatar_url, level, rank_name, banner_url)")
                .order('created_at', { ascending: false })
                .limit(50);
            if (recentMsgs) setMessages(recentMsgs.reverse());

            const lobbyChannel = supabase.channel('lobby-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => {
                    syncLobby();
                })
                .subscribe();

            const chatChannel = supabase.channel('world-chat')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                    const { data: msgWithProfile } = await supabase
                        .from("messages")
                        .select("*, profile:profiles(username, avatar_url, level, rank_name, banner_url)")
                        .eq("id", payload.new.id)
                        .single();

                    if (msgWithProfile) {
                        setMessages(prev => [...prev.slice(-49), msgWithProfile]);
                    }
                })
                .subscribe();

            return () => {
                supabase.removeChannel(lobbyChannel);
                supabase.removeChannel(chatChannel);
            };
        };
        syncLobby();
    }, [supabase]);

    // AUTO-SCROLL
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // FILTER LOGIC
    const filteredChallenges = challenges.filter(c => {
        const gameAndHostString = `${c.game_name || ""} ${c.host?.username || ""}`.toLowerCase();
        const matchesSearch = gameAndHostString.includes((searchQuery || "").toLowerCase());
        const matchesPlatform = selectedPlatform === "ALL" || (c.platform || "").toUpperCase() === selectedPlatform;
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

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/auth");
            return;
        }

        setIsSending(true);
        try {
            const { error } = await supabase.from("messages").insert({
                user_id: user.id,
                content: newMessage.trim()
            });

            if (error) throw error;
            setNewMessage("");
        } catch (error) {
            console.error("Chat Error:", error);
            toast.error("COMM-LINK ERROR: FAILED TO SEND");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-compete-purple relative overflow-hidden font-sans">
            {/* TERMINAL SCANLINE EFFECT */}

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
                        <p className="text-compete-muted font-mono text-xs uppercase tracking-widest">Feed synced. Ready for deployment, {username}.</p>
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
                                <p className="text-xl font-black text-white italic">KSh {balance.toLocaleString()}</p>
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
                                            {username} <span className="text-white/20 not-italic">vs</span> The World
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

                            <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
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
                                                <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center text-white/40 group-hover:text-compete-purple group-hover:border-compete-purple/30 transition-colors overflow-hidden">
                                                   <Users size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">
                                                        {c.host?.username || "OPERATIVE"} <span className="mx-1 text-white/20">•</span> {c.platform}
                                                    </p>
                                                    <p className="text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-compete-purple transition-colors">{c.game_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end justify-center">
                                                <p className="text-sm font-black text-compete-purple uppercase tracking-tight mb-0.5">KSh {c.prize_pool.toLocaleString()}</p>
                                                <span className="inline-block px-2 py-0.5 bg-compete-purple/10 border border-compete-purple/20 rounded-md text-[8px] font-bold text-compete-purple uppercase tracking-widest group-hover:bg-compete-purple group-hover:text-white transition-all">Intercept →</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>

                    {/* Terminal Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="bg-neutral-900/40 border border-white/5 rounded-[2rem] p-6 backdrop-blur-xl sticky top-28 flex flex-col h-[600px]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2 shrink-0">
                                <TerminalIcon size={14} /> World Chat
                            </h3>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-6 custom-scrollbar no-scrollbar-x h-[500px]">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={msg.id}
                                        className="flex gap-3 items-start group/msg"
                                    >
                                        <button
                                            onClick={() => setSelectedProfile(msg.profile)}
                                            className="shrink-0 mt-1 transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                                                {msg.profile?.avatar_url ? (
                                                    <img src={msg.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/20">
                                                        <Users size={14} />
                                                    </div>
                                                )}
                                                <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black ${msg.profile?.id ? 'bg-green-500' : 'bg-white/20'}`} />
                                            </div>
                                        </button>

                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    onClick={() => setSelectedProfile(msg.profile)}
                                                    className="text-compete-purple text-[10px] font-black uppercase italic tracking-tighter cursor-pointer hover:underline"
                                                >
                                                    {msg.profile?.username || "COMPETITOR"}
                                                </span>
                                                <span className="text-[8px] text-white/10 font-mono">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/70 font-medium leading-relaxed bg-white/5 p-3 rounded-xl rounded-tl-none border border-white/5 group-hover/msg:border-compete-purple/30 transition-colors">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                                {messages.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <TerminalIcon size={32} className="mb-4" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting uplink...</p>
                                    </div>
                                )}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="relative shrink-0">
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 text-sm font-medium focus:bg-black/80 focus:border-compete-purple outline-none transition-all pr-12 placeholder:text-white/30"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-compete-purple hover:text-white transition-colors disabled:opacity-20"
                                >
                                    <Zap size={18} />
                                </button>
                            </form>
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
                                        <p className="text-xl font-black italic">KSh {activeChallenge.entry_fee.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Prize Pool</p>
                                        <p className="text-xl font-black italic text-compete-purple">KSh {activeChallenge.prize_pool.toLocaleString()}</p>
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
            {/* PROFILE IDENTITY CARD */}
            <AnimatePresence>
                {selectedProfile && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProfile(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            {/* Banner */}
                            <div className="h-32 bg-compete-purple/20 relative">
                                {selectedProfile.banner_url ? (
                                    <img src={selectedProfile.banner_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[linear-gradient(45deg,rgba(155,92,255,0.2)_25%,transparent_25%,transparent_50%,rgba(155,92,255,0.2)_50%,rgba(155,92,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent" />
                            </div>

                            {/* Profile Info */}
                            <div className="px-8 pb-8 -mt-12 relative z-10 text-center">
                                <div className="inline-block p-1 bg-neutral-900 rounded-2xl mb-4">
                                    <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                                        {selectedProfile.avatar_url ? (
                                            <img src={selectedProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10">
                                                <Users size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-1 text-white">
                                    {selectedProfile.username || "COMPETITOR"}
                                </h3>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <span className="px-3 py-0.5 rounded-full bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[10px] font-black uppercase tracking-widest">
                                        LEVEL {selectedProfile.level || 1}
                                    </span>
                                    <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                        {selectedProfile.rank_name || "NOOB"}
                                    </span>
                                </div>

                                {/* Stats Mini-Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Rank</p>
                                        <p className="text-sm font-black italic text-compete-purple uppercase">{selectedProfile.rank_name || "NOOB"}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">Status</p>
                                        <p className="text-sm font-black italic text-green-500 uppercase">ONLINE</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProfile(null)}
                                    className="w-full py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all rounded-xl"
                                >
                                    Close Intel
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}