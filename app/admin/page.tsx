"use client";
import { useState, useEffect } from "react";
import { 
    Shield, Banknote, Users, Activity, History, 
    LogOut, AlertTriangle, Zap, Target
} from "lucide-react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
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
                    host:profiles!challenges_host_id_fkey(username, region),
                    opponent:profiles!challenges_opponent_id_fkey(username, region)
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
            const channel = supabase.channel('admin-dashboard')
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
            <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white/20 font-black tracking-[0.5em] uppercase">
            <div className="relative mb-8">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.5, 1],
                        rotate: [45, 225, 405],
                        opacity: [0.5, 1, 0.5],
                        boxShadow: [
                            "0 0 20px rgba(155,92,255,0.2)",
                            "0 0 50px rgba(155,92,255,0.6)",
                            "0 0 20px rgba(155,92,255,0.2)"
                        ]
                    }}
                    transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                    }}
                    className="w-16 h-16 bg-compete-purple rounded-xl"
                />
            </div>
            Authorizing Command Link...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-sans pb-32 selection:bg-compete-purple selection:text-white relative overflow-x-hidden">
            
            <main className="pt-32 max-w-7xl mx-auto px-6 space-y-8">
                
                {/* System Pulse Indicator */}
                <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System Pulse: Nominal</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-white/20 mt-0.5">Encrypted Real-time Uplink Active</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Last Sync</p>
                        <p className="text-[10px] font-bold text-white/60">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Revenue Tile */}
                    <div className="lg:col-span-2">
                        <StatTile 
                            title="Total Site Revenue (15% Fee)"
                            value={`KSh ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            subtitle="System Yield Across All Regions"
                            icon={<Banknote size={32} />}
                            colorClass="text-compete-purple"
                            onClick={() => setActivePanel('revenue')}
                        />
                    </div>

                    {/* Live Users Tile */}
                    <StatTile 
                        title="Live Users (24h)"
                        value={liveUsers.toLocaleString()}
                        subtitle="Active Global Connections"
                        icon={<Users size={32} />}
                        colorClass="text-green-500"
                        onClick={() => setActivePanel('users')}
                    />

                    {/* Staked Tile */}
                    <StatTile 
                        title="Total Cash Staked"
                        value={`KSh ${totalStaked.toLocaleString()}`}
                        subtitle="Global Value Locked"
                        icon={<Target size={32} />}
                        colorClass="text-yellow-500"
                        onClick={() => setActivePanel('staked')}
                    />

                    {/* Active Matches Tile */}
                    <div className="lg:col-span-2">
                        <StatTile 
                            title="Active Deployments"
                            value={activeMatchesCount.toLocaleString()}
                            subtitle={`${recentMatchesCount} matches finalized recently`}
                            icon={<Zap size={32} />}
                            colorClass="text-orange-500"
                            onClick={() => setActivePanel('matches')}
                        />
                    </div>

                    {/* User Management Tile */}
                    <div className="lg:col-span-2">
                        <StatTile 
                            title="Personnel Management"
                            value={allUsers.length.toLocaleString()}
                            subtitle="Players, Moderators, Support"
                            icon={<Shield size={32} />}
                            colorClass="text-blue-500"
                            onClick={() => setActivePanel('management')}
                        />
                    </div>
                </div>

            </main>

            {/* Slide Panels */}
            <SlidePanel 
                isOpen={activePanel === 'revenue'} 
                onClose={() => setActivePanel(null)}
                title="Revenue Intelligence"
                icon={<Banknote size={24} />}
            >
                <RevenueDetail stats={regionalStats} timeline={revenueTimeline} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'users'} 
                onClose={() => setActivePanel(null)}
                title="Live User Tracking"
                icon={<Users size={24} />}
            >
                <LiveUsersDetail users={allUsers} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'staked'} 
                onClose={() => setActivePanel(null)}
                title="Staked Value Distribution"
                icon={<Target size={24} />}
            >
                <StakedDetail stats={regionalStats} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'matches'} 
                onClose={() => setActivePanel(null)}
                title="Active Deployments"
                icon={<Zap size={24} />}
            >
                <ActiveMatchesDetail matches={allMatches} />
            </SlidePanel>

            <SlidePanel 
                isOpen={activePanel === 'management'} 
                onClose={() => setActivePanel(null)}
                title="Personnel Directory"
                icon={<Shield size={24} />}
            >
                <UserManagementDetail users={allUsers} />
            </SlidePanel>

        </div>
    );
}
