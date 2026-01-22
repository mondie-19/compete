"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Chrome } from "lucide-react"; // Changed Github to Chrome
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/supabase/client"; // Ensure this util exists

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // --- GOOGLE AUTH LOGIC ---
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) console.error("Google Auth Error:", error.message);
  };

  const handleAuth = () => {
    // Basic mock auth - replace with real supabase signup/login later
    localStorage.setItem("isLoggedIn", "true");
    onClose();
    router.push('/lobby');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        // Increased z-index to z-[100] to sit above navbars (usually z-40 or z-50)
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative z-[110] w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-compete-card p-8 shadow-purple-glow"
          >
            <button onClick={onClose} className="absolute right-6 top-6 text-compete-muted hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
                {isLogin ? "Welcome Back" : "Join the Elite"}
              </h2>
              <p className="text-compete-muted text-sm mt-1 uppercase font-bold tracking-widest">
                {isLogin ? "Enter the Arena" : "Create your Legend"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-compete-muted" size={18} />
                  <input type="text" placeholder="Username" className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-12 text-white outline-none focus:border-compete-purple transition-all" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-compete-muted" size={18} />
                <input type="email" placeholder="Email Address" className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-12 text-white outline-none focus:border-compete-purple transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-compete-muted" size={18} />
                <input type="password" placeholder="Password" className="w-full rounded-xl bg-white/5 border border-white/10 p-4 pl-12 text-white outline-none focus:border-compete-purple transition-all" />
              </div>

              <button 
                onClick={handleAuth}
                className="w-full rounded-xl bg-compete-purple py-4 font-black uppercase tracking-[0.2em] text-white shadow-purple-glow hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLogin ? "Sign In" : "Register Now"}
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-4">
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="mx-4 text-[10px] font-black uppercase text-compete-muted tracking-widest">Or Secure Entry Via</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* GOOGLE BUTTON */}
              <button 
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white p-4 text-black font-black uppercase tracking-widest text-xs hover:bg-compete-purple hover:text-white transition-all group"
              >
                <Chrome size={18} className="group-hover:rotate-12 transition-transform" /> 
                Google Account
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-compete-muted font-bold uppercase tracking-widest">
              {isLogin ? "New Recruit?" : "Already Registered?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-compete-purple hover:text-white transition-colors"
              >
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}