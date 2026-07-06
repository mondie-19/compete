"use client";
import { useState, useEffect } from "react";
import { 
    Shield, Banknote, Users, Activity, History, 
    LogOut, AlertTriangle, Zap, Target
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import BlackHoleLoader from "@/components/BlackHoleLoader";
import { toast } from "sonner";
import Link from "next/link";
import { useHeartbeat } from "@/lib/useHeartbeat";

import { StatTile } from "@/components/admin/StatTile";
import { SlidePanel } from "@/components/admin/SlidePanel";
import { RevenueDetail } from "@/components/admin/RevenueDetail";
import { LiveUsersDetail } from "@/components/admin/LiveUsersDetail";
import { StakedDetail } from "@/components/admin/StakedDetail";
import { ActiveMatchesDetail } from "@/components/admin/ActiveMatchesDetail";
import { UserManagementDetail } from "@/components/admin/UserManagementDetail";

export default function AdminDashboard() {
    const supabase = createClient();
    useHeartbeat(); // Track admin session too
    
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // Panel State
    const [activePanel, setActivePanel] = useState<'revenue' | 'users' | 'staked' | 'matches' | 'management' | null>(null);

    // Data State
    const [regionalStats, setRegionalStats] = useState<any[]>([]);
    const [revenueTimeline, setRevenueTimeline] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [allMatches, setAllMatches] = useState<any[]>([]);

    // Aggregate Stats (Derived from 'World' record in regionalStats)
    const worldStat = regionalStats.find(r => r.region === 'World');
    const totalRevenue = Number(worldStat?.total_revenue || 0);
    const liveUsers = Number(worldStat?.active_users || 0);
    const totalStaked = Number(worldStat?.total_staked || 0);
    const activeMatchesCount = Number(worldStat?.active_matches || 0);
    const recentMatchesCount = Number(worldStat?.recent_matches || 0);

    const fetchData = async () => {
        try {
            // Fetch Regional Stats View
            const { data: statsData } = await supabase.from('admin_regional_stats').select('*');
            if (statsData) setRegionalStats(statsData);

            // Fetch Revenue Timeline View
            const { data: timelineData } = await supabase.from('admin_revenue_timeline').select('*');
            if (timelineData) setRevenueTimeline(timelineData);

            // Fetch Users
            const { data: usersData } = await supabase.from('profiles').select('*').order('last_seen_at', { ascending: false });
            if (usersData) setAllUsers(usersData);

            // Fetch Active Matches
            const { data: matchesData } = await supabase
                .from('challenges')
                .select(`
                    *,
                    host:profiles!host_id(username, region),
                    opponent:profiles!opponent_id(username, region)
                `)
                .order('created_at', { ascending: false });
            if (matchesData) setAllMatches(matchesData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    useEffect(() => {
        const checkAdminAndSetup = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = "/auth"; return; }
            
            const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
            if (profile?.role !== 'admin') { window.location.href = "/lobby"; return; }
            
            setIsAdmin(true);
            await fetchData();
            setLoading(false);

            // Setup Realtime Subscription for Live Updates
            const channel = supabase.channel(`admin-dashboard-${Date.now()}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
                .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => fetchData())
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };
        checkAdminAndSetup();
    }, [supabase]);

    if (!isAdmin || loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
                <BlackHoleLoader label="Authorizing Command Link..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-mono pb-32 selection:bg-compete-purple selection:text-white relative overflow-x-hidden">
            
            <main className="pt-24 max-w-7xl mx-auto px-6 space-y-4">
                
                {/* System Pulse Indicator */}
                <div className="flex items-center justify-between bg-transparent border border-white/10 p-3 rounded-none">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping absolute" />
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white">System Pulse: Nominal</p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-white/20 mt-0.5">Encrypted Real-time Uplink Active</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/40">Last Sync</p>
                        <p className="text-[9px] font-bold text-white/60">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
                
                {/* Brutalist Mosaic Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                    
                    {/* 1. Total Site Revenue (6/12 width) */}
                    <div className="lg:col-span-6 flex flex-col justify-between bg-transparent border border-white/10 p-4 rounded-none hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">TOTAL REVENUE (15%)</h3>
                                <p className="text-2xl font-black italic text-compete-purple tracking-tighter">
                                    KSh {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </p>
                                <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">System Yield Across All Sectors</p>
                            </div>
                            <button 
                                onClick={() => setActivePanel('revenue')} 
                                className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
                            >
                                EXPAND &rarr;
                            </button>
                        </div>
                        <div className="border-t border-white/5 pt-3">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">RECENT REVENUE UPLINKS</p>
                            <div className="h-[76px] overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                                {revenueTimeline.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-[9px] border-b border-white/5 pb-1">
                                        <span className="text-white/60 font-bold uppercase">{new Date(item.date).toLocaleDateString()}</span>
                                        <span className="text-compete-purple font-black">KSh {Number(item.daily_revenue).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. Live Connections (6/12 width) */}
                    <div className="lg:col-span-6 flex flex-col justify-between bg-transparent border border-white/10 p-4 rounded-none hover:border-white/20 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">LIVE CONNECTIONS</h3>
                                <p className="text-2xl font-black italic text-green-400 tracking-tighter">
                                    {liveUsers.toLocaleString()}
                                </p>
                                <p className="text-[8px] text-white/20 uppercase tracking-widest mt-1">Active Global Terminals</p>
                            </div>
                            <button 
                                onClick={() => setActivePanel('users')} 
                                className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
                            >
                                EXPAND &rarr;
                            </button>
                        </div>
                        <div className="border-t border-white/5 pt-3">
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-2">ACTIVE SECTORS</p>
                            <div className="grid grid-cols-4 gap-2">
                                {regionalStats.filter(s => s.region !== 'World').slice(0, 4).map((stat) => (
                                    <div key={stat.region} className="border border-white/10 p-1.5 text-center bg-transparent">
                                        <p className="text-[7px] font-black uppercase text-white/40 tracking-wider leading-none mb-1">{stat.region}</p>
                                        <p className="text-[10px] font-black text-green-400 leading-none">{stat.active_users || 0}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 3. Value Locked / Staked Weights (4/12 width) */}
                    <div className="lg:col-span-4 flex flex-col justify-between bg-transparent border border-white/10 p-4 rounded-none hover:border-white/20 transition-all group">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">TOTAL LOCKED VALUE</h3>
                                    <p className="text-xl font-black italic text-yellow-500 tracking-tighter">
                                        KSh {totalStaked.toLocaleString()}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setActivePanel('staked')} 
                                    className="px-2 py-0.5 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
                                >
                                    EXPAND
                                </button>
                            </div>
                            <div className="border-t border-white/5 pt-3 space-y-2">
                                <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1">SECTOR WEIGHTS</p>
                                <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                                    {regionalStats.filter(s => s.region !== 'World').slice(0, 3).map((stat) => {
                                        const pct = totalStaked > 0 ? (stat.total_staked / totalStaked) * 100 : 0;
                                        return (
                                            <div key={stat.region} className="space-y-1">
                                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest leading-none">
                                                    <span className="text-white/60">{stat.region}</span>
                                                    <span className="text-yellow-500">{pct.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-0.5 bg-white/5 rounded-none overflow-hidden">
                                                    <div className="h-full bg-yellow-500" style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 4. Active Deployments (8/12 width) */}
                    <div className="lg:col-span-8 flex flex-col bg-transparent border border-white/10 p-4 rounded-none hover:border-white/20 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">ACTIVE SYSTEM DEPLOYMENTS</h3>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">REAL-TIME CONFLICT CHANNELS</p>
                            </div>
                            <button 
                                onClick={() => setActivePanel('matches')} 
                                className="px-2.5 py-1 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
                            >
                                EXPAND FEED &rarr;
                            </button>
                        </div>
                        <div className="border-t border-white/5 pt-3 flex-1">
                            <ActiveMatchesDetail matches={allMatches.slice(0, 2)} />
                        </div>
                    </div>

                    {/* 5. User Command Management Directory (12/12 full width) */}
                    <div className="lg:col-span-12 flex flex-col bg-transparent border border-white/10 p-4 rounded-none hover:border-white/20 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">PERSONNEL DIRECTORY & ACCESS CONTROL</h3>
                                <p className="text-[8px] text-white/20 font-black uppercase tracking-widest">CONTROL NETWORK IDENTITIES & ACCESS PERMISSIONS</p>
                            </div>
                            <button 
                                onClick={() => setActivePanel('management')} 
                                className="px-2.5 py-1 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/60 hover:text-white cursor-pointer"
                            >
                                EXPAND MANAGEMENT &rarr;
                            </button>
                        </div>
                        <div className="border-t border-white/5 pt-3">
                            <UserManagementDetail users={allUsers.slice(0, 3)} />
                        </div>
                    </div>

                </div>

            </main>

            {/* Slide Panels */}
            <SlidePanel 
                isOpen={activePanel === 'revenue'} 
                onClose={() => setActivePanel(null)}
                title="Revenue Intelligence"
                icon={null}
            >
                <RevenueDetail stats={regionalStats} timeline={revenueTimeline} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'users'} 
                onClose={() => setActivePanel(null)}
                title="Live User Tracking"
                icon={null}
            >
                <LiveUsersDetail users={allUsers} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'staked'} 
                onClose={() => setActivePanel(null)}
                title="Staked Value Distribution"
                icon={null}
            >
                <StakedDetail stats={regionalStats} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'matches'} 
                onClose={() => setActivePanel(null)}
                title="Active Deployments"
                icon={null}
            >
                <ActiveMatchesDetail matches={allMatches} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'management'} 
                onClose={() => setActivePanel(null)}
                title="Personnel Directory"
                icon={null}
            >
                <UserManagementDetail users={allUsers} />
            </SlidePanel>

        </div>
    );
}
