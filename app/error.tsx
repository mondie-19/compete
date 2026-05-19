"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Runtime exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-6 font-mono">
      <div className="max-w-md w-full bg-[#0F0F16]/60 border border-white/10 rounded-2xl p-8 text-center space-y-6 backdrop-blur-md">
        <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black tracking-[0.2em] rounded-full">
          STATUS: RUNTIME_FAULT
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-wider italic">
            SYSTEM_EXCEPTION
          </h1>
          <p className="text-xs text-white/50 leading-relaxed max-w-xs mx-auto truncate">
            {error.message || "A critical runtime error has occurred."}
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-black hover:bg-transparent hover:text-white border border-white text-xs font-black tracking-[0.15em] rounded-full transition-all cursor-pointer"
          >
            <RefreshCw size={14} />
            RETRY
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-black tracking-[0.15em] rounded-full transition-all"
          >
            <ArrowLeft size={14} />
            VAULT
          </Link>
        </div>
      </div>
    </div>
  );
}
