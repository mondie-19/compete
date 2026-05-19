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
  // Extract color name for hover border class safely
  const borderHoverClass = colorClass.includes('compete-purple') 
    ? 'hover:border-compete-purple/50' 
    : colorClass.includes('green') 
    ? 'hover:border-green-500/50' 
    : colorClass.includes('yellow') 
    ? 'hover:border-yellow-500/50' 
    : colorClass.includes('orange') 
    ? 'hover:border-orange-500/50' 
    : 'hover:border-blue-500/50';

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative w-full text-left bg-transparent border border-white/10 p-4 rounded-none overflow-hidden group ${borderHoverClass} transition-all duration-200`}
    >
      <div className={`absolute -right-4 -top-4 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 ${colorClass}`}>
        {icon}
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-none bg-white/[0.02] border border-white/10 ${colorClass}`}>
            {icon}
          </div>
          <ChevronRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>

        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1 leading-none">
            {title}
          </p>
          <p className={`text-2xl font-black italic uppercase tracking-tighter ${colorClass} leading-tight`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-[8px] font-bold uppercase text-white/30 tracking-widest mt-1 leading-none">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

