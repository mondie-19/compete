"use client";
import { motion } from "framer-motion";
import { Zap, ChevronLeft, Gamepad2, Trophy, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/app/actions/challenges";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DeployPage() {
    const [gameName, setGameName] = useState("");
    const [platform, setPlatform] = useState("PC");
    const [entryFee, setEntryFee] = useState(5);
    const [isDeploying, setIsDeploying] = useState(false);
    const router = useRouter();

    const handleDeploy = async () => {
        if (!gameName || entryFee <= 0) {
            toast.error("INVALID PARAMETERS");
            return;
        }

        setIsDeploying(true);
        try {
            const result = await createChallenge(gameName, platform, entryFee);
            if (result.success && result.challengeId) {
                toast.success("MATCH DEPLOYED SUCCESSFULLY");
                router.push(`/match/${result.challengeId}`);
            } else {
                toast.error(result.error || "DEPLOYMENT REJECTED");
            }
        } catch (err) {
            toast.error("DEPLOYMENT FAILED");
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans flex flex-col">
            <Navbar onJoinClick={() => router.push("/auth")} />

            {/* BACKGROUND DECORATION */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-compete-purple/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_3px,3px_100%]" />
            </div>

            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto w-full">
                <Link href="/lobby" className="inline-flex items-center gap-2 text-compete-muted hover:text-white transition-colors mb-12 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Abort Deployment</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* INFO SIDE */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 rounded-lg bg-compete-purple/20 border border-compete-purple/30 text-compete-purple animate-pulse">
                                    <Zap size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-compete-purple text-glow">Initialization Phase</span>
                            </div>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-6">
                                Host <br /> <span className="text-transparent stroke-text">Challenge</span>
                            </h1>
                            <p className="text-compete-muted text-sm leading-relaxed max-w-xs">
                                Deploy a new match to the global network. Secure escrow will be established upon confirmation.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <ShieldAlert size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Escrow Protocol</p>
                                    <p className="text-[10px] text-compete-muted leading-relaxed uppercase font-bold">Entry fees are locked until result verification.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <Trophy size={18} className="text-compete-purple shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/60 tracking-widest mb-1">Global Visibility</p>
                                    <p className="text-[10px] text-compete-muted leading-relaxed uppercase font-bold">Your match will be broadcasted to all active operatives.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM SIDE */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-compete-card/40 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="space-y-6 relative z-10">
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                                        <Gamepad2 size={12} /> Target Game
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="E.G. WARZONE, VALORANT, EA FC"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value.toUpperCase())}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase tracking-widest focus:border-compete-purple/50 focus:bg-black/60 outline-none transition-all placeholder:text-white/5"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2">Platform</label>
                                        <div className="relative group">
                                            <select
                                                value={platform}
                                                onChange={(e) => setPlatform(e.target.value)}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase tracking-widest focus:border-compete-purple/50 focus:bg-black/60 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="PC">PC / STEALTH</option>
                                                <option value="PS5"> PLAYSTATION 5</option>
                                                <option value="XBOX">XBOX SERIES</option>
                                                <option value="MOBILE">MOBILE</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                                                <ChevronLeft size={16} className="-rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Entry Fee ($)</label>
                                        <input
                                            type="number"
                                            value={entryFee}
                                            onChange={(e) => setEntryFee(Math.max(0, Number(e.target.value)))}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase tracking-widest focus:border-compete-purple/50 focus:bg-black/60 outline-none transition-all no-spinner"
                                        />
                                    </div>
                                </div>

                                <div className="p-8 bg-compete-purple/20 border border-compete-purple/30 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-compete-purple mb-2">Network Prize Pool</p>
                                        <p className="text-5xl font-black italic text-white text-glow">${entryFee * 2}</p>
                                        <p className="text-[8px] font-bold text-compete-purple/60 mt-2 uppercase tracking-widest italic">1:1 High Stakes Matching</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-compete-purple/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                </div>

                                <button
                                    disabled={isDeploying || !gameName}
                                    onClick={handleDeploy}
                                    className={`w-full py-6 font-black uppercase tracking-[0.3em] italic rounded-2xl transition-all shadow-purple-glow flex items-center justify-center gap-3 group relative overflow-hidden ${isDeploying || !gameName ? "bg-white/5 text-white/20 cursor-wait border border-white/5" : "bg-white text-black hover:bg-compete-purple hover:text-white"
                                        }`}
                                >
                                    <Zap size={18} className={isDeploying ? "animate-spin" : "group-hover:rotate-12 transition-transform"} />
                                    <span>{isDeploying ? "ESTABLISHING UPLINK..." : "Initialize Deployment"}</span>
                                    {!isDeploying && gameName && (
                                        <div className="absolute inset-0 bg-compete-purple opacity-0 group-hover:opacity-10 transition-opacity" />
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            

            <style jsx>{`
                .stroke-text {
                    -webkit-text-stroke: 1px rgba(155, 92, 255, 0.5);
                }
            `}</style>
        </div>
    );
}
