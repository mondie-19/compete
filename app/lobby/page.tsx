"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Users, Timer, Gamepad2, Search, Wallet, Activity, Zap, Terminal as TerminalIcon, ShieldCheck, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { toast } from "sonner";

export default function LobbyPage() {
    const router = useRouter();
    const supabase = createClient();
    useHeartbeat();

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
    const [userRole, setUserRole] = useState("client");
    const chatEndRef = useRef<HTMLDivElement>(null);

    // REAL-TIME ENGINE
    useEffect(() => {
        let lobbyChannel: any;
        let chatChannel: any;

        const initLobby = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase.from("profiles").select("balance, username, role").eq("id", user.id).single();
                if (profile) {
                    setBalance(profile.balance);
                    setUsername(profile.username);
                    setUserRole(profile.role);
                }
            }

            // Initial Fetch: Challenges
            const { data: initialChallenges } = await supabase
                .from("challenges")
                .select("*, host:profiles!challenges_creator_id_fkey(username)")
                .eq("status", "open")
                .order('created_at', { ascending: false })
                .limit(50);
            if (initialChallenges) setChallenges(initialChallenges);

            // Initial Fetch: World Chat
            const { data: recentMsgs } = await supabase
                .from("messages")
                .select("*, profiles(username, avatar_url, level, rank_name, banner_url, role)")
                .order('created_at', { ascending: false })
                .limit(50);
            if (recentMsgs) setMessages(recentMsgs.reverse());

            // Real-time: Challenges
            lobbyChannel = supabase.channel('lobby-updates')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, async () => {
                    const { data: updatedChallenges } = await supabase
                        .from("challenges")
                        .select("*, host:profiles!challenges_creator_id_fkey(username)")
                        .eq("status", "open")
                        .order('created_at', { ascending: false })
                        .limit(50);
                    if (updatedChallenges) setChallenges(updatedChallenges);
                })
                .subscribe();

            // Real-time: World Chat
            chatChannel = supabase.channel('world-chat')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
                    console.log("Real-time Signal Received:", payload);
                    
                    if (!payload.new || !payload.new.id) return;

                    const { data: { user } } = await supabase.auth.getUser();
                    const isSelf = user?.id === payload.new.user_id;

                    // 1. Add message instantly
                    const localMsg = {
                        ...payload.new,
                        profiles: isSelf ? { 
                            username: username, 
                            role: userRole,
                            // Use defaults for self if profile state not fully available here
                            level: 1,
                            rank_name: "COMPETITOR"
                        } : { username: "UPLINKING..." }
                    };
                    setMessages(prev => [...prev.slice(-49), localMsg]);

                    // 2. Fetch actual profile details (always fetch for full data/others)
                    const { data: profileData } = await supabase
                        .from("profiles")
                        .select("username, avatar_url, level, rank_name, banner_url, role")
                        .eq("id", payload.new.user_id)
                        .single();

                    if (profileData) {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, profiles: profileData } : m));
                    } else if (!isSelf) {
                        setMessages(prev => prev.map(m => m.id === payload.new.id ? { ...m, profiles: { username: "ANONYMOUS" } } : m));
                    }
                })
                .subscribe((status) => {
                    console.log("Chat Channel Status:", status);
                });
        };

        initLobby();

        return () => {
            if (lobbyChannel) supabase.removeChannel(lobbyChannel);
            if (chatChannel) supabase.removeChannel(chatChannel);
        };
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
        } catch (error: any) {
            console.error("Lobby Chat Error Details:", {
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code,
                full: error
            });
            const errorMsg = error?.message || "Unknown Error";
            toast.error(`${errorMsg.toUpperCase()} (CODE: ${error?.code || '???'})`);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-compete-purple relative overflow-hidden font-sans">
            {/* TERMINAL SCANLINE EFFECT */}

            <main className="pt-16 lg:pt-20 pb-10 px-3 lg:px-8 max-w-7xl mx-auto space-y-4 lg:space-y-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <div className="flex items-center gap-1 mb-0.5">
                            <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full bg-compete-purple animate-pulse shadow-[0_0_8px_#9B5CFF]" />
                            <span className="text-[7px] lg:text-[8px] font-black tracking-[0.4em] text-white/30">Intelligence</span>
                        </div>
                        <h1 className="text-lg lg:text-3xl font-black italic tracking-tighter leading-none">
                            Operational <span className="text-compete-purple">Lobby</span>
                        </h1>
                        <p className="text-white/20 font-black text-[6px] lg:text-[7px] tracking-[0.3em] mt-0.5">Uplink: Stable • {username}</p>
                    </motion.div>

                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero / Action Hub */}
                        <section>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/[0.02] border border-white/5 rounded-xl lg:rounded-2xl p-4 lg:p-6 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 lg:w-48 lg:h-48 bg-compete-purple/10 blur-[40px] lg:blur-[60px] -translate-y-1/2 translate-x-1/2" />
                                
                                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
                                    <div className="text-center lg:text-left w-full lg:w-auto">
                                        <h3 className="text-xl lg:text-2xl font-black italic text-white mb-1 lg:mb-2 tracking-tighter">
                                            Establish <span className="text-compete-purple">Dominance</span>
                                        </h3>
                                        <p className="text-white/20 text-[8px] lg:text-[10px] font-medium max-w-sm leading-relaxed mb-4">
                                            Network is active. Intercept missions or establish your perimeter.
                                        </p>
                                        <div className="flex gap-4 justify-center lg:justify-start">
                                            <div className="flex flex-col items-center lg:items-start">
                                                <p className="text-[6px] lg:text-[7px] font-black text-white/10 tracking-[0.2em]">Active</p>
                                                <p className="text-base lg:text-lg font-black italic text-white leading-none">{challenges.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </section>

                        {/* Search & Filter Hub */}
                        <section className="bg-white/[0.03] border border-white/5 p-2 rounded-2xl backdrop-blur-md">
                            <div className="flex flex-col md:flex-row gap-2 items-center">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-[9px] font-black tracking-widest focus:border-compete-purple outline-none transition-all"
                                    />
                                </div>
                                <div className="flex bg-black/40 p-1 rounded-lg border border-white/10 w-full md:w-auto overflow-x-auto no-scrollbar">
                                    {["All", "PC", "PS", "Xbox", "Mobile"].map((plat) => (
                                        <button
                                            key={plat}
                                            onClick={() => setSelectedPlatform(plat.toUpperCase())}
                                            className={`px-3 py-1.5 rounded-md text-[8px] font-black tracking-tighter transition-all whitespace-nowrap ${selectedPlatform === plat.toUpperCase() ? 'bg-compete-purple text-white shadow-lg' : 'text-white/30 hover:text-white'
                                                }`}
                                        >
                                            {plat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Challenges List */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xs font-black italic tracking-[0.2em] flex items-center gap-2">
                                    <Zap size={14} className="text-compete-purple" /> Active Missions
                                </h2>
                            </div>

                            <div className="max-h-[500px] overflow-y-auto pr-1 custom-scrollbar space-y-2">
                                <AnimatePresence mode="popLayout">
                                    {filteredChallenges.map((c) => (
                                        <motion.div
                                            layout
                                            key={c.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            onClick={() => setActiveChallenge(c)}
                                            className="bg-white/[0.01] border border-white/5 p-3 rounded-xl flex justify-between items-center hover:bg-white/[0.03] hover:border-white/10 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 border border-white/5 rounded-lg flex items-center justify-center bg-white/[0.02] text-white/20 group-hover:text-compete-purple transition-colors overflow-hidden">
                                                   <Gamepad2 size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black tracking-widest text-white/20 mb-0.5">
                                                        {c.host?.username || "Anonymous"} <span className="mx-1 text-white/10">•</span> {c.platform}
                                                    </p>
                                                    <p className="text-xs font-black italic tracking-tight text-white group-hover:text-compete-purple transition-colors">{c.game_name}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end justify-center">
                                                <p className="text-xs font-black text-compete-purple tracking-tight mb-0.5">KSh {c.prize_pool.toLocaleString()}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[7px] font-bold text-white/20 tracking-widest group-hover:text-white transition-colors">Intercept</span>
                                                    <Zap size={10} className="text-compete-purple group-hover:animate-pulse" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>
                    </div>

                    {/* Terminal Sidebar */}
                    <aside className="lg:col-span-4">
                        <div className="bg-neutral-900/40 border border-white/5 rounded-2xl p-4 backdrop-blur-xl sticky top-24 flex flex-col h-[500px]">
                            <h3 className="text-[9px] font-black tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2 shrink-0">
                                <TerminalIcon size={12} /> World Uplink
                            </h3>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-4 custom-scrollbar no-scrollbar-x h-[400px]">
                                {messages.map((msg, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={msg.id}
                                        className="flex gap-2 items-start group/msg"
                                    >
                                        <button
                                            onClick={() => setSelectedProfile(msg.profiles)}
                                            className="shrink-0 mt-0.5 transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <div className="w-6 h-6 rounded bg-white/5 border border-white/5 overflow-hidden relative">
                                                {msg.profiles?.avatar_url ? (
                                                    <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-white/10">
                                                        <Users size={10} />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 mb-0.5">
                                                <span
                                                    onClick={() => setSelectedProfile(msg.profiles)}
                                                    className="text-compete-purple text-[9px] font-black tracking-tight cursor-pointer hover:underline truncate"
                                                >
                                                    {msg.profiles?.username || "Competitor"}
                                                </span>
                                                {msg.profiles?.role && msg.profiles.role !== 'client' && (
                                                    <span className="px-1 py-0.5 bg-compete-purple text-white rounded text-[5px] font-black tracking-widest">
                                                        {msg.profiles.role}
                                                    </span>
                                                )}
                                                <span className="text-[6px] text-white/5 font-mono ml-auto">
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-white/60 font-medium leading-relaxed bg-white/[0.02] px-3 py-2 rounded-lg rounded-tl-none border border-white/5 group-hover/msg:border-compete-purple/20 transition-colors break-words">
                                                {msg.content}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} className="relative shrink-0 mt-auto">
                                <input
                                    type="text"
                                    placeholder="Type signal..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2.5 px-4 text-[10px] font-medium focus:bg-black/60 focus:border-compete-purple outline-none transition-all pr-10 placeholder:text-white/20 tracking-widest"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || isSending}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-compete-purple hover:text-white transition-colors disabled:opacity-20"
                                >
                                    <Zap size={14} />
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
                                            <span className="text-[10px] font-black tracking-[0.3em] text-compete-purple">Deployment Intel</span>
                                        </div>
                                        <h2 className="text-3xl font-black italic tracking-tighter">{activeChallenge.game_name}</h2>
                                    </div>
                                    <button onClick={() => setActiveChallenge(null)} className="text-white/20 hover:text-white transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-white/20 tracking-widest mb-1">Entry Fee</p>
                                        <p className="text-xl font-black italic">KSh {activeChallenge.entry_fee.toLocaleString()}</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black text-white/20 tracking-widest mb-1">Prize Pool</p>
                                        <p className="text-xl font-black italic text-compete-purple">KSh {activeChallenge.prize_pool.toLocaleString()}</p>
                                    </div>
                                </div>
                                <button
                                    disabled={isProcessing}
                                    onClick={() => handleJoin(activeChallenge)}
                                    className={`w-full py-5 font-black tracking-[0.2em] italic rounded-2xl transition-all shadow-purple-glow flex items-center justify-center gap-3 ${isProcessing ? "bg-white/10 text-white/20 cursor-wait" : "bg-white text-black hover:bg-compete-purple hover:text-white"
                                        }`}
                                >
                                    {isProcessing ? "Synchronizing..." : "Authorize Intercept"}
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
                            <div className="px-8 pb-8 -mt-12 relative z-10 text-center">
                                <div className="inline-block p-1 bg-neutral-900 rounded-2xl mb-4">
                                    <div className="w-24 h-24 rounded-xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl relative group">
                                        {selectedProfile.avatar_url ? (
                                            <img src={selectedProfile.avatar_url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white/10 bg-white/5">
                                                <Users size={40} />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black italic tracking-tighter mb-1 text-white">
                                    {selectedProfile.username || "Competitor"}
                                </h3>
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    <span className="px-3 py-0.5 rounded-full bg-compete-purple/10 border border-compete-purple/20 text-compete-purple text-[8px] font-black tracking-widest">
                                        Lvl {selectedProfile.level || 1}
                                    </span>
                                    <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/40 text-[8px] font-black tracking-widest">
                                        {selectedProfile.rank_name || "Probation"}
                                    </span>
                                </div>

                                {/* Stats Mini-Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
                                        <p className="text-[8px] font-black text-white/20 tracking-widest mb-1">Neural Rank</p>
                                        <p className="text-xs font-black italic text-compete-purple tracking-tight">{selectedProfile.rank_name || "Probation"}</p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
                                        <p className="text-[8px] font-black text-white/20 tracking-widest mb-1">Signal Status</p>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${selectedProfile.id ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-white/20'}`} />
                                            <p className={`text-xs font-black italic tracking-tight ${selectedProfile.id ? 'text-green-500' : 'text-white/20'}`}>
                                                {selectedProfile.id ? 'Active' : 'Offline'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProfile(null)}
                                    className="w-full py-4 bg-white text-black text-[10px] font-black tracking-[0.2em] italic hover:bg-compete-purple hover:text-white transition-all rounded-xl shadow-xl"
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