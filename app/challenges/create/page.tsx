"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sword, Trophy, Monitor, Smartphone, ArrowLeft, Loader2, Search, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// Replaced Cpu icons with dedicated gaming icons
const PLATFORMS = [
  { id: "PC", icon: <Monitor size={18} />, color: "hover:border-white hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]" },
  {
    id: "PS",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.215 15.36c-1.353-.36-2.65-.67-3.924-.925v-3.714c1.274-.255 2.57-.565 3.924-.925v5.564zm0-6.852c2.14.547 4.14 1.144 5.924 1.765v3.424c-1.784.62-3.784 1.218-5.924 1.765V8.508zM1.464 12c0 5.818 4.717 10.536 10.536 10.536S22.536 17.818 22.536 12 17.818 1.464 12 1.464 1.464 6.182 1.464 12z" />
      </svg>
    ),
    color: "hover:border-[#0037AE] hover:shadow-[0_0_20px_rgba(0,55,174,0.6)] hover:text-[#0037AE]"
  },
  {
    id: "Xbox",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.004 21.785c-1.554-.153-2.924-.62-4.148-1.424-1.127-.738-1.928-1.58-2.603-2.735-.436-.744-.82-1.745-1.004-2.613-.257-1.218-.21-2.91.124-4.113.36-1.306.995-2.485 1.905-3.542.85-.986 1.954-1.803 3.195-2.36.942-.424 2.214-.724 3.32-.782 1.5-.078 2.87.147 4.195.69 1.155.474 2.274 1.282 3.13 2.26.856.977 1.46 2.062 1.77 3.19.255.932.32 2.652.138 3.6-.264 1.36-.833 2.593-1.683 3.64-.812.998-1.874 1.83-3.1 2.454-1.385.704-2.88 1.053-4.464 1.053-.284 0-.54-.012-.775-.028zm1.196-4.57c.606-.05 1.4-.2 2.12-.41.214-.063.36-.1.32-.08-.57.302-1.282.6-1.896.8-.577.186-.684.21-.59.13l.046-.44zm-2.448-.008c-.035.163-.075.365-.088.448l.1.004c.594-.183 1.258-.456 1.786-.735.034-.02-.09.014-.276.074-.69.222-1.144.298-1.52.208z" />
      </svg>
    ),
    color: "hover:border-[#107C10] hover:shadow-[0_0_20px_rgba(16,124,16,0.6)] hover:text-[#107C10]"
  },
  { id: "Mobile", icon: <Smartphone size={18} />, color: "hover:border-compete-purple hover:shadow-[0_0_15px_rgba(155,92,255,0.3)]" },
];

import { createClient } from "@/supabase/client";

export default function CreateChallenge() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gameName: "",
    entryFee: "",
    platform: "PC",
    gamerId: "" // Gamer ID field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Identity Validation Check
    if (!form.gamerId.trim()) {
      toast.error("IDENTITY REQUIRED: Enter your Gamer ID");
      setLoading(false);
      return;
    }

    try {
      const entryFee = parseFloat(form.entryFee);
      const prizePool = entryFee * 1.8; // 10% rake each side (entry * 2 * 0.9 = entry * 1.8)

      const { data: challengeId, error } = await supabase.rpc('create_challenge_with_escrow', {
        p_game_name: form.gameName,
        p_platform: form.platform,
        p_entry_fee: entryFee,
        p_prize_pool: prizePool
      });

      if (error) {
        if (error.message.includes('Insufficient vault credits')) {
          toast.error("INSUFFICIENT VAULT CREDITS");
        } else {
          throw error;
        }
        return;
      }

      toast.success("CHALLENGE DEPLOYED: Identity Verified");
      router.push("/lobby");
    } catch (error) {
      console.error("Create Challenge Error:", error);
      toast.error("DEPLOYMENT FAILED: SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-xl mx-auto pt-12 pb-20">
        <Link href="/lobby" className="flex items-center gap-2 text-white/30 hover:text-compete-purple transition-all mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Lobby</span>
        </Link>

        <header className="mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            Host <span className="text-compete-purple text-glow">Challenge</span>
          </h1>
          <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-2">Define the stakes. Rule the arena.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-neutral-900/50 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-compete-purple to-transparent opacity-50" />

          {/* GAME SELECT */}
          <div>
            <label className="text-[10px] font-black uppercase text-compete-purple tracking-[0.3em] mb-4 block">Select Title</label>
            <input
              required
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl outline-none focus:border-compete-purple transition-all italic font-bold placeholder:text-white/10"
              placeholder="e.g., Call of Duty: Warzone"
              value={form.gameName}
              onChange={(e) => setForm({ ...form, gameName: e.target.value })}
            />
          </div>

          {/* GAMER ID (ABIOS SEARCH) */}
          <div>
            <label className="text-[10px] font-black uppercase text-compete-purple tracking-[0.3em] mb-4 flex justify-between">
              <span>Target Gamer ID</span>
              <span className="text-white/20 font-mono">ABIOS SYNC</span>
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input
                required
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-compete-purple transition-all font-bold uppercase tracking-widest text-xs"
                placeholder="USERNAME#1234"
                value={form.gamerId}
                onChange={(e) => setForm({ ...form, gamerId: e.target.value })}
              />
            </div>
          </div>

          {/* PLATFORM SELECT */}
          <div>
            <label className="text-[10px] font-black uppercase text-compete-purple tracking-[0.3em] mb-4 block">Platform</label>
            <div className="grid grid-cols-4 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm({ ...form, platform: p.id })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${form.platform === p.id
                      ? 'bg-white text-black border-white shadow-xl scale-105'
                      : `bg-white/5 border-white/10 text-white/40 ${p.color}`
                    }`}
                >
                  {p.icon}
                  <span className="text-[8px] font-black uppercase tracking-tighter">{p.id}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ENTRY FEE */}
          <div>
            <label className="text-[10px] font-black uppercase text-compete-purple tracking-[0.3em] mb-4 block">Entry Fee ($)</label>
            <div className="relative">
              <Sword className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                required
                type="number"
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-xl outline-none focus:border-compete-purple transition-all text-2xl font-black italic"
                placeholder="0.00"
                value={form.entryFee}
                onChange={(e) => setForm({ ...form, entryFee: e.target.value })}
              />
            </div>
            <div className="mt-4 p-4 bg-compete-purple/10 border border-compete-purple/20 rounded-xl flex justify-between items-center group">
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-compete-purple animate-pulse" />
                <span className="text-[9px] font-black uppercase text-compete-purple">Estimated Prize Pool</span>
              </div>
              <span className="text-xl font-black italic text-white group-hover:scale-110 transition-transform">
                ${(parseFloat(form.entryFee || "0") * 1.8).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full h-20 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-compete-purple hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span className="animate-pulse">Verifying ID...</span>
              </>
            ) : (
              <>
                <Trophy size={20} className="group-hover:rotate-12 transition-transform" />
                Deploy Challenge
              </>
            )}
          </button>
        </form>
      </div>
    </main>
  );
}