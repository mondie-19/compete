"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/supabase/client";

interface AdminNavbarProps {
    profile: any;
}

export function AdminNavbar({ profile }: AdminNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-[#0A0A0F] border-b border-white/10 font-mono">
            <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-between">
                {/* Minimalist Brutalist Logo */}
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-[10px] font-black tracking-[0.2em] text-white hover:text-compete-purple transition-colors">
                        ADMIN//CORE
                    </Link>
                    <span className="text-white/20 text-[9px]">|</span>
                    
                    {/* Navigation */}
                    <nav className="flex items-center gap-1.5">
                        <Link 
                            href="/admin" 
                            className={`px-2.5 py-1 text-[9px] font-bold tracking-widest transition-all ${
                                pathname === '/admin' 
                                ? 'bg-white text-black' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            DASHBOARD
                        </Link>
                        <Link 
                            href="/lobby" 
                            className={`px-2.5 py-1 text-[9px] font-bold tracking-widest transition-all ${
                                pathname === '/lobby' 
                                ? 'bg-white text-black' 
                                : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            LOBBY
                        </Link>
                    </nav>
                </div>

                {/* Minimal Right: User Code & Stark Logout */}
                <div className="flex items-center gap-3 text-[9px]">
                    <span className="text-white/40">
                        OP: <span className="text-white font-bold uppercase">{profile?.username || "SYS_ADMIN"}</span>
                    </span>
                    <span className="text-white/20">|</span>
                    <button 
                        onClick={handleSignOut}
                        className="px-2.5 py-1 bg-red-950/20 border border-red-900/40 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-all"
                        title="Terminate Session"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>
        </header>
    );
}
