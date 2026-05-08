"use client";
import { useState } from "react";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { KeyRound, Fingerprint } from "lucide-react";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("PASSWORD OVERRIDE SUCCESSFUL.");
            router.push('/auth');
        }
        setLoading(false);
    };

    return (
        <div className="relative min-h-screen bg-[#000000] text-white flex items-center justify-center p-6 overflow-hidden selection:bg-compete-purple selection:text-white">
            <div className="relative z-20 w-full max-w-[400px] bg-[#050505] border border-white/10 p-12 rounded-3xl shadow-2xl overflow-hidden">
                <div className="mb-12 text-left mt-2">
                    <div className="flex items-center gap-2 text-compete-purple mb-4">
                        <Fingerprint size={20} className="animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-[0.5em]">Identity Restoration</span>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                        New<br />
                        <span className="text-transparent stroke-text">Access Key</span>
                    </h1>
                </div>

                <form className="space-y-4" onSubmit={handlePasswordUpdate}>
                    <input
                        type="password"
                        required
                        placeholder="ENTER NEW ACCESS KEY"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-white/10 p-5 pl-6 text-white outline-none focus:border-compete-purple transition-all font-black placeholder:text-white/5 uppercase tracking-widest text-[10px]"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full relative group overflow-hidden bg-white text-black p-5 mt-4 text-[10px] font-black tracking-[0.4em] uppercase disabled:opacity-50"
                    >
                        <KeyRound size={14} className="inline-block mr-2 -mt-1 group-hover:scale-110 transition-transform" />
                        {loading ? "INITIALIZING..." : "CONFIRM NEW KEY"}
                    </button>
                </form>
            </div>
        </div>
    );
}

