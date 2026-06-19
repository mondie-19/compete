import type { Metadata } from "next";
import { Chakra_Petch, Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from 'sonner';
import { Analytics } from "@vercel/analytics/next";

const chakraPetch = Chakra_Petch({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chakra',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Compete",
  description: "The ultimate competitive platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${chakraPetch.variable}`}>
      <body className="relative min-h-screen bg-compete-bg text-compete-text overflow-x-hidden font-mono">
        {/* Navbar */}
        <Navbar />

        {/* Global Noise Overlay */}
        <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-5 mix-blend-overlay">
          <svg className="h-full w-full">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Background Effects */}
        <div className="pointer-events-none fixed inset-0 z-0">
          {/* Purple Glow Top */}
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-compete-purple opacity-30 blur-[160px]" />

          {/* Purple Glow Bottom */}
          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-compete-purpleGlow opacity-25 blur-[140px]" />

          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        {/* App Content */}
        <main className="relative">
          {children}
        </main>

        {/* Footer */}
        <Footer />

        {/* Notification Toasts */}
        <Toaster theme="dark" position="bottom-right" richColors closeButton />

        <Analytics />
      </body>
    </html>
  );
}