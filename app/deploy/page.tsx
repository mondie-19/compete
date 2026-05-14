"use client";
import { motion } from "framer-motion";
import { Zap, ChevronLeft, Gamepad2, ShieldAlert, AlertTriangle, Monitor, Smartphone, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/app/actions/challenges";
import { createClient } from "@/supabase/client";
import { useHeartbeat } from "@/lib/useHeartbeat";
import { toast } from "sonner";
import Link from "next/link";
import Footer from "@/components/Footer";

const PLATFORMS = [
    { id: "PC",     icon: <Monitor size={18} />,    color: "hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]" },
    {
        id: "PS",
        icon: (
            <svg width="18" height="18" viewBox="0 0 640 640" fill="currentColor">
                <path d="M603 436.3C591.7 450.5 564.2 460.6 564.2 460.6L359.1 534.2L359.1 479.9L510 426.1C527.1 420 529.8 411.3 515.8 406.7C501.9 402.1 476.7 403.4 459.6 409.6L359.1 445.1L359.1 388.7C382.3 380.9 406.2 375.1 434.8 371.9C475.7 367.4 525.7 372.5 565 387.4C609.2 401.4 614.2 422.1 603 436.3zM378.6 343.8L378.6 204.8C378.6 188.5 375.6 173.5 360.3 169.2C348.6 165.4 341.3 176.3 341.3 192.6L341.3 540.5L247.5 510.7L247.5 96C287.4 103.4 345.5 120.9 376.7 131.4C456.2 158.7 483.1 192.7 483.1 269.2C483.1 343.7 437.1 372 378.6 343.8zM75.3 474.2C29.9 461.4 22.3 434.7 43 419.4C62.1 405.2 94.7 394.5 94.7 394.5L229.2 346.7L229.2 401.2L132.4 435.8C115.3 441.9 112.7 450.6 126.6 455.2C140.5 459.8 165.7 458.5 182.8 452.3L229.2 435.4L229.2 484.2C177.6 493.5 127.8 491.5 75.3 474.2z" />
            </svg>
        ),
        color: "hover:border-[#0037AE] hover:shadow-[0_0_20px_rgba(0,55,174,0.6)] hover:text-[#0037AE]"
    },
    {
        id: "XBOX",
        icon: (
            <svg width="18" height="18" viewBox="0 0 640 640" fill="currentColor">
                <path d="M433.9 382.2C478.2 436.5 498.6 481 488.3 500.9C480.4 516 431.6 545.5 395.7 556.8C366.1 566.1 327.3 570.1 295.3 567C257.1 563.3 218.4 549.6 185.2 528C157.3 509.8 151 502.3 151 487.4C151 457.5 183.9 405.1 240.2 345.3C272.2 311.4 316.7 271.6 321.6 272.7C331 274.8 405.9 347.8 433.9 382.2zM252.6 207.8C222.9 180.9 194.5 153.9 166.2 144.4C151 139.3 149.9 139.6 137.5 152.5C108.3 182.9 84 232.2 77.2 274.9C71.8 309.1 71.1 318.7 73 335.4C78.6 385.9 90.3 420.8 113.5 456.3C123 470.9 125.6 473.6 122.8 466.2C118.6 455.2 122.5 428.7 132.3 402.2C146.6 363.2 186.2 289.3 252.6 207.8zM564.2 271.3C547.3 191.3 496.7 141 489.6 141C482.3 141 465.4 147.5 453.6 154.9C430.3 169.4 412.6 186.3 389.3 207.7C431.7 261 491.5 347.1 512.2 410C519 430.7 521.9 451.1 519.6 462.3C517.9 470.8 517.9 470.8 521 466.9C527.1 459.2 540.9 435.6 546.4 423.4C553.8 407.2 561.4 383.2 565 364.7C569.3 342.2 568.9 293.9 564.2 271.3zM205.3 107C253 104.5 315 141.5 319.6 142.4C320.3 142.5 330 138.2 341.2 132.7C405.1 101.6 435.2 106.9 448.6 107.5C384.7 68.2 295.9 57.5 214.7 95.8C191.3 106.9 190.7 107.7 205.3 107z" />
            </svg>
        ),
        color: "hover:border-[#107C10] hover:shadow-[0_0_20px_rgba(16,124,16,0.6)] hover:text-[#107C10]"
    },
    { id: "MOBILE",   icon: <Smartphone size={18} />, color: "hover:border-compete-purple hover:shadow-[0_0_15px_rgba(155,92,255,0.3)]" },
    {
        id: "NINTENDO",
        icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.823 0C3.5 0 0 3.5 0 7.823v8.354C0 20.5 3.5 24 7.823 24h8.354C20.5 24 24 20.5 24 16.177V7.823C24 3.5 20.5 0 16.177 0H7.823zm.52 3.568h1.73v16.864H8.343V3.568zm3.461 0h.868c2.4 0 4.347 1.947 4.347 4.347v8.17c0 2.4-1.947 4.348-4.347 4.348h-.868V3.568zM9.204 6.17v4.173h-.001a2.087 2.087 0 1 0 .001-4.173z" />
            </svg>
        ),
        color: "hover:border-[#E4000F] hover:shadow-[0_0_20px_rgba(228,0,15,0.6)] hover:text-[#E4000F]"
    },
];

