"use client";
import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Trophy, Eye, CheckCircle2, XCircle, Search, Clock, ChevronRight } from "lucide-react";
import { createClient } from "@/supabase/client";
import { resolveDispute } from "@/app/actions/admin";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDashboard() {
    const supabase = createClient();
    const [disputes, setDisputes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [solving, setSolving] = useState<string | null>(null);

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = "/auth/login";
                return;
            }

            const { data: profile } = await supabase
                .from("profiles")
                .select("is_admin")
                .eq("id", user.id)
                .single();

            if (!profile?.is_admin) {
                window.location.href = "/lobby";
                return;
            }

            setIsAdmin(true);

            // Fetch Disputed Challenges with reports
            const { data: disputedMatches } = await supabase
                .from("challenges")
                .select(`
                    *,
                    host:profiles!challenges_creator_id_fkey(id, username),
                    opponent:profiles!challenges_opponent_id_fkey(id, username),
                    reports:match_reports(*)
                `)
                .eq("status", "disputed")
                .order('created_at', { ascending: false });

            setDisputes(disputedMatches || []);
            setLoading(false);
        };

        checkAdminAndFetch();
    }, [supabase]);

    const handleResolve = async (challengeId: string, winnerId: string) => {
        setSolving(challengeId);
        try {
            const result = await resolveDispute(challengeId, winnerId);
            if (result.success) {
                toast.success("Match Resolved Successfully.");
                setDisputes(prev => prev.filter(d => d.id !== challengeId));
            } else {
                toast.error(result.error);
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setSolving(null);
        }
    };

    if (!isAdmin || loading) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase">
                <Shield size={64} className="mb-4 animate-pulse text-compete-purple" />
                Validating Admin Credentials...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-compete-purple p-8">
            <header className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-2 text-compete-purple mb-2">
                        <Shield size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Command Center v1.0</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Dispute <span className="text-compete-purple">Resolution</span>
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase text-white/30">Active Disputes</span>
                        <span className="text-xl font-black italic text-compete-purple">{disputes.length}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto space-y-8">
                {disputes.length === 0 ? (
                    <div className="h-[400px] bg-neutral-900/30 border border-white/5 rounded-[40px] flex flex-col items-center justify-center text-center p-12 backdrop-blur-3xl">
                        <CheckCircle2 size={64} className="text-green-500/20 mb-6" />
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">Zero Conflict Detected</h3>
                        <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-2">All match outcomes are currently in consensus.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {disputes.map((match) => (
                            <div key={match.id} className="bg-neutral-900/50 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-2xl transition-all hover:border-white/20 group">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-compete-purple flex items-center justify-center text-lg italic font-black">
                                                {match.game_name[0]}
                                            </div>
                                            <div>
                                                <h3 className="font-black italic uppercase text-lg leading-none">{match.game_name}</h3>
                                                <p className="text-[8px] text-white/30 uppercase font-black tracking-widest mt-1">{match.platform} • ID: {match.id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div className="text-2xl font-black italic text-compete-purple">${match.prize_pool} POT</div>
                                    </div>
                                    <Link href={`/match/${match.id}`} className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white flex items-center gap-2 group-hover:translate-x-1 transition-all">
                                        View Match Room <ChevronRight size={14} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-2 p-8 gap-8">
                                    {[match.host, match.opponent].map((player, idx) => {
                                        const report = match.reports.find((r: any) => r.reporter_id === player.id);
                                        return (
                                            <div key={player.id} className="space-y-6">
                                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                                    <div>
                                                        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] mb-1">{idx === 0 ? "Host" : "Opponent"}</p>
                                                        <p className="text-xl font-black italic uppercase tracking-tighter">{player.username}</p>
                                                    </div>
                                                    <div className={`px-4 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${report?.reported_outcome === 'win' ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>
                                                        CLAIMED {report?.reported_outcome}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    {(report?.proof_image_urls || []).map((url: string, i: number) => (
                                                        <a key={i} href={url} target="_blank" className="aspect-video bg-black rounded-xl border border-white/10 overflow-hidden group/img relative">
                                                            <img src={url} alt="proof" className="w-full h-full object-cover grayscale group-hover/img:grayscale-0 transition-all opacity-40 group-hover/img:opacity-100" />
                                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/40">
                                                                <Eye size={20} />
                                                            </div>
                                                        </a>
                                                    ))}
                                                    {(!report?.proof_image_urls || report.proof_image_urls.length === 0) && (
                                                        <div className="col-span-3 h-24 flex items-center justify-center bg-red-500/5 border border-dashed border-red-500/20 rounded-xl text-[10px] text-red-500/40 font-black uppercase tracking-widest italic">
                                                            No Evidence Uploaded
                                                        </div>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => handleResolve(match.id, player.id)}
                                                    disabled={solving === match.id}
                                                    className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] italic hover:bg-compete-purple hover:text-white transition-all active:scale-[0.98] disabled:opacity-20 shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
                                                >
                                                    Declare {player.username} the Winner
                                                </button>
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
