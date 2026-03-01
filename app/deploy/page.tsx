"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronLeft, Gamepad2, Trophy, ShieldAlert, FileText, LayoutGrid, Share2, Users, ChevronRight, Terminal, Globe, ShieldCheck, Check, AlertCircle, Wallet, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/app/actions/challenges";
import { toast } from "sonner";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// --- SUCCESS & AUTHORIZATION MODAL ---
function MatchSuccess({ 
    challengeId, 
    gameName, 
    entryFee, 
    finalPrize, 
    onClose 
}: { 
    challengeId: string, 
    gameName: string, 
    entryFee: number, 
    finalPrize: number,
    onClose: () => void 
}) {
    const [copied, setCopied] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);

    const handleCopy = async () => {
        const url = `${window.location.origin}/match/${challengeId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("LINK EXTRACTION FAILED");
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
            
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="max-w-2xl w-full bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 md:p-12 relative overflow-hidden shadow-[0_0_100px_rgba(155,92,255,0.2)]">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-compete-purple to-transparent animate-scan" />
                
                <button onClick={onClose} className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center space-y-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-700 ${isConfirmed ? 'bg-green-500/20 border-green-500 text-green-500' : 'bg-compete-purple/20 border-compete-purple/40 text-compete-purple'}`}>
                        {isConfirmed ? <ShieldCheck size={40} /> : <Zap size={40} className="animate-pulse" />}
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-compete-purple">
                            {isConfirmed ? "Uplink Established" : "Authorization Required"}
                        </p>
                        <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                            {isConfirmed ? "Match " : "Confirm "} 
                            <span className="text-transparent stroke-text">{isConfirmed ? "Live" : "Stakes"}</span>
                        </h2>
                        {!isConfirmed && (
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">
                                Deployment requires ${entryFee.toFixed(2)} to be locked in escrow.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-3 w-full gap-4 py-6 border-y border-white/5">
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase">Target</p>
                            <p className="text-xs font-black uppercase truncate text-white">{gameName}</p>
                        </div>
                        <div className="space-y-1 border-x border-white/5">
                            <p className="text-[8px] font-black text-white/40 uppercase">Entry</p>
                            <p className="text-xs font-black uppercase text-white">${entryFee}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[8px] font-black text-white/40 uppercase">Net Prize</p>
                            <p className="text-xs font-black uppercase text-compete-purple">${finalPrize.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="w-full space-y-4">
                        {!isConfirmed ? (
                            <button 
                                onClick={() => { setIsConfirmed(true); toast.success("FUNDS SECURED IN ESCROW"); }}
                                className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.2em] italic rounded-2xl flex items-center justify-center gap-3 hover:bg-compete-purple hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Confirm & Initialize
                            </button>
                        ) : (
                            <>
                                <Link href={`/match/${challengeId}`} className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] italic rounded-2xl flex items-center justify-center gap-3 hover:bg-compete-purple hover:text-white transition-all group">
                                    <span>Enter Battle Room</span><ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button onClick={handleCopy} className={`w-full py-4 border rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${copied ? "bg-green-500/20 border-green-500 text-green-500" : "bg-white/5 border-white/10 text-white"}`}>
                                    {copied ? <Check size={14} /> : <Share2 size={14} />} {copied ? "Uplink Copied" : "Copy Invite Link"}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function DeployPage() {
    const [gameName, setGameName] = useState("");
    const [genre, setGenre] = useState("");
    const [platform, setPlatform] = useState("PC");
    const [entryFee, setEntryFee] = useState(5);
    const [rules, setRules] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [challengeId, setChallengeId] = useState("");

    // Mock wallet balance
    const walletBalance = 150.00; 

    const router = useRouter();

    const PLATFORM_FEE_PERCENT = 15;
    const totalPool = entryFee * 2;
    const feeAmount = (totalPool * PLATFORM_FEE_PERCENT) / 100;
    const finalPrize = totalPool - feeAmount;

    const isHighStakes = entryFee >= 500;
    const hasInsufficientFunds = walletBalance < entryFee;

    const handleDeploy = async () => {
        if (hasInsufficientFunds) {
            toast.error("DEPLOYMENT REJECTED", {
                description: "Hey, can't create due to lack of funds. Please top up.",
                icon: <AlertTriangle className="text-red-500" />
            });
            return;
        }

        if (entryFee < 1 || entryFee > 2000) {
            toast.error("STAKES MUST BE $1 - $2,000");
            return;
        }

        if (!gameName || !genre || !rules) {
            toast.error("INVALID PARAMETERS"); 
            return;
        }

        setIsDeploying(true);
        try {
            const result = await createChallenge(gameName, platform, entryFee, genre, rules);
            if (result.success && result.challengeId) {
                setChallengeId(result.challengeId);
                setShowSuccess(true);
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
            
            <AnimatePresence>
                {showSuccess && (
                    <MatchSuccess 
                        challengeId={challengeId} 
                        gameName={gameName} 
                        entryFee={entryFee} 
                        finalPrize={finalPrize}
                        onClose={() => setShowSuccess(false)}
                    />
                )}
            </AnimatePresence>

            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className={`absolute top-0 right-0 w-[800px] h-[800px] blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 transition-colors duration-1000 ${isHighStakes ? 'bg-amber-500/10' : 'bg-compete-purple/5'}`} />
            </div>

            <main className="flex-1 relative z-10 pt-32 pb-20 px-6 max-w-5xl mx-auto w-full">
                <Link href="/lobby" className="inline-flex items-center gap-2 text-compete-muted hover:text-white transition-colors mb-12 group">
                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Abort Deployment</span>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <Wallet size={18} className="text-compete-purple" />
                                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Available Credits</span>
                            </div>
                            <span className="font-black italic text-sm">${walletBalance.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg border animate-pulse transition-colors duration-500 ${isHighStakes ? 'bg-amber-500/20 border-amber-500/30 text-amber-500' : 'bg-compete-purple/20 border-compete-purple/30 text-compete-purple'}`}>
                                <Zap size={20} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] text-glow ${isHighStakes ? 'text-amber-500' : 'text-compete-purple'}`}>
                                {isHighStakes ? 'High Stakes Protocol' : 'Initialization Phase'}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none mb-6">Host <br /> <span className="text-transparent stroke-text">Challenge</span></h1>
                        
                        <div className="space-y-4">
                            {/* --- GLOBAL VISIBILITY CARD --- */}
                            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <Globe size={18} className="text-compete-purple shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/60 mb-1">Global Visibility</p>
                                    <p className="text-[10px] text-compete-muted leading-relaxed uppercase font-bold">Your match will be broadcasted to all active operatives.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                <ShieldAlert size={18} className="text-yellow-500 shrink-0 mt-0.5" />
                                <div><p className="text-[10px] font-black uppercase text-white/60 mb-1">Escrow Protocol</p><p className="text-[10px] text-compete-muted leading-relaxed uppercase font-bold">Entry fees are locked until result verification.</p></div>
                            </div>

                            <div className={`p-5 rounded-2xl border transition-all duration-700 ${isHighStakes ? 'bg-amber-500/5 border-amber-500/20' : 'bg-compete-purple/5 border-compete-purple/20'}`}>
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isHighStakes ? 'text-amber-500' : 'text-compete-purple'}`}>Payout Schematic</p>
                                <div className="space-y-2 text-[11px] font-bold uppercase">
                                    <div className="flex justify-between"><span className="text-white/40">Total Stakes:</span><span>${totalPool.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-red-500"><span className="text-white/40">Tax (15%):</span><span>-${feeAmount.toFixed(2)}</span></div>
                                    <div className="h-px bg-white/10 my-1" />
                                    <div className={`flex justify-between ${isHighStakes ? 'text-amber-500' : 'text-compete-purple'}`}>
                                        <span>Winner Payout:</span>
                                        <span className="text-glow">${finalPrize.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-compete-card/40 border border-white/10 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-2xl shadow-2xl">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 ml-1"><Gamepad2 size={12} /> Target Game</label>
                                        <input type="text" placeholder="E.G. WARZONE" value={gameName} onChange={(e) => setGameName(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase outline-none focus:border-compete-purple/50 transition-colors" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 ml-1"><LayoutGrid size={12} /> Genre</label>
                                        <input type="text" placeholder="E.G. FPS / MOBA" value={genre} onChange={(e) => setGenre(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase outline-none focus:border-compete-purple/50 transition-colors" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-white/40 ml-1">Platform</label>
                                        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase outline-none cursor-pointer appearance-none">
                                            <option value="PC">PC / STEALTH</option>
                                            <option value="PS5">PLAYSTATION 5</option>
                                            <option value="XBOX">XBOX SERIES</option>
                                            <option value="MOBILE">MOBILE </option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase ml-1">
                                            <span className="text-white/40">Entry Fee ($)</span>
                                            <span className={hasInsufficientFunds ? "text-red-500 animate-pulse" : "text-white/20"}>
                                                {hasInsufficientFunds ? "INSUFFICIENT FUNDS" : "$1 - $2K"}
                                            </span>
                                        </div>
                                        <input 
                                            type="number" 
                                            value={entryFee} 
                                            onChange={(e) => setEntryFee(Number(e.target.value))} 
                                            onBlur={() => {
                                                if (entryFee < 1) setEntryFee(1);
                                                if (entryFee > 2000) setEntryFee(2000);
                                            }}
                                            className={`w-full bg-black/40 border rounded-2xl py-5 px-6 text-sm font-black uppercase outline-none transition-colors no-spinner ${hasInsufficientFunds ? 'border-red-500 text-red-500' : 'border-white/5 focus:border-compete-purple/50'}`} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 ml-1"><FileText size={12} /> Engagement Rules</label>
                                    <textarea rows={4} placeholder="DEFINE WIN CONDITIONS, MAPS, AND RESTRICTIONS..." value={rules} onChange={(e) => setRules(e.target.value.toUpperCase())} className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 px-6 text-sm font-black uppercase outline-none focus:border-compete-purple/50 transition-colors resize-none" />
                                </div>

                                <button 
                                    disabled={isDeploying || !gameName || !genre || !rules} 
                                    onClick={handleDeploy} 
                                    className={`w-full py-6 font-black uppercase italic rounded-2xl transition-all flex items-center justify-center gap-3 relative overflow-hidden ${hasInsufficientFunds ? 'bg-red-500/10 text-red-500 border border-red-500/20' : isDeploying ? "bg-white/5 text-white/20" : "bg-white text-black hover:bg-compete-purple hover:text-white active:scale-95"}`}
                                >
                                    <Zap size={18} className={isDeploying ? "animate-spin" : ""} />
                                    <span>{hasInsufficientFunds ? "LACK OF FUNDS" : isDeploying ? "ESTABLISHING UPLINK..." : "Initialize Deployment"}</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
            <style jsx>{`
                .stroke-text { -webkit-text-stroke: 1px rgba(155, 92, 255, 0.5); }
                .no-spinner::-webkit-inner-spin-button, .no-spinner::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                .no-spinner { -moz-appearance: textfield; }
                .text-glow { text-shadow: 0 0 10px currentColor; }
                @keyframes scan { 0% { transform: translateY(-100px); opacity: 0; } 50% { opacity: 1; } 100% { transform: translateY(600px); opacity: 0; } }
                .animate-scan { animation: scan 3s linear infinite; }
            `}</style>
        </div>
    );
}