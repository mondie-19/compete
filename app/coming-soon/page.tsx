"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Zap, ArrowRight, Gamepad2, Scale } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/join-waitlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("SYSTEM: Identity logged. Welcome to the elite.");
        setEmail("");
      } else {
        // Handle specific errors like "Already registered!" from the Edge Function
        toast.error(data.message || "Failed to sync identity.");
      }
    } catch (error) {
      toast.error("Connection failed. Check your network.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-white selection:bg-compete-purple min-h-screen overflow-hidden relative font-sans bg-black">
      
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
          {/* PULSATING BRAND LOGO */}
          <div className="flex flex-col items-center mb-8 gap-4">
            <Link href="/" className="flex flex-col items-center gap-6 group">
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 0 20px rgba(155, 92, 255, 0.4)",
                    "0 0 40px rgba(155, 92, 255, 0.8)",
                    "0 0 20px rgba(155, 92, 255, 0.4)"
                  ]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="h-12 w-12 rounded-sm bg-compete-purple rotate-45"
              />
              <motion.span 
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-black tracking-tighter text-white"
              >
                COMPETE
              </motion.span>
            </Link>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 border border-compete-purple/30 rounded-full bg-compete-purple/10 text-compete-purple text-[10px] font-black tracking-[0.3em] uppercase">
            <Gamepad2 size={14} />
            The Future of Amateur Gaming
          </div>
          
          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop playing for nothing. Stake your skills and <span className="text-white font-bold italic text-glow">earn like a pro</span>.
          </p>

          {/* NARROWER INPUT CONTAINER */}
          <form 
            onSubmit={handleSubscribe}
            className="flex flex-col md:flex-row gap-3 w-full max-w-md mx-auto p-1.5 bg-white/[0.03] rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl"
          >
            <input 
              type="email" 
              required
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent px-5 py-3 text-white outline-none placeholder:text-white/20 text-sm font-bold uppercase tracking-widest"
            />
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-compete-purple hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Syncing..." : "Access"}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <p className="mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
            Join <span className="text-compete-purple text-glow font-mono text-xs">1,402</span> gamers already on the list.
          </p>
        </motion.div>

        {/* FEATURE CARDS */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
        >
          <FeatureCard 
            icon={<Scale size={20} className="text-compete-purple" />}
            title="Fair Matchmaking" 
            desc="Our AI ensures you only stake against players at your exact skill level." 
          />
          <FeatureCard 
            icon={<Zap size={20} className="text-compete-purple" />}
            title="Instant Payouts" 
            desc="Wins are verified automatically. Earnings hit your wallet instantly." 
          />
          <FeatureCard 
            icon={<Shield size={20} className="text-compete-purple" />}
            title="Secure Staking" 
            desc="Funds are held in secure escrow. Compete with confidence." 
          />
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

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:border-compete-purple/30 transition-all group">
      <div className="mb-4 bg-white/5 w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-compete-purple/20 transition-all">
        {icon}
      </div>
      <h3 className="text-sm font-black italic uppercase tracking-tighter mb-2 text-white/80">{title}</h3>
      <p className="text-[10px] text-white/30 leading-relaxed font-medium uppercase tracking-widest">{desc}</p>
    </div>
  );
}