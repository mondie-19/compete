"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Timer, MessageSquare, Trophy, AlertTriangle, CheckCircle2, Upload, Send, ChevronLeft } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { submitMatchReport } from "@/app/actions/challenges";
import { useHeartbeat } from "@/lib/useHeartbeat";
import Link from "next/link";

const parseGameName = (fullName: string) => {
    if (!fullName) return { title: "UNKNOWN GAME", gamerId: "NOT PROVIDED", engagements: "" };
    
    let title = fullName;
    let gamerId = "NOT PROVIDED";
    let engagements = "";

    const idStart = fullName.indexOf("[ID: ");
    if (idStart !== -1) {
        title = fullName.substring(0, idStart).trim();
        const idEnd = fullName.indexOf("]", idStart);
        if (idEnd !== -1) {
            gamerId = fullName.substring(idStart + 5, idEnd).trim();
            const afterId = fullName.substring(idEnd + 1).trim();
            if (afterId.startsWith("-")) {
                engagements = afterId.substring(1).trim();
            } else {
                engagements = afterId;
            }
        }
    }
    
    return { title, gamerId, engagements };
};

export default function MatchRoom() {
    const { id } = useParams();
    const router = useRouter();
    const supabaseRef = useRef(createClient());
    useHeartbeat();

    const [match, setMatch]   = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser]     = useState<any>(null);

    // Chat State
    const [messages, setMessages]     = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending]   = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Form State
    const [proofFiles, setProofFiles]     = useState<File[]>([]);
    const [previewUrls, setPreviewUrls]   = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportStatus, setReportStatus] = useState<"pending" | "submitted">("pending");

    // Scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Revoke object URLs when files change to prevent memory leaks
    useEffect(() => {
        return () => { previewUrls.forEach(URL.revokeObjectURL); };
    }, [previewUrls]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files);
        const newUrls  = newFiles.map((f) => URL.createObjectURL(f));
        setProofFiles((prev) => [...prev, ...newFiles]);
        setPreviewUrls((prev) => [...prev, ...newUrls]);
    };

    const removeFile = (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);
        setProofFiles((prev) => prev.filter((_, i) => i !== index));
        setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit Report Logic
    const handleReport = async (outcome: "win" | "loss") => {
        if (isSubmitting) return;

        if (proofFiles.length < 3) {
            toast.error("You must upload at least 3 screenshots showing the match results and opponent name.");
            return;
        }

        setIsSubmitting(true);

        try {
            const supabase = supabaseRef.current;
            const proofUrls: string[] = [];

            // 1. Upload proofs to Supabase Storage
            for (const file of proofFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${id}-${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('match-proofs')
                    .upload(fileName, file);

                if (uploadError) throw new Error(`Failed to upload proof image: ${file.name}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('match-proofs')
                    .getPublicUrl(fileName);

                proofUrls.push(publicUrl);
            }

            // 2. Call Server Action to execute the RPC
            const result = await submitMatchReport(id as string, outcome, proofUrls);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`REPORT LOGGED: ${outcome.toUpperCase()}`);
                setReportStatus("submitted");
            }

        } catch (error: any) {
            toast.error(error.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Send Message Logic
    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || isSending || !user) return;

        setIsSending(true);
        const { error } = await supabaseRef.current
            .from("match_messages")
            .insert({
                challenge_id: id,
                user_id: user.id,
                content: newMessage.trim()
            });

        if (error) {
            console.error("Match Chat Error Details:", {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            toast.error(`TRANSMISSION ERROR: ${error.message.toUpperCase()} (${error.code})`);
        } else {
            setNewMessage("");
        }
        setIsSending(false);
    };

    useEffect(() => {
        const supabase = supabaseRef.current;

        const init = async () => {
            // Auth check
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.replace("/auth"); return; }
            setUser(user);

            // 1. Fetch match — use column-name hints (more reliable than FK constraint names)
            const { data: matchData } = await supabase
                .from("challenges")
                .select(`*,
                    host:profiles!host_id(username, avatar_url, level, rank_name),
                    opponent:profiles!opponent_id(username, avatar_url, level, rank_name)
                `)
                .eq("id", id)
                .single();

            if (matchData) setMatch(matchData);

            // 2. Fetch existing messages
            const { data: msgData } = await supabase
                .from("match_messages")
                .select(`*, sender:profiles(username, avatar_url, level, rank_name, role)`)
                .eq("challenge_id", id)
                .order("created_at", { ascending: true });

            if (msgData) setMessages(msgData);

            setLoading(false);
        };

        init();

        // Real-time: match status changes
        const matchChannel = supabase
            .channel(`match-${id}`)
            .on("postgres_changes", { event: "UPDATE", schema: "public", table: "challenges", filter: `id=eq.${id}` }, async (payload) => {
                // Re-fetch with profile joins whenever opponent joins or match resolves
                // because payload.new only has raw column data — no joined profiles
                if (payload.new.opponent_id || payload.new.status === "resolved" || payload.new.status === "disputed") {
                    const { data: refreshed } = await supabase
                        .from("challenges")
                        .select(`*,
                            host:profiles!host_id(username, avatar_url, level, rank_name),
                            opponent:profiles!opponent_id(username, avatar_url, level, rank_name)
                        `)
                        .eq("id", id)
                        .single();
                    if (refreshed) setMatch(refreshed);
                } else {
                    setMatch((prev: any) => ({ ...prev, ...payload.new }));
                }
                if (payload.new.status === "resolved") toast.success("MATCH FINALIZED. CREDITS TRANSFERRED.");
                if (payload.new.status === "in_progress") toast.success("INTERCEPTOR JOINED. BATTLE INITIATED.");
            })
            .subscribe();

        // Real-time: new chat messages
        const chatChannel = supabase
            .channel(`chat-${id}`)
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "match_messages", filter: `challenge_id=eq.${id}` }, async (payload) => {
                const { data: senderData } = await supabase
                    .from("profiles")
                    .select("username, avatar_url, level, rank_name, role")
                    .eq("id", payload.new.user_id)
                    .single();
                setMessages((prev) => [...prev, { ...payload.new, sender: senderData }]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(matchChannel);
            supabase.removeChannel(chatChannel);
        };
    }, [id, router]);

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center gap-4 font-mono">
            <Zap className="text-compete-purple animate-pulse" size={48} />
            <div className="font-black tracking-[0.5em] text-white/20 uppercase text-xs">Establishing Secure Uplink...</div>
        </div>
    );

    const fee = Number(match?.entry_fee || 0);
    const getWagerTheme = () => {
        if (fee >= 10000) {
            return {
                label: "PREMIUM COMBAT",
                accentColor: "text-[#E5E4E2]",
                glowClass: "shadow-[0_0_20px_rgba(229,228,226,0.15)]",
                border: "border-[#E5E4E2]/20",
                shimmer: "bg-gradient-to-r from-[#1A1A24] via-[#E5E4E2] via-[#8E8D9C] via-[#E5E4E2] to-[#1A1A24]"
            };
        }
        if (fee >= 5000) {
            return {
                label: "HIGH COMBAT",
                accentColor: "text-[#FFD700]",
                glowClass: "shadow-[0_0_20px_rgba(255,215,0,0.15)]",
                border: "border-[#FFD700]/20",
                shimmer: "bg-gradient-to-r from-[#1A1A10] via-[#FFD700] via-[#B8860B] via-[#FFD700] to-[#1A1A10]"
            };
        }
        return {
            label: "STANDARD COMBAT",
            accentColor: "text-[#9B5CFF]",
            glowClass: "shadow-[0_0_20px_rgba(155,92,255,0.15)]",
            border: "border-[#9B5CFF]/20",
            shimmer: "bg-gradient-to-r from-[#0F0A1A] via-[#9B5CFF] via-[#5A20B3] via-[#9B5CFF] to-[#0F0A1A]"
        };
    };
    const wagerTheme = getWagerTheme();

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white pt-28 pb-16 px-4 md:px-8 font-mono">
            <div className="max-w-6xl mx-auto">
                
                {/* Back to Lobby breadcrumb */}
                <Link 
                    href="/lobby" 
                    className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors mb-6 text-[10px] font-black uppercase tracking-wider group"
                >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Lobby</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT: MATCH INTEL */}
                    <div className="lg:col-span-8 space-y-6">
                        <header className="bg-[#0F0F16]/60 border border-white/10 rounded-3xl p-6 lg:p-8 relative overflow-hidden backdrop-blur-md">
                            
                            {/* Dynamic Iridescent Accent indicator */}
                            <style>{`
                                @keyframes shimmer {
                                    0% { background-position: 200% 0; }
                                    100% { background-position: -200% 0; }
                                }
                            `}</style>
                            <div
                                className={`absolute top-0 left-0 right-0 h-0.75 ${wagerTheme.shimmer}`}
                                style={{ backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }}
                            />

                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none hidden lg:block"><Shield size={120} /></div>

                            <div className="flex justify-between items-center mb-6 lg:mb-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                    <span className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-red-500">LIVE COMBAT</span>
                                </div>
                                <div className={`flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 ${wagerTheme.accentColor}`}>
                                    <Timer size={12} />
                                    <span className="font-mono text-[9px] font-black uppercase tracking-wider">{wagerTheme.label}</span>
                                </div>
                            </div>

                            {(() => {
                                const p = parseGameName(match?.game_name);
                                return (
                                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 px-2 lg:px-4">
                                        <div className="w-full lg:w-auto"><PlayerCard profile={match?.host} side="Host" gamerId={p.gamerId} /></div>
                                        <div className="text-center flex flex-row lg:flex-col items-center gap-4 lg:gap-0 shrink-0">
                                            <div className="text-xl lg:text-3xl font-black italic text-white/10 tracking-tighter">VS</div>
                                            <div className={`px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[9px] lg:text-[11px] font-black uppercase tracking-widest border ${wagerTheme.glowClass} bg-black/60 border-white/10 text-white whitespace-nowrap`}>
                                                KSh {Number(match?.prize_pool || 0).toLocaleString()} PRIZE POT
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-auto"><PlayerCard profile={match?.opponent} side="Interceptor" /></div>
                                    </div>
                                );
                            })()}
                        </header>

                        {/* Dynamic Match Details Bento Card */}
                        {(() => {
                            const parsed = parseGameName(match?.game_name);
                            return (
                                <div className="bg-[#0F0F16]/60 border border-white/10 backdrop-blur-md rounded-3xl p-6 grid grid-cols-2 md:grid-cols-6 gap-6 font-mono">
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">GAME TITLE</p>
                                        <p className="text-xs font-black text-white uppercase">{parsed.title}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">PLATFORM</p>
                                        <p className="text-xs font-black text-compete-purple uppercase">{match?.platform || "PC"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">HOST GAMER ID</p>
                                        <p className="text-xs font-black text-white uppercase truncate" title={parsed.gamerId}>{parsed.gamerId}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">INTERCEPTOR GAMER ID</p>
                                        <p className="text-xs font-black text-white uppercase truncate" title={match?.opponent_game_id || match?.opponent?.username || "AWAITING..."}>
                                            {match?.opponent_game_id || match?.opponent?.username || "AWAITING..."}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">STAKE PER PLAYER</p>
                                        <p className="text-xs font-black text-green-400">KSh {Number(match?.entry_fee || 0).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1">WINNER RECEIVES</p>
                                        <p className="text-xs font-black text-yellow-400">KSh {(Number(match?.prize_pool || 0) * 0.85).toLocaleString()}</p>
                                        <p className="text-[7px] text-white/20 uppercase tracking-widest">after 15% platform fee</p>
                                    </div>
                                    {parsed.engagements && (
                                        <div className="col-span-2 md:col-span-6 pt-4 border-t border-white/5">
                                            <p className="text-[8px] font-black text-white/20 tracking-widest uppercase mb-1.5">ENGAGEMENTS & RULES</p>
                                            <p className="text-[10px] text-white/60 leading-relaxed uppercase font-black italic">{parsed.engagements}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* ACTION ZONE OR STATUS ZONE */}
                        <AnimatePresence mode="wait">
                            {match?.status === 'open' ? (
                                <motion.div
                                    key="open"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#0F0F16]/60 border border-compete-purple/20 p-8 lg:p-12 rounded-3xl text-center space-y-4 backdrop-blur-md"
                                >
                                    <div className="w-16 h-16 bg-compete-purple/10 border border-compete-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-compete-purple border-t-transparent animate-spin" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white">AWAITING INTERCEPTOR</h2>
                                    <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-compete-purple/60 max-w-sm mx-auto leading-loose">
                                        YOUR DEPLOYMENT IS LIVE IN THE LOBBY.<br />
                                        SHARE THIS LINK TO CHALLENGE A RIVAL DIRECTLY.
                                    </p>
                                    <button
                                        onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("MATCH LINK COPIED"); }}
                                        className="mt-4 px-6 py-2.5 bg-compete-purple/10 border border-compete-purple/30 text-compete-purple rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-compete-purple hover:text-white transition-all"
                                    >
                                        Copy Challenge Link
                                    </button>
                                </motion.div>
                            ) : match?.status === 'resolved' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#0F0F16]/60 border border-green-500/20 p-8 lg:p-12 rounded-3xl text-center space-y-4 backdrop-blur-md shadow-[0_0_40px_rgba(34,197,94,0.02)]"
                                >
                                    <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Trophy size={28} className="text-green-500" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white">BOUT FINALIZED</h2>
                                    <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-green-500/60 max-w-sm mx-auto leading-loose">
                                        WINNER: <span className="text-white">{match.winner_id === match.host_id ? match.host?.username : match.opponent?.username}</span><br />
                                        KSh {(Number(match?.prize_pool || 0) * 0.85).toLocaleString()} CREDITED TO VAULT.
                                    </p>
                                </motion.div>
                            ) : match?.status === 'disputed' ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#0F0F16]/60 border border-red-500/20 p-8 lg:p-12 rounded-3xl text-center space-y-4 backdrop-blur-md shadow-[0_0_40px_rgba(239,68,68,0.02)]"
                                >
                                    <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle size={28} className="text-red-500" />
                                    </div>
                                    <h2 className="text-2xl lg:text-3xl font-black italic uppercase tracking-tighter text-white">DISPUTE FLAGGED</h2>
                                    <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest text-red-500/60 max-w-sm mx-auto leading-loose">
                                        CONFLICTING REPORTS LOGGED. ADMIN INTERVENTION REQUIRED. SCREENSHOT EVIDENCE IS UNDER RECOGNITION.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-[#0F0F16]/60 border border-white/10 p-6 lg:p-8 rounded-3xl space-y-6 backdrop-blur-md">
                                        <h3 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/40">
                                            <Upload className="text-compete-purple w-3.5 h-3.5" /> INTELLIGENCE FEED
                                        </h3>
                                        <p className="text-[10px] lg:text-xs text-white/60 leading-relaxed font-black uppercase">Upload 3 clear screenshots showing the scoreboard and player names.</p>

                                        <label className={`w-full py-6 border border-dashed rounded-2xl transition-all text-[9px] lg:text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer ${proofFiles.length >= 3 ? 'bg-compete-purple/10 border-compete-purple text-white shadow-purple-glow' : 'bg-black/40 border-white/10 hover:border-white/20 text-white/40'}`}>
                                            {proofFiles.length > 0 ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className={`${proofFiles.length >= 3 ? "text-green-500" : "text-yellow-500"} w-5 h-5`} />
                                                    <span>{proofFiles.length} Logs Staged</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <Upload className="mb-2 w-5 h-5 text-compete-purple" />
                                                    <span>Upload Evidence</span>
                                                </>
                                            )}
                                            <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </label>

                                        {/* PREVIEW/REMOVE LIST */}
                                        {proofFiles.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {proofFiles.map((file, idx) => (
                                                    <div key={idx} className="relative group aspect-square bg-black rounded-xl border border-white/10 overflow-hidden">
                                                        <img src={previewUrls[idx]} alt="preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                        <button
                                                            onClick={() => removeFile(idx)}
                                                            className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black uppercase text-red-500"
                                                        >
                                                            Purge
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-[#0F0F16]/60 border border-white/10 p-6 lg:p-8 rounded-3xl flex flex-col justify-between backdrop-blur-md">
                                        <div className="space-y-4">
                                            <h3 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/40">
                                                <Trophy className="text-yellow-500 w-3.5 h-3.5" /> RESOLUTION MATRIX
                                            </h3>
                                            <p className="text-[10px] lg:text-xs text-white/60 leading-relaxed font-black uppercase">Verify the outcome. Consensus enables instant payout.</p>
                                        </div>
                                        
                                        {reportStatus === "submitted" ? (
                                            <div className="bg-compete-purple/5 border border-compete-purple/20 rounded-2xl p-6 text-center mt-6">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full border-2 border-compete-purple border-t-transparent animate-spin" />
                                                    <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-compete-purple">TRANSMITTING RESULT...</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-3 mt-8">
                                                <button
                                                    disabled={isSubmitting}
                                                    onClick={() => handleReport('win')}
                                                    className="w-full py-4 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full hover:bg-green-500 hover:text-white active:scale-[0.98] transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.05)]"
                                                >
                                                    {isSubmitting ? "TRANSMITTING..." : "Victory"}
                                                </button>
                                                <button
                                                    disabled={isSubmitting}
                                                    onClick={() => handleReport('loss')}
                                                    className="w-full py-4 bg-white/5 border border-white/10 text-white/40 rounded-full hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 active:scale-[0.98] transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    Defeat
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT: TACTICAL CHAT */}
                    <div className="lg:col-span-4 flex flex-col h-[450px] lg:h-[650px] bg-[#0F0F16]/60 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-md shadow-2xl">
                        <div className="p-4 lg:p-6 border-b border-white/5 bg-white/[0.02]">
                            <h3 className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                                <MessageSquare className="w-3.5 h-3.5" /> TACTICAL COMMS
                            </h3>
                        </div>

                        <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-hide">
                            <div className="text-[10px] font-black text-compete-purple uppercase tracking-[0.2em] opacity-50 flex items-center gap-2">
                                <Zap size={10} /> Link Established
                            </div>
                            
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-10 gap-4">
                                    <MessageSquare size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No Active Transmission</p>
                                </div>
                            )}

                            {messages.map((msg, i) => {
                                const isMe = msg.user_id === user?.id;
                                return (
                                    <div key={i} className={`flex flex-col gap-2 ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2">
                                            {!isMe && <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{msg.sender?.username || "Interceptor"}</span>}
                                            <span className="text-[8px] font-mono text-white/10">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {isMe && <span className="text-[9px] font-black text-compete-purple uppercase tracking-widest">YOU</span>}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[11px] font-black tracking-wide leading-relaxed ${
                                            isMe 
                                            ? 'bg-compete-purple text-white rounded-tr-none' 
                                            : 'bg-white/5 border border-white/5 text-white/80 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-[#0F0F16]/90 border-t border-white/5 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="TYPE TACTICAL INTEL..."
                                className="flex-1 bg-black/50 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none p-3 lg:p-4 placeholder:opacity-20 focus:bg-black/80 transition-all focus:border-compete-purple/40"
                            />
                            <button 
                                type="submit"
                                disabled={isSending || !newMessage.trim()}
                                className="w-12 h-12 bg-white text-black hover:bg-compete-purple hover:text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-all shadow-purple-glow shrink-0"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ profile, side, gamerId }: { profile: any, side: string, gamerId?: string }) {
    return (
        <div className={`flex items-center gap-3 lg:gap-5 ${side === 'Interceptor' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="relative group shrink-0">
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-compete-purple to-blue-600 p-[1.5px] transition-transform group-hover:scale-105 duration-500">
                    <div className="w-full h-full bg-black rounded-2xl flex items-center justify-center font-black text-sm lg:text-2xl italic uppercase overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                            <span className="text-white/20 group-hover:text-compete-purple transition-colors">{profile?.username?.[0] || "?"}</span>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 px-1.5 py-0.5 rounded-md text-[6px] lg:text-[8px] font-black text-compete-purple">
                    L{profile?.level || 1}
                </div>
            </div>
            <div className="min-w-0">
                <p className="text-[8px] lg:text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-0.5 lg:mb-1">{side}</p>
                <p className="text-sm lg:text-xl font-black italic uppercase tracking-tighter leading-none mb-0.5 truncate">{profile?.username || "AWAITING..."}</p>
                {gamerId && gamerId !== "NOT PROVIDED" && (
                    <p className="text-[8px] font-black text-compete-purple uppercase tracking-widest mb-1 truncate">{gamerId}</p>
                )}
                <div className={`flex items-center gap-1.5 lg:gap-2 ${side === 'Interceptor' ? 'flex-row-reverse' : ''}`}>
                    <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[6px] lg:text-[8px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                        {profile?.rank_name || "NOOB"}
                    </div>
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className={`w-2 h-0.5 lg:w-3 lg:h-1 rounded-full ${i <= (profile?.level % 3 + 1) ? 'bg-compete-purple shadow-[0_0_5px_#9B5CFF]' : 'bg-white/5'}`} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
