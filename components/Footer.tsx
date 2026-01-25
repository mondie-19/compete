"use client";
import React from "react";
import Link from "next/link";
import { ChevronUp } from "lucide-react";
import { usePathname } from "next/navigation"; // 1. Import the hook

export default function Footer() {
  const pathname = usePathname(); // 2. Get the current route

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3. Conditional return: Hide footer on the coming-soon page
  if (pathname === "/coming-soon") return null;

  return (
    <footer className="relative w-full bg-black border-t border-white/5 text-compete-muted p-8 mt-20 overflow-hidden z-50">
      
      {/* Background Particles Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 10}s`,
              background: i % 2 === 0 ? '#9B5CFF' : 'white'
            } as any}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        
        {/* Logo and Copyright Section */}
        <aside className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-5 w-5 rounded-sm bg-compete-purple rotate-45 shadow-[0_0_10px_#9B5CFF] group-hover:scale-110 transition-transform" />
            <span className="text-xl font-black tracking-tighter text-white">COMPETE</span>
          </Link>
          <p className="text-xs font-bold tracking-widest uppercase text-compete-muted">
            © {new Date().getFullYear()}
          </p>
        </aside>

        {/* Navigation & Back to Top */}
        <div className="flex gap-10 items-center">
          <nav className="flex gap-6 items-center border-r border-white/10 pr-10">
            <FooterIcon path="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
            <FooterIcon path="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
          </nav>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white hover:text-compete-purple transition-all"
          >
            Top
            <div className="p-2 rounded bg-white/5 border border-white/10 group-hover:border-compete-purple group-hover:shadow-purple-glow transition-all">
              <ChevronUp size={14} />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}

function FooterIcon({ path }: { path: string }) {
  return (
    <a href="#" className="hover:text-compete-purple transition-all duration-300 transform hover:scale-110">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="fill-current">
        <path d={path} />
      </svg>
    </a>
  );
}