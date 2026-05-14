"use client";
import { useState, useEffect } from "react";
import { Shield, Eye, CheckCircle2, ChevronRight, Clock } from "lucide-react";
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

    const fetchMatches = async () => {
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
        setLoading(false);
    };

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

            // Setup Realtime Subscription
            const subscription = supabase
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

            return () => {
                subscription.unsubscribe();
            };
        };

        checkRoleAndFetch();
    }, [supabase, filter]);

    const handleResolve = async (challengeId: string, winnerId: string | null, action: 'resolve' | 'cancel') => {
        setSolving(challengeId);
        try {
            const result = await resolveMatchAsModerator(challengeId, winnerId, action);
            if (result.success) {
                toast.success(action === 'resolve' ? "Winner declared successfully." : "Match cancelled and refunded.");
                setMatches(prev => prev.filter(m => m.id !== challengeId));
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
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase">
                <Shield size={64} className="mb-4 animate-pulse text-compete-purple" />
                Accessing Command Core...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-compete-purple p-8">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-compete-purple mb-2">
                        <Shield size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Moderator Dashboard</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Match <span className="text-compete-purple">Verifications</span>
                    </h1>
                </div>

                <div className="flex gap-4">
                    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                        {(['all', 'pending_review', 'disputed'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase text-white/30">Matches Awaiting</span>
                        <span className="text-xl font-black italic text-compete-purple">{matches.length}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">
                {matches.length === 0 ? (
                    <div className="h-[400px] bg-neutral-900/30 border border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12 backdrop-blur-3xl">
                        <CheckCircle2 size={64} className="text-green-500/20 mb-6" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">System Clear</h3>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-2">All submissions have been verified.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {matches.map((match) => (
                            <div key={match.id} className="bg-neutral-900/50 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl transition-all hover:border-white/20 group">
                                {/* Header */}
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-white/[0.02] to-transparent">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-compete-purple flex items-center justify-center text-xl italic font-black shadow-[0_0_20px_rgba(155,92,255,0.3)]">
                                                {match.game_name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-black italic uppercase text-xl leading-none">{match.game_name}</h3>
                                                    {match.status === 'disputed' && (
                                                        <span className="bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">DISPUTE</span>
                                                    )}
                                                </div>
                                                <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">{match.platform} • POT: ${match.prize_pool} • ID: {match.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center">
                                        <Link href={`/match/${match.id}`} target="_blank" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all">
                                            Match Room <ChevronRight size={14} />
                                        </Link>
                                        <button
                                            onClick={() => handleResolve(match.id, null, 'cancel')}
                                            disabled={solving === match.id}
                                            className="px-6 py-3 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Cancel &amp; Refund
                                        </button>
                                    </div>
                                </div>

                                {/* Proof Sections */}
                                <div className="grid grid-cols-2 divide-x divide-white/5">
                                    {[match.host, match.opponent].map((player, idx) => {
                                        const report = (match.reports || []).find((r: any) => r.reporter_id === player?.id);
                                        return (
                                            <div key={player?.id || idx} className="p-8 space-y-6">
                                                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{idx === 0 ? "Host" : "Opponent"}</p>
                                                        <p className="text-2xl font-black italic uppercase tracking-tighter">{player?.username || "Awaiting..."}</p>
                                                    </div>
                                                    <div className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${report?.reported_outcome === 'win' ? 'bg-green-500/10 border-green-500/50 text-green-500' : report?.reported_outcome === 'loss' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                                        {report ? `CLAIMED ${report.reported_outcome}` : "NO REPORT"}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    {(report?.proof_image_urls || []).map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" className="aspect-video bg-black rounded-xl border border-white/10 overflow-hidden group/img relative">
                                                            <img src={url} alt="proof" className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                                                                <Eye size={20} />
                                                            </div>
                                                        </a>
                                                    ))}
                                                    {(!report?.proof_image_urls || report.proof_image_urls.length === 0) && (
                                                        <div className="col-span-3 h-24 flex flex-col items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                                                            <Clock size={20} className="text-white/10 mb-2" />
                                                            <span className="text-[9px] text-white/20 font-black uppercase tracking-widest italic">Evidence Pending</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {player && (
                                                    <button
                                                        onClick={() => handleResolve(match.id, player.id, 'resolve')}
                                                        disabled={solving === match.id}
                                                        className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] italic hover:bg-compete-purple hover:text-white transition-all active:scale-[0.98] disabled:opacity-20 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                                                    >
                                                        Mark {player.username} as Winner
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}