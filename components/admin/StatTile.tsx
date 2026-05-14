"use client";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ReactNode } from "react";

interface StatTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  colorClass: string;
  onClick: () => void;
}

export function StatTile({ title, value, subtitle, icon, colorClass, onClick }: StatTileProps) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full text-left bg-neutral-900 border border-white/5 p-6 rounded-[2rem] overflow-hidden group hover:border-${colorClass.split('-')[1]}/30 transition-all`}
    >
      <div className={`absolute -right-6 -top-6 opacity-5 rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 ${colorClass}`}>
        {icon}
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-8">
          <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${colorClass}`}>
            {icon}
          </div>
          <ChevronRight size={20} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
            {title}
          </p>
          <p className={`text-4xl font-black italic uppercase tracking-tighter ${colorClass}`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[10px] font-bold uppercase text-white/30 tracking-widest mt-2">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}