export default function DeployPage() {
    const [gameName, setGameName] = useState("");
    const [platform, setPlatform] = useState("PC");
    const [entryFee, setEntryFee] = useState(1000);
    const [engagements, setEngagements] = useState("");
    const [balance, setBalance] = useState<number | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const router = useRouter();
    const supabase = createClient();
    useHeartbeat();

    useEffect(() => {
        const fetchBalance = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('balance, region').eq('id', user.id).single();
                if (data) {
                    setBalance(data.balance);
                }
            }
        }
        fetchBalance();
    }, []);

    const handleDeploy = async () => {
        if (!gameName || entryFee <= 0) {
            toast.error("Invalid parameters");
            return;
        }

        const fullGameName = engagements ? `${gameName} - ${engagements.substring(0, 50)}` : gameName;

        setIsDeploying(true);
        try {
            const result = await createChallenge(fullGameName, platform, entryFee);
            if (result.success && result.challengeId) {
                toast.success("Match deployed successfully");
                router.push(`/match/${result.challengeId}`);
            } else {
                toast.error(result.error || "Deployment rejected");
            }
        } catch (err) {
            toast.error("Deployment failed");
        } finally {
            setIsDeploying(false);
        }
    };

    const isInsufficientFunds = balance !== null && entryFee > balance;

    const getWagerDesign = () => {
        if (entryFee >= 10000) {
            return {
                label: "Premium Wager",
                colorClass: "text-[#E5E4E2]",
                bgClass: "bg-[#E5E4E2]/5",
                borderClass: "border-[#E5E4E2]/20",
                focusBorderClass: "focus:border-[#E5E4E2]/40",
                accentClass: "bg-[#E5E4E2]",
                shadowStyle: "0 0 20px rgba(229, 228, 226, 0.05)"
            };
        }
        if (entryFee >= 5000) {
            return {
                label: "High Wager",
                colorClass: "text-[#FFD700]",
                bgClass: "bg-[#FFD700]/5",
                borderClass: "border-[#FFD700]/20",
                focusBorderClass: "focus:border-[#FFD700]/40",
                accentClass: "bg-[#FFD700]",
                shadowStyle: "0 0 20px rgba(255, 215, 0, 0.05)"
            };
        }
        return {
            label: "Standard Wager",
            colorClass: "text-[#9B5CFF]",
            bgClass: "bg-[#9B5CFF]/5",
            borderClass: "border-[#9B5CFF]/20",
            focusBorderClass: "focus:border-[#9B5CFF]/40",
            accentClass: "bg-[#9B5CFF]",
            shadowStyle: "0 0 20px rgba(155, 92, 255, 0.05)"
        };
    };

    const wager = getWagerDesign();

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white relative font-sans flex flex-col selection:bg-compete-purple/30">

            {/* SUBTLE BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-compete-purple/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
            </div>

            <main className="flex-1 relative z-10 pt-20 lg:pt-32 pb-10 px-4 lg:px-6 max-w-5xl mx-auto w-full">
                <Link href="/lobby" className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors mb-6 lg:mb-12 text-[10px] lg:text-sm font-medium">
                    <ChevronLeft className="-ml-1 w-3 h-3 lg:w-4 lg:h-4" />
                    BACK TO LOBBY
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                    {/* INFO SIDE */}
                    <div className="lg:col-span-5 space-y-6 lg:space-y-8 lg:sticky lg:top-32">
                        <div>
                            <h1 className="text-2xl lg:text-5xl font-black italic uppercase tracking-tighter mb-2 text-compete-purple">
                                Deploy Match
                            </h1>
                            <p className="text-white/30 text-[10px] lg:text-base leading-relaxed max-w-sm">
                                Create a custom match layout. Your stake is secured in escrow and released upon verification.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-6">
                            {balance !== null && (
                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between shadow-sm">
                                    <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Available</span>
                                    <span className="text-sm lg:text-xl font-black italic tracking-tight">KSh {balance.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex items-start gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                <ShieldAlert className="text-compete-purple shrink-0 mt-0.5 w-4 h-4 lg:w-5 lg:h-5" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-white/60 mb-0.5">Escrow Protocol</p>
                                    <p className="text-[9px] lg:text-sm text-white/20 leading-relaxed italic">Funds are locked until match verification.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORM SIDE */}
                    <div className="lg:col-span-7">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#121212] border border-white/10 rounded-2xl lg:rounded-3xl p-5 lg:p-8 shadow-2xl relative"
                            style={{ boxShadow: wager.shadowStyle }}
                        >
                            <div className="space-y-5 lg:space-y-6 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                                        <Gamepad2 size={12} /> Game Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. WARZONE, EA FC 24"
                                        value={gameName}
                                        onChange={(e) => setGameName(e.target.value)}
                                        className={`w-full bg-black/50 border ${wager.borderClass} rounded-xl py-3.5 px-4 text-xs lg:text-base focus:bg-black/80 ${wager.focusBorderClass} outline-none transition-all placeholder:text-white/10 uppercase font-black italic`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Platform</label>
                                    <div className="grid grid-cols-5 gap-1.5 lg:gap-2">
                                        {PLATFORMS.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                onClick={() => setPlatform(p.id)}
                                                className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-lg lg:rounded-xl border transition-all duration-300 ${
                                                    platform === p.id
                                                        ? 'bg-white text-black border-white shadow-xl scale-105'
                                                        : `bg-black/40 border-white/10 text-white/40 ${p.color}`
                                                }`}
                                            >
                                                <div className="scale-75 lg:scale-100">{p.icon}</div>
                                                <span className="text-[6px] lg:text-[7px] font-black uppercase tracking-tighter">{p.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isInsufficientFunds ? "text-red-400" : "text-white/40"}`}>
                                        Stake (KSh)
                                    </label>
                                    <input
                                        type="number"
                                        value={entryFee}
                                        step={50}
                                        onChange={(e) => setEntryFee(Math.max(0, Number(e.target.value)))}
                                        className={`w-full bg-black/50 border ${isInsufficientFunds ? "border-red-500/50" : wager.borderClass} rounded-xl py-3.5 px-4 text-xs lg:text-base focus:bg-black/80 ${wager.focusBorderClass} outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-black italic`}
                                    />
                                </div>


                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">
                                        Engagements
                                    </label>
                                    <textarea
                                        placeholder="Rules, region, style..."
                                        value={engagements}
                                        onChange={(e) => setEngagements(e.target.value)}
                                        className={`w-full bg-black/50 border ${wager.borderClass} rounded-xl py-3.5 px-4 text-xs lg:text-base focus:bg-black/80 ${wager.focusBorderClass} outline-none transition-all placeholder:text-white/10 h-20 lg:h-28 resize-none font-medium text-white/60`}
                                    />
                                </div>

                                <div className={`p-4 lg:p-6 mt-1 lg:mt-2 ${wager.bgClass} border ${wager.borderClass} rounded-xl lg:rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-300`}>
                                    <p className={`text-[8px] lg:text-xs font-black tracking-widest uppercase mb-1 ${wager.colorClass} opacity-60`}>{wager.label}</p>
                                    <p className={`text-2xl lg:text-4xl font-black italic tracking-tighter ${wager.colorClass}`}>KSh {(entryFee * 2).toLocaleString()}</p>
                                    <p className="text-[7px] lg:text-xs text-white/20 mt-1 font-black uppercase tracking-widest">Total Prize Pool</p>
                                </div>

                                <button
                                    disabled={isDeploying || !gameName || isInsufficientFunds}
                                    onClick={handleDeploy}
                                    className={`w-full py-4 lg:py-5 text-[10px] lg:text-sm font-black uppercase tracking-widest rounded-xl lg:rounded-2xl transition-all flex items-center justify-center gap-2 mt-2 lg:mt-4 ${isInsufficientFunds
                                        ? "bg-red-500/10 text-red-400 border border-red-500/30 cursor-not-allowed"
                                        : isDeploying || !gameName
                                            ? "bg-white/5 text-white/30 cursor-wait"
                                            : "bg-white text-black hover:bg-white/90 active:scale-[0.98] italic"
                                        }`}
                                >
                                    {isInsufficientFunds ? (
                                        <AlertTriangle size={14} />
                                    ) : (
                                        <Zap size={14} className={isDeploying ? "animate-pulse" : ""} />
                                    )}

                                    <span>
                                        {isInsufficientFunds
                                            ? "Insufficient Funds"
                                            : isDeploying
                                                ? "Deploying..."
                                                : "Deploy Match"}
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

        </div>
    );
}
