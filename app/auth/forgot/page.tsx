"use client";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { Lock, Fingerprint, ChevronLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset`,
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("RESET LINK SENT TO EMAIL.");
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 overflow-hidden selection:bg-compete-purple selection:text-white">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:40px_40px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            </div>

            <Link href="/auth" className="absolute top-12 left-12 flex items-center gap-3 text-white/40 hover:text-white transition-all group z-20">
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Return to Auth</span>
            </Link>

            <div className="relative z-20 w-full max-w-[400px] bg-[#050505] border border-white/10 p-12 rounded-3xl shadow-2xl overflow-hidden">
                <div className="mb-12 text-left mt-2">
                    <div className="flex items-center gap-2 text-compete-purple mb-4">
                        <Fingerprint size={20} className="animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em]">Identity Recovery</span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                        Password<br />
                        <span className="text-transparent stroke-text">Override</span>
                    </h1>
                </div>

                <form className="space-y-4" onSubmit={handleResetRequest}>
                    <input
                        type="email"
                        required
                        placeholder="ENTER EMAIL ADDRESS"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black border border-white/10 p-5 pl-6 text-white outline-none focus:border-compete-purple transition-all font-black placeholder:text-white/5 uppercase tracking-widest text-[10px]"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-white text-black p-5 mt-4 text-[10px] font-black tracking-[0.4em] uppercase disabled:opacity-50"
                    >
                        <Lock size={14} className="inline-block mr-2 -mt-1 group-hover:scale-110 transition-transform" />
                        {loading ? "TRANSMITTING..." : "REQUEST OVERRIDE"}
                    </button>
                </form>
            </div>
        </div>
    );
}
