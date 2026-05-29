"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Shield, Eye, CheckCircle2, Clock, Copy, Check, Video, 
  AlertTriangle, Calendar, X, Play, ZoomIn, Gamepad2, 
  ArrowRight, User, DollarSign, ExternalLink
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { resolveMatchAsModerator } from "@/app/actions/moderator";
import { toast } from "sonner";
import Link from "next/link";

export default function ModeratorDashboard() {
    const supabase = createClient();
    useHeartbeat();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMod, setIsMod] = useState(false);
    const [solving, setSolving] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'pending_review' | 'disputed'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // useRef holds the realtime channel instance across renders without
    // triggering re-renders, so we can safely tear it down before re-subscribing.
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
    
    // Lightbox Modal State
    const [previewMedia, setPreviewMedia] = useState<{
        url: string;
        isVideo: boolean;
        username: string;
        matchId: string;
        playerRole: 'Host' | 'Opponent';
        playerId: string;
        hostId: string;
        opponentId: string;
        hostUsername: string;
        opponentUsername: string;
    } | null>(null);

    const isMediaVideo = (url: string) => {
        if (!url) return false;
        const cleanUrl = url.split('?')[0].toLowerCase();
        const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg', '.mkv', '.avi'];
        return videoExtensions.some(ext => cleanUrl.endsWith(ext)) || url.toLowerCase().includes('video') || url.toLowerCase().includes('recording');
    };

    const formatTime = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric'
        }) + ' at ' + date.toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // useCallback ensures the realtime callbacks always invoke the latest
    // fetchMatches that closes over the current `filter` — no stale closures.
    const fetchMatches = useCallback(async () => {
        try {
            let query = supabase
                .from("challenges")
                .select(`
                    *,
                    host:profiles!challenges_host_id_fkey(id, username),
                    opponent:profiles!challenges_opponent_id_fkey(id, username),
                    reports:match_reports(*)
                `)
                .in("status", ["pending_review", "disputed"])
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data: activeMatches } = await query;
            setMatches(activeMatches || []);
        } finally {
            // Always clear loading, even if the query throws.
            setLoading(false);
        }
    }, [supabase, filter]);

    useEffect(() => {
        const checkRoleAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/auth";
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== 'moderator' && profile?.role !== 'admin') {
                window.location.href = "/lobby";
                return;
            }

            setIsMod(true);
            await fetchMatches();

            // Tear down the old channel BEFORE creating a new one.
            // This is the fix: calling .on() on an already-subscribed channel
            // is what caused "cannot add postgres_changes callbacks after subscribe()".
            if (channelRef.current) {
                await supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            channelRef.current = supabase
                .channel('challenges_mod')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'challenges'
                }, () => {
                    fetchMatches();
                })
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'match_reports'
                }, () => {
                    fetchMatches();
                })
                .subscribe();
        };

        checkRoleAndFetch();

        // removeChannel on unmount fully de-registers from the Supabase client.
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [fetchMatches, supabase]);

    const handleCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        toast.success("Match ID copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleResolve = async (challengeId: string, winnerId: string | null, action: 'resolve' | 'cancel') => {
        setSolving(challengeId);
        try {
            const result = await resolveMatchAsModerator(challengeId, winnerId, action);
            if (result.success) {
                toast.success(action === 'resolve' ? "Winner declared successfully." : "Match cancelled and refunded.");
                setMatches(prev => prev.filter(m => m.id !== challengeId));
                if (previewMedia?.matchId === challengeId) {
                    setPreviewMedia(null);
                }
            } else {
                toast.error(result?.error || "Error occurred");
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSolving(null);
        }
    };

    if (!isMod || loading) {
        return (
            <div className="min-h-screen bg-[#0B0B10] flex flex-col items-center justify-center text-white/30 font-sans font-black tracking-[0.4em] uppercase">
                <Shield size={48} className="mb-4 animate-pulse text-[#9B5CFF]" style={{ filter: "drop-shadow(0 0 15px rgba(155,92,255,0.4))" }} />
                Accessing Command Core...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B0B10] text-[#EDEDED] font-sans selection:bg-[#9B5CFF] relative pt-28 md:pt-36 pb-12 px-4 md:px-0 overflow-x-hidden">
            {/* Glowing background shapes */}
            <div className="absolute top-[-10%] left-[-15%] w-[500px] h-[500px] bg-[#9B5CFF]/10 rounded-full blur-[150px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] bg-[#9B5CFF]/5 rounded-full blur-[180px] pointer-events-none z-0" />

            {/* Redesigned Centered Main Container */}
            <div className="max-w-3xl mx-auto relative z-10 space-y-10">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-[#9B5CFF]/10 border border-[#9B5CFF]/20 px-3 py-1 rounded-full text-[#B48CFF] mb-3">
                            <Shield size={12} className="animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Moderator Central</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter leading-none">
                            Match <span className="text-[#9B5CFF] text-glow">Verifications</span>
                        </h1>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2 font-semibold">
                            Secure dispute resolution desk & verify submitted outcomes
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-[#12121A] border border-white/10 rounded-2xl p-1 flex flex-row flex-nowrap items-center whitespace-nowrap shrink-0">
                            {(['all', 'pending_review', 'disputed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${
                                        filter === f 
                                            ? 'bg-white text-black font-black shadow-lg shadow-white/5' 
                                            : 'text-white/40 hover:text-white/80'
                                    }`}
                                >
                                    {f.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="bg-[#12121A]/80 border border-white/10 px-4 py-2.5 rounded-2xl flex flex-col items-end min-w-[90px]">
                            <span className="text-[8px] font-black uppercase text-white/30 tracking-widest">Awaiting</span>
                            <span className="text-lg font-black italic text-[#9B5CFF] leading-none mt-1">{matches.length}</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard List */}
                <main className="space-y-6">
                    {matches.length === 0 ? (
                        <div className="py-24 bg-[#12121A]/30 border border-white/5 rounded-[32px] flex flex-col items-center justify-center text-center p-8 backdrop-blur-3xl shadow-purple-glow">
                            <CheckCircle2 size={48} className="text-[#9B5CFF] opacity-30 mb-4 animate-bounce" />
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-[#EDEDED]">Verification Queue Clear</h3>
                            <p className="text-[9px] text-white/30 uppercase font-black tracking-widest mt-2">All submitted match outcomes are fully settled.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {matches.map((match) => {
                                const hostReport = (match.reports || []).find((r: any) => r.reporter_id === match.host_id);
                                const opponentReport = (match.reports || []).find((r: any) => r.reporter_id === match.opponent_id);

                                return (
                                    <div 
                                        key={match.id} 
                                        className="bg-[#12121A]/80 border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-2xl transition-all duration-300 hover:border-[#9B5CFF]/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] group flex flex-col"
                                    >
                                        
                                        {/* Card Top: Match Brand & Attributes */}
                                        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-white/[0.01] to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-[#9B5CFF]/15 border border-[#9B5CFF]/30 flex items-center justify-center text-[#B48CFF] text-lg italic font-black shadow-[0_0_15px_rgba(155,92,255,0.15)] shrink-0">
                                                    {match.game_name?.[0]?.toUpperCase() || <Gamepad2 size={20} />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center flex-wrap gap-2">
                                                        <h3 className="font-black italic uppercase text-lg leading-none tracking-tight text-[#EDEDED]">{match.game_name}</h3>
                                                        {match.status === 'disputed' ? (
                                                            <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse flex items-center gap-1">
                                                                <AlertTriangle size={8} /> Dispute
                                                            </span>
                                                        ) : (
                                                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest animate-pulse">
                                                                Reviewing
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Copyable Match ID */}
                                                    <div className="flex items-center gap-1.5 mt-1.5 cursor-pointer text-white/30 hover:text-white/60 transition-colors" onClick={() => handleCopy(match.id)}>
                                                        <span className="text-[8px] uppercase font-black tracking-widest leading-none">
                                                            ID: {match.id.substring(0, 8)}...{match.id.substring(match.id.length - 4)}
                                                        </span>
                                                        {copiedId === match.id ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Top Right: Pot Pool Details */}
                                            <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                                                <div className="flex gap-4">
                                                    <div className="text-left sm:text-right">
                                                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block leading-none">PRIZE POT</span>
                                                        <span className="text-base font-black italic text-[#9B5CFF] text-glow leading-none block mt-1">${match.prize_pool}</span>
                                                    </div>
                                                    <div className="w-px h-6 bg-white/10" />
                                                    <div className="text-left sm:text-right">
                                                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest block leading-none">ENTRY FEE</span>
                                                        <span className="text-xs font-bold text-white/60 leading-none block mt-1">${match.entry_fee}</span>
                                                    </div>
                                                </div>
                                                
                                                <Link 
                                                    href={`/match/${match.id}`} 
                                                    target="_blank" 
                                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/55 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center"
                                                    title="Open Match Room"
                                                >
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Card Middle: Timeline & Milestones */}
                                        <div className="px-6 py-4 bg-white/[0.01] border-b border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] text-white/50 font-semibold">
                                            
                                            {/* Column A: Match Timestamps */}
                                            <div className="space-y-2 border-r-0 md:border-r border-white/5 pr-0 md:pr-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/20 uppercase font-black text-[8px] tracking-wider flex items-center gap-1.5">
                                                        <Calendar size={10} /> Created Time
                                                    </span>
                                                    <span className="text-white/70 font-mono text-[9px]">{formatTime(match.created_at)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/20 uppercase font-black text-[8px] tracking-wider flex items-center gap-1.5">
                                                        <Clock size={10} /> Match Started
                                                    </span>
                                                    <span className="text-white/70 font-mono text-[9px]">{formatTime(match.joined_at)}</span>
                                                </div>
                                            </div>

                                            {/* Column B: Voted Timestamps */}
                                            <div className="space-y-2 pl-0 md:pl-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/20 uppercase font-black text-[8px] tracking-wider flex items-center gap-1">
                                                        <User size={10} /> Host Vote Time
                                                    </span>
                                                    <span className="text-white/70 font-mono text-[9px]">
                                                        {hostReport ? formatTime(hostReport.created_at) : "No Report / Pending"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-white/20 uppercase font-black text-[8px] tracking-wider flex items-center gap-1">
                                                        <User size={10} /> Opponent Vote
                                                    </span>
                                                    <span className="text-white/70 font-mono text-[9px]">
                                                        {opponentReport ? formatTime(opponentReport.created_at) : "No Report / Pending"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Core: Evidence Hub (Pics & Recordings) */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5 border-b border-white/5">
                                            {[
                                                { player: match.host, role: 'Host' as const, opponent: match.opponent, report: hostReport },
                                                { player: match.opponent, role: 'Opponent' as const, opponent: match.host, report: opponentReport }
                                            ].map(({ player, role, report }, idx) => {
                                                return (
                                                    <div key={player?.id || idx} className="p-6 space-y-4 flex flex-col justify-between">
                                                        <div className="space-y-3">
                                                            
                                                            {/* Player info card header */}
                                                            <div className="flex justify-between items-start gap-2 bg-white/[0.02] p-3.5 rounded-2xl border border-white/5">
                                                                <div className="truncate">
                                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-1.5">{role}</p>
                                                                    <p className="text-base font-black italic uppercase tracking-tight text-[#EDEDED] truncate">{player?.username || "Awaiting..."}</p>
                                                                </div>
                                                                
                                                                <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border shrink-0 ${
                                                                    report?.reported_outcome === 'win' 
                                                                        ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                                                        : report?.reported_outcome === 'loss' 
                                                                            ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                                                            : report?.reported_outcome === 'cancel'
                                                                                ? 'bg-white/10 border-white/20 text-white/50'
                                                                                : 'bg-white/5 border-white/10 text-white/20'
                                                                }`}>
                                                                    {report ? `CLAIMED ${report.reported_outcome}` : "NO REPORT"}
                                                                </span>
                                                            </div>

                                                            {/* Media Evidence Gallery */}
                                                            <div className="grid grid-cols-3 gap-2.5">
                                                                {(report?.proof_image_urls || []).map((url: string, i: number) => {
                                                                    const isVideo = isMediaVideo(url);
                                                                    return (
                                                                        <div 
                                                                            key={i} 
                                                                            onClick={() => setPreviewMedia({
                                                                                url,
                                                                                isVideo,
                                                                                username: player?.username || 'Player',
                                                                                playerRole: role,
                                                                                matchId: match.id,
                                                                                playerId: player?.id || '',
                                                                                hostId: match.host_id,
                                                                                opponentId: match.opponent_id,
                                                                                hostUsername: match.host?.username || 'Host',
                                                                                opponentUsername: match.opponent?.username || 'Opponent'
                                                                            })}
                                                                            className="aspect-video bg-black/40 rounded-xl border border-white/5 overflow-hidden group/img relative cursor-pointer hover:border-[#9B5CFF]/50 transition-all duration-300"
                                                                        >
                                                                            {isVideo ? (
                                                                                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 relative">
                                                                                    <Video size={18} className="text-[#B48CFF] opacity-60 group-hover/img:scale-110 transition-transform duration-300" />
                                                                                    <div className="absolute bottom-1 right-1 bg-black/60 rounded px-1 text-[6px] font-black uppercase text-white/80 tracking-widest">
                                                                                        REC
                                                                                    </div>
                                                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                                                                        <Play size={14} className="text-white fill-white" />
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <>
                                                                                    <img src={url} alt="proof" className="w-full h-full object-cover opacity-50 group-hover/img:opacity-85 group-hover/img:scale-105 transition-all duration-500" />
                                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                                                                                        <ZoomIn size={16} className="text-white" />
                                                                                    </div>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                                
                                                                {(!report?.proof_image_urls || report.proof_image_urls.length === 0) && (
                                                                    <div className="col-span-3 h-20 flex flex-col items-center justify-center bg-white/[0.01] border border-dashed border-white/5 rounded-2xl">
                                                                        <Clock size={16} className="text-white/10 mb-1.5" />
                                                                        <span className="text-[8px] text-white/20 font-black uppercase tracking-wider italic">Evidence Pending</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Inline Quick Action Button */}
                                                        {player && (
                                                            <button
                                                                onClick={() => handleResolve(match.id, player.id, 'resolve')}
                                                                disabled={solving === match.id}
                                                                className="w-full mt-4 py-3.5 bg-white/5 border border-white/10 text-white/80 hover:bg-white hover:text-black rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic transition-all duration-300 active:scale-[0.98] disabled:opacity-20 flex items-center justify-center gap-1.5"
                                                            >
                                                                <CheckCircle2 size={12} /> Award Winner: {player.username}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Card Footer: Centralized Action Board */}
                                        <div className="p-6 bg-white/[0.01] flex flex-col sm:flex-row justify-center items-center gap-3 border-t border-white/5">
                                            {solving === match.id ? (
                                                <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest italic py-2">
                                                    <div className="w-3.5 h-3.5 border-2 border-[#9B5CFF] border-t-transparent rounded-full animate-spin" />
                                                    Processing resolution...
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleResolve(match.id, match.host_id, 'resolve')}
                                                        disabled={solving === match.id}
                                                        className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300"
                                                    >
                                                        Payout Host ({match.host?.username || 'Host'})
                                                    </button>
                                                    
                                                    <button
                                                        onClick={() => handleResolve(match.id, match.opponent_id, 'resolve')}
                                                        disabled={solving === match.id || !match.opponent_id}
                                                        className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 hover:from-emerald-500 hover:to-emerald-600 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-25"
                                                    >
                                                        Payout Opponent ({match.opponent?.username || 'Opponent'})
                                                    </button>

                                                    <button
                                                        onClick={() => handleResolve(match.id, null, 'cancel')}
                                                        disabled={solving === match.id}
                                                        className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-red-500/5 to-red-500/10 hover:from-red-500 hover:to-red-600 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all duration-300"
                                                    >
                                                        Void Match &amp; Refund
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Premium Immersive Media Lightbox Modal */}
            {previewMedia && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col justify-between items-center z-50 p-4 md:p-6 animate-fade-in">
                    
                    {/* Lightbox Header */}
                    <div className="w-full max-w-4xl flex items-center justify-between text-white/50 py-3 select-none">
                        <div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#9B5CFF] block">Evidence Examiner</span>
                            <span className="text-sm font-black uppercase italic text-[#EDEDED] mt-1 block">
                                {previewMedia.username} ({previewMedia.playerRole}) Proof Desk
                            </span>
                        </div>
                        
                        <button 
                            onClick={() => setPreviewMedia(null)}
                            className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-center shadow-lg"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Lightbox Media Container */}
                    <div className="w-full max-w-4xl flex-1 flex items-center justify-center overflow-hidden my-4 relative group">
                        {previewMedia.isVideo ? (
                            <video 
                                src={previewMedia.url} 
                                controls 
                                autoPlay
                                muted
                                className="max-h-[70vh] max-w-full rounded-2xl border border-white/10 shadow-purple-glow object-contain bg-zinc-950" 
                            />
                        ) : (
                            <img 
                                src={previewMedia.url} 
                                alt="High res proof" 
                                className="max-h-[70vh] max-w-full rounded-2xl border border-white/10 shadow-purple-glow object-contain bg-zinc-950" 
                            />
                        )}
                    </div>

                    {/* Lightbox Footer & Unified Quick Action Console */}
                    <div className="w-full max-w-4xl bg-[#12121A] border border-white/10 rounded-[28px] p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
                        <div className="text-center md:text-left">
                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">EXAMINED FILE</p>
                            <p className="text-xs font-bold text-white/80 mt-1">
                                Match ID: {previewMedia.matchId.substring(0, 12)}...
                            </p>
                        </div>

                        {/* Modal Action Board */}
                        <div className="flex flex-wrap justify-center gap-2.5 w-full md:w-auto">
                            {solving === previewMedia.matchId ? (
                                <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest italic py-2">
                                    <div className="w-3.5 h-3.5 border-2 border-[#9B5CFF] border-t-transparent rounded-full animate-spin" />
                                    Processing resolution...
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => handleResolve(previewMedia.matchId, previewMedia.hostId, 'resolve')}
                                        disabled={solving === previewMedia.matchId}
                                        className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300"
                                    >
                                        Payout Host ({previewMedia.hostUsername})
                                    </button>
                                    
                                    <button
                                        onClick={() => handleResolve(previewMedia.matchId, previewMedia.opponentId, 'resolve')}
                                        disabled={solving === previewMedia.matchId || !previewMedia.opponentId}
                                        className="px-5 py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white text-emerald-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-25"
                                    >
                                        Payout Opponent ({previewMedia.opponentUsername})
                                    </button>

                                    <button
                                        onClick={() => handleResolve(previewMedia.matchId, null, 'cancel')}
                                        disabled={solving === previewMedia.matchId}
                                        className="px-5 py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all duration-300"
                                    >
                                        Void &amp; Refund Both
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}