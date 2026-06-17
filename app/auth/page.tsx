"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronLeft, Target, Fingerprint, Loader2, Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function AuthPage() {
    const supabaseRef = useRef(createClient());
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleSignIn = async () => {
        const { error } = await supabaseRef.current.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
        if (error) toast.error(error.message);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const supabase = supabaseRef.current;

        try {
            if (isLogin) {
                // ── Sign In ────────────────────────────────────────────────
                // Using the browser client directly so the session cookie is
                // set synchronously in the browser before navigation starts.
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    toast.error(error.message);
                    return;
                }

                // Fetch role (fast — row is cached by Supabase edge)
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("role")
                    .eq("id", data.user.id)
                    .single();

                const role = profile?.role || "client";

                toast.success("UPLINK ESTABLISHED");

                // Hard navigation: guarantees the browser flushes session cookies
                // into the request before the server evaluates middleware.
                // router.push() (soft nav) can race with cookie propagation and
                // cause middleware's getUser() to see no session.
                if (role === "admin") window.location.href = "/admin";
                else if (role === "moderator") window.location.href = "/moderator";
                else if (role === "customer_care") window.location.href = "/customer-care";
                else window.location.href = "/lobby";

            } else {
                // ── Sign Up ────────────────────────────────────────────────
                if (!username.trim()) {
                    toast.error("COMPETITOR NAME REQUIRED");
                    return;
                }

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { username: username.trim() },
                    },
                });

                if (error) {
                    toast.error(error.message);
                    return;
                }

                // Fire-and-forget welcome email — does not block navigation.
                fetch("/api/auth/welcome-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, username: username.trim() }),
                }).catch(() => {});

                if (data.session) {
                    // Email confirmation is disabled — user is already signed in
                    toast.success("ACCOUNT CREATED. WELCOME TO COMPETE.");
                    window.location.href = "/lobby";
                } else {
                    // Email confirmation required
                    toast.success("CHECK YOUR EMAIL TO VERIFY YOUR ACCOUNT.", { duration: 6000 });
                    setIsLogin(true);
                    setPassword("");
                }
            }
        } catch (err: any) {
            toast.error("CONNECTION ERROR. PLEASE TRY AGAIN.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center pt-32 p-6 overflow-hidden selection:bg-compete-purple selection:text-white font-mono">

            {/* TACTICAL BACKGROUND GRID */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            {/* NEURAL SCAN LINE */}
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden opacity-10">
                <div className="w-full h-[2px] bg-compete-purple animate-scan shadow-[0_0_15px_#9B5CFF]" />
            </div>

            <Link href="/" className="fixed top-28 left-[7%] md:left-[calc(50%-512px+24px)] lg:left-[calc(50%-512px+32px)] flex items-center gap-2 text-white/40 hover:text-white transition-all group z-30 text-[10px] font-black uppercase">
                <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>ABORT UPLINK</span>
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-20 w-full max-w-[380px] bg-[#0F0F16]/60 border border-white/10 p-6 lg:p-8 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-md"
            >
                {/* Dynamic Iridescent Accent indicator */}
                <style>{`
                    @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                    }
                `}</style>
                <div
                    className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#0F0A1A] via-[#9B5CFF] via-[#5A20B3] via-[#9B5CFF] to-[#0F0A1A]"
                    style={{ backgroundSize: "200% 100%", animation: "shimmer 4s linear infinite" }}
                />

                <div className="mb-6 text-left mt-2">
                    <div className="flex items-center gap-2 text-compete-purple mb-3">
                        <Fingerprint size={16} className="animate-pulse" />
                        <span className="text-[8px] font-black tracking-[0.4em] uppercase">IDENTITY REQUIRED</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-black italic tracking-tighter leading-none uppercase">
                        {isLogin ? "NEURAL" : "NEW COMPETITOR"}<br />
                        <span className="text-compete-purple">{isLogin ? "UPLINK" : "PROTOCOL"}</span>
                    </h1>
                </div>

                <form className="space-y-4" onSubmit={handleAuth}>
                    <AnimatePresence mode="wait">
                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-1"
                            >
                                <label className="text-[9px] font-black tracking-widest text-white/40 ml-1 uppercase">COMPETITOR HANDLE</label>
                                <input
                                    type="text"
                                    placeholder="e.g. NINJA#1234"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required={!isLogin}
                                    autoComplete="username"
                                    className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:bg-black/80 outline-none transition-all placeholder:text-white/10 font-black italic text-white focus:border-compete-purple/40"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black tracking-widest text-white/40 ml-1 uppercase">EMAIL ADDRESS</label>
                        <input
                            type="email"
                            placeholder="e.g. CODESMITH@COMPETE.GG"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs focus:bg-black/80 outline-none transition-all placeholder:text-white/10 font-black italic text-white focus:border-compete-purple/40"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black tracking-widest text-white/40 ml-1 uppercase">ACCESS KEY</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete={isLogin ? "current-password" : "new-password"}
                                className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 pr-10 text-xs focus:bg-black/80 outline-none transition-all placeholder:text-white/10 font-black italic text-white focus:border-compete-purple/40"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                        <label className="flex items-center gap-2 cursor-pointer group/check">
                            <div className="relative w-3.5 h-3.5 border border-white/20 group-hover/check:border-compete-purple transition-colors rounded-sm overflow-hidden flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-full h-full bg-compete-purple scale-0 peer-checked:scale-100 transition-transform duration-200 ease-out" />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full scale-0 peer-checked:scale-100 transition-transform delay-100" />
                                </div>
                            </div>
                            <span className="text-[8px] font-black tracking-widest text-white/40 group-hover/check:text-white transition-colors uppercase">
                                REMEMBER ACCESS
                            </span>
                        </label>
                        {isLogin && (
                            <Link href="/auth/forgot" className="text-[8px] font-black tracking-widest text-compete-purple hover:text-white transition-colors uppercase">
                                LOST PASSWORD?
                            </Link>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 font-black tracking-[0.25em] italic hover:bg-compete-purple hover:text-white rounded-full transition-all flex items-center justify-center gap-2 group overflow-hidden relative disabled:opacity-50 mt-2 uppercase text-xs"
                    >
                        {loading ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Target size={14} className="group-hover:scale-125 transition-transform" />
                        )}
                        <span>{loading ? (isLogin ? "SIGNING IN..." : "SIGNING UP...") : (isLogin ? "SIGN IN" : "SIGN UP")}</span>
                    </button>
                </form>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full py-3.5 border border-white/10 rounded-full bg-white/5 text-white hover:text-black hover:bg-white active:scale-[0.98] transition-all font-black text-[9px] tracking-[0.2em] italic uppercase flex items-center justify-center gap-2"
                    >
                        <Globe size={12} /> SIGN IN WITH GOOGLE
                    </button>

                    <div className="flex justify-between items-center text-[8px] font-black tracking-widest pt-2">
                        <span className="text-white/20 uppercase">UPLINK REGISTRY</span>
                        <button
                            onClick={() => { setIsLogin(!isLogin); setPassword(""); }}
                            type="button"
                            className="text-compete-purple hover:text-white transition-colors uppercase italic"
                        >
                            {isLogin ? "INITIALIZE NEW PROFILE" : "ESTABLISH REGULAR UPLINK"}
                        </button>
                    </div>
                </div>

                {/* STATUS BAR */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center opacity-20">
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-compete-purple rounded-full" />
                        <div className="w-1 h-1 bg-compete-purple rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-compete-purple rounded-full" />
                    </div>
                    <span className="text-[7px] font-black tracking-[0.4em] uppercase">ENCRYPTED CONNECTION ACTIVE</span>
                </div>
            </motion.div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; }
                    100% { top: 100%; }
                }
                .animate-scan {
                    position: absolute;
                    animation: scan 4s linear infinite;
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
