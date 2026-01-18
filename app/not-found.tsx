"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-compete-bg flex items-center justify-center px-4 overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-compete-purple"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center max-w-2xl"
      >
        {/* 404 Display */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mb-8"
        >
          <div className="text-9xl md:text-[150px] font-black text-compete-purple drop-shadow-[0_0_40px_rgba(155,92,255,0.8)]">
            404
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
            Level Not Found
          </h1>
          <p className="text-lg text-compete-muted mb-8">
            Looks like you&apos;ve ventured into unexplored territory. The arena you&apos;re searching for doesn&apos;t exist.
          </p>
        </motion.div>

        {/* Game-style stats box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-compete-card/50 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm"
        >
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-compete-muted text-sm uppercase tracking-widest">Status</p>
              <p className="text-2xl font-bold text-white">Game Over</p>
            </div>
            <div>
              <p className="text-compete-muted text-sm uppercase tracking-widest">Result</p>
              <p className="text-2xl font-bold text-red-500">Defeat</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-full bg-gradient-to-r from-compete-purple to-compete-purpleGlow"
            />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/"
            className="btn-glow px-8 py-3 bg-compete-purple text-white font-bold uppercase tracking-widest rounded-full inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Return Home
          </Link>
          <Link
            href="/tournaments"
            className="px-8 py-3 bg-white/5 text-white font-bold uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors border border-white/10"
          >
            View Tournaments
          </Link>
        </motion.div>

        {/* Easter egg message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1 }}
          className="text-compete-muted text-xs mt-12 uppercase tracking-widest"
        >
          Hint: Try heading back to the main stage to regroup...
        </motion.p>
      </motion.div>
    </div>
  );
}
