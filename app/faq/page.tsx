"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Minus, Mail, MessageCircle, PhoneCall,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

// --- FAQ COMPONENT ---
function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Compete, and how does it work?",
      answer: "Compete is a peer-to-peer skill wagering arena. You deposit funds, deploy a match at your chosen stake, and a live opponent accepts the challenge. The winner's payout is processed automatically the moment the result is verified — no house cut, no middlemen, no waiting. Pure mechanical skill, real cash return.",
    },
    {
      question: "How do I deploy a match and set my wager?",
      answer: "Head to the Deploy page, select your game and platform, enter your in-game ID, and set your wager amount. Your stake enters escrow immediately. Once an opponent joins and confirms their ID, the match goes live. After the game, both sides submit their result. Matching reports trigger instant payout — dispute triggers a moderator review.",
    },
    {
      question: "How fast are winnings paid out after a match?",
      answer: "Instant. When both players submit matching results, the prize pool is released to the winner's Compete wallet automatically — no manual review required. From there, you can withdraw to M-Pesa or bank at any time via the Vault. Withdrawals are processed within minutes, not days.",
    },
    {
      question: "What happens if my opponent disputes the result?",
      answer: "Every disputed match is escalated to our moderator team with both players' submitted proof — screenshots, clips, or scoreboard captures. A live moderator reviews the evidence and issues a binding resolution. Repeat false disputes result in account action. The system is designed to protect honest competitors, not reward bad faith.",
    },
    {
      question: "How is my money kept safe inside the platform?",
      answer: "Your balance is held in a secure escrow system — never pooled with operational funds. Wager amounts are locked from both players the moment a match is accepted, so neither side can pull out mid-game. All transactions are logged immutably. Payments are processed through Paystack, a licensed payment infrastructure operating across Africa and beyond.",
    },
    {
      question: "What games and platforms are supported?",
      answer: "Compete supports titles across PC, console, and mobile. Current roster includes: Call of Duty: Warzone, Apex Legends, Fortnite, EA FC 26, NBA 2K26, Clash Royale, Rocket League, and more. Platform support covers PlayStation, Xbox, and PC. If your title isn't listed, reach out — we expand the roster based on community demand.",
    },
    {
      question: "How does the ranking and XP system work?",
      answer: "Every resolved match earns or costs XP — +10 for a win, -3 for a loss. XP drives your level (1–300) and determines your position on the global leaderboard. Your rank is updated in real time after every result. The top of the leaderboard reflects the most consistently dominant players, not just the highest spenders.",
    },
    {
      question: "Where is Compete available, and who can join?",
      answer: "Compete is open globally with a strong footprint across Africa — Kenya, Nigeria, Ghana, South Africa, Tanzania, Uganda, and growing. Any player with a verified account, a funded wallet, and a compatible game can enter the arena. No regional lock-outs. One global leaderboard. Compete where you are.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
          Frequent <span className="text-compete-purple">Questions</span>
        </h2>
        <p className="text-compete-muted mt-2 uppercase tracking-widest font-bold text-[10px]">
          Everything you need to know to dominate the arena
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-xl border border-white/5 bg-compete-card/20 overflow-hidden">
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-3.5 text-left transition-colors hover:bg-white/5"
            >
              <span className="font-bold text-white uppercase tracking-tight text-xs">{faq.question}</span>
              {activeIndex === index ? <Minus size={14} className="text-compete-purple" /> : <Plus size={14} className="text-compete-muted" />}
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-3.5 pb-3.5 text-compete-muted text-[11px] border-t border-white/5 pt-3 leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function FAQPage() {
  const supabase = createClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const supportMethods = [
    {
      title: "Direct Helpline",
      contact: "+254721776014",
      desc: "Instant connection for urgent tournament disputes or account lockouts.",
      workflow: "Live Agent → Verification → Resolution",
      icon: <PhoneCall className="text-green-400" />,
      time: "24/7 Availability"
    },
    {
      title: "Email Support",
      contact: "competehq@gmail.com",
      desc: "Best for technical bugs, partnership inquiries, or general feedback.",
      workflow: "Ticket Issued → Dev Review → Detailed Response",
      icon: <Mail className="text-blue-400" />,
      time: "2-4 Hour Response"
    },
    {
      title: "Social Support",
      contact: "@CompeteHq",
      desc: "Quick questions regarding platform status or community events.",
      workflow: "DM Sent → Social Mod Review → Direct Fix",
      icon: <MessageCircle className="text-compete-purple" />,
      time: "10am - 10pm EST"
    }
  ];

  return (
    <main className="min-h-screen bg-black px-4 pt-32">
      <FAQ />

      <section className="max-w-7xl mx-auto py-12 border-y border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            Our <span className="text-compete-purple">Resolution</span> Process
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {supportMethods.map((method, i) => (
            <div key={i} className="bg-compete-card/20 border border-white/5 p-5 rounded-2xl hover:border-compete-purple/30 transition-all group">
              <div className="mb-3 transform group-hover:scale-110 transition-transform scale-90">{method.icon}</div>
              <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tighter">{method.title}</h3>
              <p className="text-compete-purple text-[11px] font-mono mb-2">{method.contact}</p>
              <p className="text-compete-muted text-[11px] mb-4 leading-relaxed">{method.desc}</p>
              <div className="space-y-2 bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] font-black uppercase text-white/40">The Workflow</p>
                <p className="text-[10px] font-bold text-white/80">{method.workflow}</p>
                <p className="text-[10px] font-bold text-compete-purple">{method.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MINIMALIST CALL TO ACTION */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-16 text-center">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-compete-purple/50 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-compete-purple mb-4 block">
              Final Objective
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
              Enter the <span className="text-glow-sm">Arena.</span>
            </h2>
            <p className="max-w-xl mx-auto text-white/40 text-xs md:text-sm font-medium mb-8 leading-relaxed tracking-wide">
              No fluff. Just high-stakes competition. Join thousands of players
              dominating the global leaderboards today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isLoggedIn ? "/deploy" : "/auth"}
                className="group relative px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-full hover:bg-compete-purple hover:text-white transition-all duration-300 flex items-center gap-2"
              >
                {isLoggedIn ? "Deploy a Match" : "Create Account"}
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href={isLoggedIn ? "/lobby" : "/"}
                className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
              >
                View Live Matches
              </Link>
            </div>
          </motion.div>

          {/* Minimalist Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[carreaux_10px_10px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        </div>
      </section>
    </main>
  );
}