"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center px-6 font-mono">
      <div className="max-w-md w-full bg-[#0F0F16]/60 border border-white/10 rounded-2xl p-8 text-center space-y-6 backdrop-blur-md">
        <div className="inline-block px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black tracking-[0.2em] rounded-full">
          STATUS: 404_NOT_FOUND
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-black uppercase tracking-wider italic">
            ROUTE_UNAVAILABLE
          </h1>
          <p className="text-xs text-white/50 leading-relaxed">
            The requested sector does not exist or is currently offline.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/lobby"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black hover:bg-transparent hover:text-white border border-white text-xs font-black tracking-[0.15em] rounded-full transition-all"
          >
            <ArrowLeft size={14} />
            RETURN TO LOBBY
          </Link>
        </div>
      </div>
    </div>
  );
}
