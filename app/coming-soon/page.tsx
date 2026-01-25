"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, Wallet, ArrowRight, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API logic
    setTimeout(() => {
      toast.success("SYSTEM: Identity logged. Welcome to the elite.");
      setEmail("");
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="text-white selection:bg-compete-purple min-h-screen overflow-hidden relative font-sans">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-compete-purple opacity-20 blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 border border-compete-purple/30 rounded-full bg-compete-purple/10 text-compete-purple text-[10px] font-black tracking-[0.3em] uppercase">
            <Gamepad2 size={14} />
            The Future of Amateur Gaming
          </div>
          
          <h1 className="text-7xl md:text-9xl font-black mb-6 tracking-tighter italic uppercase text-glow">
            COMPETE
          </h1>
          
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop playing for nothing. Stake your skills and <span className="text-white font-bold italic text-glow">earn like a pro</span>.
          </p>

          <form 
            onSubmit={handleSubscribe}
            className="flex flex-col md:flex-row gap-4 w-full max-w-lg mx-auto p-2 bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <input 
              type="email" 
              required
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-6 py-4 text-white outline-none placeholder:text-white/20 text-sm font-bold uppercase tracking-widest"
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-compete-purple hover:text-white transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? "Syncing..." : "Get Early Access"}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            Join <span className="text-compete-purple text-glow font-mono text-xs">1,402</span> gamers already on the list.
          </p>
        </motion.div>

        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-6xl w-full"
        >
          <FeatureCard title="Fair Matchmaking" desc="Our AI ensures you only stake against players at your exact skill level." />
          <FeatureCard title="Instant Payouts" desc="Wins are verified automatically. Earnings hit your wallet instantly." />
          <FeatureCard title="Secure Staking" desc="Funds are held in secure escrow. Compete with confidence." />
        </motion.section>
      </main>

      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="particle absolute bg-compete-purple rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animationDuration: `${Math.random() * 10 + 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:border-compete-purple/30 transition-all">
      <h3 className="text-sm font-black italic uppercase tracking-tighter mb-2 text-white/80">{title}</h3>
      <p className="text-[10px] text-white/30 leading-relaxed font-medium uppercase tracking-widest">{desc}</p>
    </div>
  );
}