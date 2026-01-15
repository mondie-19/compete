"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Github } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  const router = useRouter();

const handleAuth = () => {
  // Simulating a login
  onClose();
  router.push('/dashboard');
};

// ... inside your button ...
<button onClick={handleAuth} className="...">Sign In</button>

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-compete-card p-8 shadow-purple-glow"
          >
            <button onClick={onClose} className="absolute right-4 top-4 text-compete-muted hover:text-white">
              <X size={24} />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter">
                {isLogin ? "Welcome Back" : "Join the Elite"}
              </h2>
              <p className="text-compete-muted text-sm mt-1">
                {isLogin ? "Enter your credentials to compete" : "Create your legendary profile"}
              </p>
            </div>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3 text-compete-muted" size={20} />
                  <input type="text" placeholder="Username" className="w-full rounded-lg bg-white/5 border border-white/10 p-3 pl-10 text-white outline-none focus:border-compete-purple transition-all" />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-compete-muted" size={20} />
                <input type="email" placeholder="Email Address" className="w-full rounded-lg bg-white/5 border border-white/10 p-3 pl-10 text-white outline-none focus:border-compete-purple transition-all" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-compete-muted" size={20} />
                <input type="password" placeholder="Password" className="w-full rounded-lg bg-white/5 border border-white/10 p-3 pl-10 text-white outline-none focus:border-compete-purple transition-all" />
              </div>

              <button className="w-full rounded-lg bg-compete-purple py-3 font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(155,92,255,0.4)] hover:scale-[1.02] transition-transform">
                {isLogin ? "Sign In" : "Register Now"}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="mx-4 text-xs uppercase text-compete-muted">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 text-white hover:bg-white/10 transition-all">
                <Github size={20} /> GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-compete-muted">
              {isLogin ? "New to Compete?" : "Already have an account?"}{" "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-compete-purple hover:underline"
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