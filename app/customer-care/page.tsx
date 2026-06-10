"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import {
    Headphones, Users, Search, Activity, Clock,
    MessageSquare, ChevronRight, LogOut, Shield,
    Gamepad2, DollarSign, X, ExternalLink, RefreshCw
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_COLORS: Record<string, string> = {
    open: "text-green-400 bg-green-400/10 border-green-400/20",
    in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    pending_review: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    disputed: "text-red-400 bg-red-400/10 border-red-400/20",
    resolved: "text-white/40 bg-white/5 border-white/10",
    cancelled: "text-white/20 bg-white/5 border-white/5",
};

const formatKES = (n: number) =>
    new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);

const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

export default function CustomerCareDashboard() {
    const supabase = createClient();
    useHeartbeat();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [agentName, setAgentName] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Data
    const [users, setUsers] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, onlineToday: 0, activeMatches: 0, disputedMatches: 0 });

    // UI state
    const [userSearch, setUserSearch] = useState("");
    const [matchFilter, setMatchFilter] = useState<"all" | "disputed" | "pending_review" | "in_progress">("all");
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [userMatches, setUserMatches] = useState<any[]>([]);
    const [loadingUserDetail, setLoadingUserDetail] = useState(false);

    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const [usersRes, matchesRes] = await Promise.all([
                supabase
                    .from("profiles")
                    .select("id, username, avatar_url, balance, role, region, last_seen_at, created_at")
                    .order("last_seen_at", { ascending: false }),
                supabase
                    .from("challenges")
                    .select(`
                        id, status, game_name, platform, entry_fee, prize_pool, created_at, joined_at, resolved_at,
                        host:profiles!host_id(id, username),
                        opponent:profiles!opponent_id(id, username)
                    `)
                    .order("created_at", { ascending: false })
                    .limit(100),
            ]);

            const allUsers: any[] = usersRes.data || [];
            const allMatches: any[] = matchesRes.data || [];

            setUsers(allUsers);
            setMatches(allMatches);

            const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
            setStats({
                totalUsers: allUsers.filter(u => u.role === "client" || !u.role).length,
                onlineToday: allUsers.filter(u => u.last_seen_at > oneDayAgo).length,
                activeMatches: allMatches.filter(m => m.status === "in_progress").length,
                disputedMatches: allMatches.filter(m => m.status === "disputed" || m.status === "pending_review").length,
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [supabase]);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = "/auth"; return; }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role, username")
                .eq("id", user.id)
                .single();

            const allowedRoles = ["customer_care", "moderator", "admin"];
            if (!allowedRoles.includes(profile?.role)) {
                window.location.href = "/lobby";
                return;
            }

            setAgentName(profile?.username || "AGENT");
            setIsAuthorized(true);
            await fetchData();

            if (channelRef.current) {
                await supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }

            channelRef.current = supabase
                .channel("customer-care-feed")
                .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, fetchData)
                .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, fetchData)
                .subscribe();
        };

        init();
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [fetchData, supabase]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
    };

    const openUserDetail = async (user: any) => {
        setSelectedUser(user);
        setLoadingUserDetail(true);
        const { data } = await supabase
            .from("challenges")
            .select(`
                id, status, game_name, platform, entry_fee, prize_pool, created_at, winner_id,
                host:profiles!host_id(id, username),
                opponent:profiles!opponent_id(id, username)
            `)
            .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`)
            .order("created_at", { ascending: false })
            .limit(20);
        setUserMatches(data || []);
        setLoadingUserDetail(false);
    };

    const filteredUsers = users
        .filter(u => u.role === "client" || !u.role)
        .filter(u =>
            !userSearch ||
            u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
            u.region?.toLowerCase().includes(userSearch.toLowerCase())
        );

    const filteredMatches = matches.filter(m =>
        matchFilter === "all" ? true : m.status === matchFilter
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Headphones size={28} className="text-blue-400 animate-pulse" />
                    <p className="text-[9px] font-black tracking-[0.4em] text-white/40 uppercase">Loading Support Console...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-mono">
            {/* Header */}
            <div className="border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Headphones size={14} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[7px] font-black tracking-[0.4em] text-blue-400/60 uppercase">Support Console</p>
                            <h1 className="text-xs font-black tracking-widest uppercase leading-none">{agentName}</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all disabled:opacity-40"
                        >
                            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={async () => { await supabase.auth.signOut(); window.location.href = "/auth"; }}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/20 hover:text-red-400 transition-all"
                        >
                            <LogOut size={12} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: "Total Players", value: stats.totalUsers, icon: Users, color: "text-white" },
                        { label: "Active Today", value: stats.onlineToday, icon: Activity, color: "text-green-400" },
                        { label: "Live Matches", value: stats.activeMatches, icon: Gamepad2, color: "text-blue-400" },
                        { label: "Need Review", value: stats.disputedMatches, icon: MessageSquare, color: "text-yellow-400" },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[8px] font-black tracking-widest text-white/30 uppercase">{label}</span>
                                <Icon size={12} className={color} />
                            </div>
                            <p className={`text-2xl font-black ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ── Left: Player Lookup ────────────────────────────────── */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={13} className="text-white/40" />
                                <span className="text-[9px] font-black tracking-widest uppercase">Player Lookup</span>
                            </div>
                            <span className="text-[8px] text-white/20 font-black">{filteredUsers.length} players</span>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-white/[0.04]">
                            <div className="relative">
                                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="Search by username or region..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-8 pr-3 text-[10px] outline-none focus:border-blue-500/40 placeholder:text-white/15 text-white transition-all"
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="overflow-y-auto max-h-[460px] custom-scrollbar divide-y divide-white/[0.04]">
                            {filteredUsers.length === 0 ? (
                                <div className="py-12 text-center text-white/20">
                                    <Users size={20} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-[8px] font-black uppercase tracking-widest">No players found</p>
                                </div>
                            ) : filteredUsers.map(user => {
                                const isOnline = user.last_seen_at &&
                                    Date.now() - new Date(user.last_seen_at).getTime() < 5 * 60 * 1000;
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => openUserDetail(user)}
                                        className="w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-3 group"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="relative shrink-0">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 overflow-hidden">
                                                    {user.avatar_url
                                                        ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                        : user.username?.[0]?.toUpperCase()
                                                    }
                                                </div>
                                                <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0A0A0F] ${isOnline ? "bg-green-500" : "bg-white/10"}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black truncate">{user.username}</p>
                                                <p className="text-[8px] text-white/30 font-black uppercase tracking-wider">
                                                    {user.region || "Unknown"} · {timeAgo(user.last_seen_at || user.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[9px] font-black text-white/40">{formatKES(user.balance || 0)}</span>
                                            <ChevronRight size={10} className="text-white/20 group-hover:text-white/60 transition-colors" />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Right: Match Monitor ───────────────────────────────── */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-white/[0.06]">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Gamepad2 size={13} className="text-white/40" />
                                    <span className="text-[9px] font-black tracking-widest uppercase">Match Monitor</span>
                                </div>
                                <span className="text-[8px] text-white/20 font-black">{filteredMatches.length} matches</span>
                            </div>
                            {/* Filter Tabs */}
                            <div className="flex gap-1">
                                {(["all", "in_progress", "pending_review", "disputed"] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setMatchFilter(f)}
                                        className={`px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-wider transition-all ${matchFilter === f
                                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                            : "bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/60"
                                            }`}
                                    >
                                        {f === "all" ? "All" : f === "in_progress" ? "Live" : f === "pending_review" ? "Review" : "Disputed"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="overflow-y-auto max-h-[460px] custom-scrollbar divide-y divide-white/[0.04]">
                            {filteredMatches.length === 0 ? (
                                <div className="py-12 text-center text-white/20">
                                    <Gamepad2 size={20} className="mx-auto mb-2 opacity-30" />
                                    <p className="text-[8px] font-black uppercase tracking-widest">No matches found</p>
                                </div>
                            ) : filteredMatches.map(match => (
                                <div key={match.id} className="px-4 py-3 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_COLORS[match.status] || "text-white/40"}`}>
                                                    {match.status.replace("_", " ")}
                                                </span>
                                                <span className="text-[7px] text-white/20 font-black">{timeAgo(match.created_at)}</span>
                                            </div>
                                            <p className="text-[9px] font-black truncate mb-0.5">
                                                {match.host?.username ?? "—"} <span className="text-white/30">vs</span> {match.opponent?.username ?? "AWAITING"}
                                            </p>
                                            <p className="text-[8px] text-white/30 font-black uppercase tracking-wider truncate">
                                                {match.game_name?.split(" [ID:")[0]} · {match.platform}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[9px] font-black text-white/60">{formatKES(match.prize_pool)}</p>
                                            <Link
                                                href={`/match/${match.id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-1 text-[7px] text-blue-400/60 hover:text-blue-400 transition-colors mt-1 font-black uppercase"
                                            >
                                                View <ExternalLink size={8} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── User Detail Modal ──────────────────────────────────────────── */}
            <AnimatePresence>
                {selectedUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setSelectedUser(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative z-10 w-full max-w-lg bg-[#0F0F16] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-black text-white/40 overflow-hidden">
                                        {selectedUser.avatar_url
                                            ? <img src={selectedUser.avatar_url} alt="" className="w-full h-full object-cover" />
                                            : selectedUser.username?.[0]?.toUpperCase()
                                        }
                                    </div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase tracking-wide">{selectedUser.username}</h3>
                                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                            {selectedUser.region || "Unknown"} · Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
                                <div className="p-4 text-center">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-1">Vault Balance</p>
                                    <p className="text-sm font-black text-green-400">{formatKES(selectedUser.balance || 0)}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-1">Total Matches</p>
                                    <p className="text-sm font-black">{userMatches.length}</p>
                                </div>
                                <div className="p-4 text-center">
                                    <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mb-1">Last Active</p>
                                    <p className="text-[10px] font-black">{timeAgo(selectedUser.last_seen_at || selectedUser.created_at)}</p>
                                </div>
                            </div>

                            {/* Match History */}
                            <div className="p-4">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-3">Recent Match History</p>
                                {loadingUserDetail ? (
                                    <div className="py-8 flex justify-center">
                                        <Activity size={16} className="text-white/20 animate-pulse" />
                                    </div>
                                ) : userMatches.length === 0 ? (
                                    <div className="py-6 text-center text-white/20">
                                        <Gamepad2 size={16} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-[8px] font-black uppercase tracking-widest">No matches yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                                        {userMatches.map(m => {
                                            const isWinner = m.winner_id === selectedUser.id;
                                            const isHost = m.host?.id === selectedUser.id;
                                            const opponent = isHost ? m.opponent : m.host;
                                            return (
                                                <div key={m.id} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl px-3 py-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[m.status] || ""}`}>
                                                            {m.status === "resolved"
                                                                ? isWinner ? "Won" : "Lost"
                                                                : m.status.replace("_", " ")}
                                                        </span>
                                                        <span className="text-[9px] font-black truncate text-white/60">
                                                            vs {opponent?.username ?? "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-[8px] font-black text-white/30">{formatKES(m.prize_pool)}</span>
                                                        <Link href={`/match/${m.id}`} target="_blank" className="text-blue-400/40 hover:text-blue-400 transition-colors">
                                                            <ExternalLink size={9} />
                                                        </Link>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
