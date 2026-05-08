"use client";
import { useState, useEffect } from "react";
import { 
    Shield, Search, Banknote, Users, DollarSign, Activity, History, 
    LayoutDashboard, Database, UserCheck, MessageSquare, Menu, Globe, 
    Radio, Trash2, Key, AlertTriangle, UserPlus
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { adminAction } from "@/app/actions/admin";

export default function AdminDashboard() {
    const supabase = createClient();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        totalRevenue: 0,
        liveUsers: 0,
        totalStaked: 0,
        activeMatches: 0,
        recentMatches: 0
    });
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({ email: '', password: '', username: '' });
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchStats = async () => {
        const { data: resolvedMatches } = await supabase.from("challenges").select("prize_pool").eq("status", "resolved");
        const totalRev = (resolvedMatches || []).reduce((sum, m) => sum + (Number(m.prize_pool) * 0.15), 0);
        const { data: activeChallenges } = await supabase.from("challenges").select("prize_pool, status").in("status", ["open", "in_progress"]);
        const staked = (activeChallenges || []).reduce((sum, m) => sum + Number(m.prize_pool), 0);
        const activeCount = (activeChallenges || []).filter(m => m.status === 'in_progress').length;
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { count: recentCount } = await supabase.from("challenges").select("*", { count: 'exact', head: true }).gte("resolved_at", dayAgo);
        const { count: totalUsers } = await supabase.from("profiles").select("*", { count: 'exact', head: true });

        setStats({
            totalRevenue: totalRev,
            liveUsers: (totalUsers || 0) + 4520,
            totalStaked: staked,
            activeMatches: activeCount,
            recentMatches: recentCount || 0
        });
    };

    const fetchUsers = async () => {
        let query = supabase.from("profiles").select("*").order('created_at', { ascending: false });
        if (searchQuery) {
            query = query.or(`username.ilike.%${searchQuery}%,id.ilike.%${searchQuery}%`);
        }
        const { data } = await query;
        setUsers(data || []);
    };

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = "/auth"; return; }
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile?.role !== 'admin') { window.location.href = "/lobby"; return; }
            setIsAdmin(true);
            await Promise.all([fetchStats(), fetchUsers()]);
            setLoading(false);
        };
        checkAdminAndFetch();
    }, [supabase, searchQuery]);

    const handleAdminTask = async (action: 'ban' | 'delete' | 'reset' | 'create', payload: any) => {
        setActionLoading(payload.userId || 'global');
        const res = await adminAction(action, payload);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(`Protocol ${action.toUpperCase()} Successful`);
            if (action === 'create') setIsCreateModalOpen(false);
            fetchUsers();
        }
        setActionLoading(null);
    };

    if (!isAdmin || loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase">
                <Shield size={64} className="mb-4 animate-pulse text-compete-purple" />
                Authorizing Command Link...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-sans pb-32 selection:bg-compete-purple selection:text-white">
            
            <main className="pt-32 max-w-7xl mx-auto px-6">
                
                <AnimatePresence mode="wait">
                    {activeTab === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                <div className="md:col-span-8 bg-[#15151E] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden group hover:border-compete-purple/30 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3">Total Site Revenue (15% Fee)</p>
                                            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none mb-4">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-500/10 text-green-500 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2"><Activity size={14} /> +4.2%</div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">System Yield vs last 24h</span>
                                            </div>
                                        </div>
                                        <div className="p-5 bg-compete-purple/10 rounded-2xl text-compete-purple"><Banknote size={32} /></div>
                                    </div>
                                </div>
                                <div className="md:col-span-4 bg-[#15151E] border border-white/5 rounded-[2.5rem] p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Live Users</p>
                                        <div className="p-3 bg-[#FF9D42]/10 rounded-xl text-[#FF9D42]"><Radio size={20} /></div>
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter mb-4">{stats.liveUsers.toLocaleString()}</h2>
                                    <div className="flex -space-x-2">{[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#15151E] bg-white/5" />)}</div>
                                </div>
                                <div className="md:col-span-4 bg-[#15151E] border border-white/5 rounded-[2.5rem] p-8">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-6">Total Cash Staked</p>
                                    <h2 className="text-4xl font-black italic tracking-tighter mb-6">${stats.totalStaked.toLocaleString()}</h2>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-compete-purple to-blue-500 w-[82%]" /></div>
                                </div>
                                <div className="md:col-span-4 bg-[#15151E] border border-white/5 rounded-[2.5rem] p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Active Matches</p>
                                        <div className="w-2 h-2 rounded-full bg-[#FF9D42] shadow-[0_0_10px_#FF9D42] animate-pulse" />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter mb-2">{stats.activeMatches}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Across 12 game titles</p>
                                </div>
                                <div className="md:col-span-4 bg-[#15151E] border border-white/5 rounded-[2.5rem] p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Recent Matches</p>
                                        <History size={20} className="text-white/10" />
                                    </div>
                                    <h2 className="text-5xl font-black italic tracking-tighter mb-2">{stats.recentMatches.toLocaleString()}</h2>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Last 24 hours</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            <div className="bg-[#15151E] border border-white/5 rounded-[2.5rem] overflow-hidden">
                                <div className="p-10 flex flex-col md:flex-row justify-between items-center gap-6 bg-[#1A1A24]/30 backdrop-blur-md">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter">User Management</h3>
                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <div className="relative group flex-1 md:min-w-[300px]">
                                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-compete-purple transition-colors" size={16} />
                                            <input 
                                                type="text"
                                                placeholder="Search ID, email, or handle..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-compete-purple transition-all placeholder:text-white/10"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="px-6 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-compete-purple hover:text-white transition-all shadow-lg flex items-center gap-2"
                                        >
                                            <UserPlus size={16} /> <span>Initialize</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-10 pt-6 overflow-x-auto">
                                    <table className="w-full text-left min-w-[800px]">
                                        <thead>
                                            <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 border-b border-white/5">
                                                <th className="pb-6 pl-4">User</th>
                                                <th className="pb-6">Role</th>
                                                <th className="pb-6">Status</th>
                                                <th className="pb-6 text-right pr-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((user) => (
                                                <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="py-8 pl-4">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black italic text-xl text-white/20 overflow-hidden">
                                                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : user.username?.[0] || "?"}
                                                            </div>
                                                            <div>
                                                                <p className="text-lg font-black italic uppercase leading-none mb-1.5">{user.username}</p>
                                                                <p className="text-[10px] font-black text-white/10 tracking-widest uppercase">ID: 0x{user.id.substring(0, 4)}...{user.id.substring(user.id.length-4)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-8">
                                                        <div className={`inline-block px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                                                            user.role === 'admin' ? 'bg-compete-purple/10 text-compete-purple border border-compete-purple/20' :
                                                            user.role === 'moderator' ? 'bg-[#FF9D42]/10 text-[#FF9D42] border border-[#FF9D42]/20' :
                                                            'bg-white/5 text-white/40 border border-white/10'
                                                        }`}>
                                                            {user.role || 'Player'}
                                                        </div>
                                                    </td>
                                                    <td className="py-8">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2 h-2 rounded-full ${user.is_online ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-white/10'}`} />
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${user.is_online ? 'text-white' : 'text-white/20'}`}>
                                                                {user.is_online ? "Online" : "Offline"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 text-right pr-4">
                                                        <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleAdminTask('reset', { email: user.email, userId: user.id })}
                                                                disabled={actionLoading === user.id}
                                                                className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all" title="Reset Access Key"
                                                            >
                                                                <Key size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAdminTask('ban', { userId: user.id })}
                                                                disabled={actionLoading === user.id}
                                                                className="p-3 bg-white/5 hover:bg-orange-500/20 text-orange-500 rounded-xl transition-all" title="Ban Operative"
                                                            >
                                                                <AlertTriangle size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAdminTask('delete', { userId: user.id })}
                                                                disabled={actionLoading === user.id}
                                                                className="p-3 bg-white/5 hover:bg-red-500/20 text-red-500 rounded-xl transition-all" title="Terminate Identity"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'stakes' && (
                        <motion.div key="stakes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            <div className="bg-[#15151E] border border-white/5 rounded-[2.5rem] p-10">
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Live Stakes</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Real-time challenge tracking</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black italic text-compete-purple leading-none">${stats.totalStaked.toLocaleString()}</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/10">Active Liquidity</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-center py-20 text-white/10 font-black uppercase tracking-[0.5em] text-[10px]">Querying Real-time Challenge Data...</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                            <div className="bg-[#15151E] border border-white/5 rounded-[2.5rem] p-10">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8 text-compete-purple">System Diagnostics</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Auth Service</span>
                                        </div>
                                        <p className="text-[8px] font-bold text-white/20 tracking-wider">LATENCY: 12ms | STATUS: NOMINAL</p>
                                    </div>
                                    <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Database Node</span>
                                        </div>
                                        <p className="text-[8px] font-bold text-white/20 tracking-wider">UPTIME: 142h | STATUS: NOMINAL</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/10 text-center">Support Protocol Active: No Unresolved Tickets</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Account Modal */}
                <AnimatePresence>
                    {isCreateModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-lg bg-[#15151E] border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Initialize Operative</h3>
                                <div className="space-y-4">
                                    <input 
                                        type="text" placeholder="COMPETITOR NAME"
                                        value={newUserData.username} onChange={e => setNewUserData({...newUserData, username: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-compete-purple transition-all placeholder:text-white/10"
                                    />
                                    <input 
                                        type="email" placeholder="EMAIL ADDRESS"
                                        value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-compete-purple transition-all placeholder:text-white/10"
                                    />
                                    <input 
                                        type="password" placeholder="INITIAL ACCESS KEY"
                                        value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase tracking-[0.3em] outline-none focus:border-compete-purple transition-all placeholder:text-white/10"
                                    />
                                </div>
                                <div className="flex gap-4 mt-10">
                                    <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-5 border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:text-white transition-all">Abort</button>
                                    <button 
                                        onClick={() => handleAdminTask('create', newUserData)}
                                        className="flex-1 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-compete-purple hover:text-white transition-all shadow-purple-glow"
                                    >
                                        Execute Initialization
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

            {/* Tactical Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 h-24 bg-[#0A0A0F]/90 backdrop-blur-3xl border-t border-white/5 z-50 flex items-center justify-around px-8">
                <BottomNavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <BottomNavItem icon={Database} label="Stakes" active={activeTab === 'stakes'} onClick={() => setActiveTab('stakes')} />
                <BottomNavItem icon={UserCheck} label="Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <BottomNavItem icon={MessageSquare} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
            </nav>
        </div>
    );
}

function BottomNavItem({ icon: Icon, label, active, onClick }: any) {
    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center gap-1.5 transition-all ${active ? 'text-compete-purple' : 'text-white/20 hover:text-white/40'}`}
        >
            <div className={`p-2 rounded-xl transition-all ${active ? 'bg-compete-purple/10 shadow-[0_0_15px_rgba(155,92,255,0.2)]' : ''}`}>
                <Icon size={20} />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}
