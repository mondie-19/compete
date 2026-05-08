"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Timer, MessageSquare, Trophy, AlertTriangle, CheckCircle2, Upload, Send } from "lucide-react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { submitMatchReport } from "@/app/actions/challenges";

export default function MatchRoom() {
    const { id } = useParams();
    const supabase = createClient();
    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Form State
    const [proofFiles, setProofFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportStatus, setReportStatus] = useState<"pending" | "submitted">("pending");

    // Scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // File Upload Handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setProofFiles((prev) => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setProofFiles((prev) => prev.filter((_, i) => i !== index));
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
            const proofUrls: string[] = [];

            // 1. Upload proofs to Supabase
            for (const file of proofFiles) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${id}-${user?.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('match-proofs')
                    .upload(fileName, file);

                if (uploadError) throw new Error(`Failed to upload proof image: ${file.name}`);

                // Get public URL
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
        const { error } = await supabase
            .from("match_messages")
            .insert({
                challenge_id: id,
                user_id: user.id,
                content: newMessage.trim()
            });

        if (error) {
            toast.error("Failed to transmit comms.");
        } else {
            setNewMessage("");
        }
        setIsSending(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // 1. Fetch Match
            const { data: matchData } = await supabase
                .from("challenges")
                .select(`*, host:profiles!challenges_creator_id_fkey(username, avatar_url, level, rank_name), opponent:profiles!challenges_opponent_id_fkey(username, avatar_url, level, rank_name)`)
                .eq("id", id)
                .single();

            if (matchData) setMatch(matchData);

            // 2. Fetch Messages
            const { data: msgData } = await supabase
                .from("match_messages")
                .select(`*, sender:profiles(username)`)
                .eq("challenge_id", id)
                .order("created_at", { ascending: true });

            if (msgData) setMessages(msgData);
            
            setLoading(false);
        };

        fetchData();

        // REAL-TIME SYNC: Match Updates
        const matchChannel = supabase.channel(`match-${id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'challenges', filter: `id=eq.${id}` }, (payload) => {
                setMatch((prev: any) => ({ ...prev, ...payload.new }));
                if (payload.new.status === 'resolved') {
                    toast.success("MATCH FINALIZED. CREDITS TRANSFERRED.");
                }
            })
            .subscribe();

        // REAL-TIME SYNC: Chat Messages
        const chatChannel = supabase.channel(`chat-${id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_messages', filter: `challenge_id=eq.${id}` }, async (payload) => {
                // Fetch sender info for the new message
                const { data: senderData } = await supabase
                    .from("profiles")
                    .select("username")
                    .eq("id", payload.new.user_id)
                    .single();
                
                const newMsg = { ...payload.new, sender: senderData };
                setMessages((prev) => [...prev, newMsg]);
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(matchChannel); 
            supabase.removeChannel(chatChannel);
        };
    }, [id, supabase]);

    if (loading) return (
        <div className="min-h-screen bg-[#020205] flex flex-col items-center justify-center gap-4">
            <Zap className="text-compete-purple animate-pulse" size={48} />
            <div className="font-black tracking-[0.5em] text-white/20 uppercase text-xs">Establishing Secure Uplink...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: MATCH INTEL */}
                <div className="lg:col-span-8 space-y-6">
                    <header className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><Shield size={120} /></div>

                        <div className="flex justify-between items-center mb-12">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">Live Combat Session</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                <Timer size={14} className="text-compete-purple" />
                                <span className="font-mono text-xs text-white/60">SESSION ACTIVE</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between relative z-10 px-4">
                            <PlayerCard profile={match?.host} side="Host" />
                            <div className="text-center">
                                <div className="text-4xl font-black italic text-white/10 mb-4 tracking-tighter">VS</div>
                                <div className="bg-compete-purple/10 text-compete-purple px-6 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-compete-purple/20 shadow-purple-glow">
                                    ${match?.prize_pool} POT
                                </div>
                            </div>
                            <PlayerCard profile={match?.opponent} side="Interceptor" />
                        </div>
                    </header>

                    {/* ACTION ZONE OR STATUS ZONE */}
                    <AnimatePresence mode="wait">
                        {match?.status === 'resolved' ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 p-10 rounded-[2.5rem] text-center space-y-4 shadow-[0_0_40px_rgba(34,197,94,0.05)]"
                            >
                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Trophy size={32} className="text-green-500" />
                                </div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Bout Finalized</h2>
                                <p className="text-[11px] font-black uppercase tracking-widest text-green-500/60 max-w-sm mx-auto leading-loose">
                                    Winner: <span className="text-white">{match.winner_id === match.host_id ? match.host.username : match.opponent?.username}</span><br />
                                    The global vault has released the credits.
                                </p>
                            </motion.div>
                        ) : match?.status === 'disputed' ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-10 rounded-[2.5rem] text-center space-y-4 shadow-[0_0_40px_rgba(239,68,68,0.05)]"
                            >
                                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Dispute Flagged</h2>
                                <p className="text-[11px] font-black uppercase tracking-widest text-red-500/60 max-w-sm mx-auto leading-loose">
                                    Conflicting results detected. Admin intervention required. Evidence is being reviewed.
                                </p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/40">
                                        <Upload size={14} className="text-compete-purple" /> Intelligence Feed
                                    </h3>
                                    <p className="text-xs text-white/60 leading-relaxed font-medium">Upload clear screenshots of the scoreboard and player names. Fraud will result in a permanent ban.</p>

                                    <label className={`w-full py-6 border-2 border-dashed rounded-3xl transition-all text-[11px] font-black uppercase tracking-widest flex flex-col items-center justify-center cursor-pointer mb-2 ${proofFiles.length >= 3 ? 'bg-compete-purple/10 border-compete-purple text-white shadow-purple-glow' : 'bg-white/5 border-white/10 hover:border-white/20 text-white/40'}`}>
                                        {proofFiles.length > 0 ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <CheckCircle2 size={24} className={proofFiles.length >= 3 ? "text-green-500" : "text-yellow-500"} />
                                                <span>{proofFiles.length} Evidence Logs</span>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload size={24} className="mb-2" />
                                                <span>Upload Evidence (Min 3)</span>
                                            </>
                                        )}
                                        <input type="file" multiple className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </label>

                                    {/* PREVIEW/REMOVE LIST */}
                                    {proofFiles.length > 0 && (
                                        <div className="grid grid-cols-3 gap-3">
                                            {proofFiles.map((file, idx) => (
                                                <div key={idx} className="relative group aspect-square bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                    <button
                                                        onClick={() => removeFile(idx)}
                                                        className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase text-red-500"
                                                    >
                                                        Purge
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-white/40">
                                            <Trophy size={14} className="text-yellow-500" /> Resolution Matrix
                                        </h3>
                                        <p className="text-xs text-white/60 leading-relaxed font-medium">Verify the bout outcome. Consensus between both players enables instant payout.</p>
                                    </div>
                                    
                                    {reportStatus === "submitted" ? (
                                        <div className="bg-compete-purple/5 border border-compete-purple/20 rounded-3xl p-8 text-center mt-6">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 rounded-full border-2 border-compete-purple border-t-transparent animate-spin" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-compete-purple">Awaiting Signal...</p>
                                                <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Waiting for opponent to report</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-3 mt-8">
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleReport('win')}
                                                className="w-full py-5 bg-green-500/10 border border-green-500/30 text-green-500 rounded-[1.5rem] hover:bg-green-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50 shadow-[0_0_20px_rgba(34,197,94,0.1)]"
                                            >
                                                {isSubmitting ? "TRANSMITTING..." : "Victory Confirmed"}
                                            </button>
                                            <button
                                                disabled={isSubmitting}
                                                onClick={() => handleReport('loss')}
                                                className="w-full py-5 bg-white/5 border border-white/10 text-white/40 rounded-[1.5rem] hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500 transition-all text-xs font-black uppercase tracking-widest disabled:opacity-50"
                                            >
                                                Defeat Acknowledged
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* RIGHT: TACTICAL CHAT */}
                <div className="lg:col-span-4 flex flex-col h-[650px] bg-[#0A0A0F] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-2">
                            <MessageSquare size={14} /> Tactical Comms
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
                                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-[11px] font-medium leading-relaxed ${
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

                    <form onSubmit={handleSendMessage} className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="TYPE TACTICAL INTEL..."
                            className="flex-1 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest focus:outline-none p-4 placeholder:opacity-20 focus:bg-white/10 transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={isSending || !newMessage.trim()}
                            className="w-12 h-12 bg-compete-purple rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all shadow-purple-glow"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function PlayerCard({ profile, side }: { profile: any, side: string }) {
    return (
        <div className={`flex items-center gap-5 ${side === 'Interceptor' ? 'flex-row-reverse text-right' : ''}`}>
            <div className="relative group">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-compete-purple to-blue-600 p-[2px] transition-transform group-hover:scale-105 duration-500">
                    <div className="w-full h-full bg-black rounded-[1.4rem] flex items-center justify-center font-black text-2xl italic uppercase overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                        ) : (
                            <span className="text-white/20 group-hover:text-compete-purple transition-colors">{profile?.username?.[0] || "?"}</span>
                        )}
                    </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black border border-white/10 px-2 py-0.5 rounded-lg text-[8px] font-black text-compete-purple">
                    LVL {profile?.level || 1}
                </div>
            </div>
            <div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{side}</p>
                <p className="text-xl font-black italic uppercase tracking-tighter leading-none mb-2">{profile?.username || "AWAITING..."}</p>
                <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black text-white/40 uppercase tracking-widest">
                        {profile?.rank_name || "NOOB"}
                    </div>
                    <div className="flex gap-0.5">
                        {[1, 2, 3].map(i => <div key={i} className={`w-3 h-1 rounded-full ${i <= (profile?.level % 3 + 1) ? 'bg-compete-purple shadow-[0_0_5px_#9B5CFF]' : 'bg-white/5'}`} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
