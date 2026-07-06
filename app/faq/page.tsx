"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Minus, Mail, MessageCircle, PhoneCall,
  ArrowRight, CheckCircle2, Loader2,
} from "lucide-react";
import Radio from "@/components/Radio";
import Link from "next/link";

// --- FAQ ACCORDION ---
function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is Compete, and how does it work?",
      answer: "Compete is a peer-to-peer skill wagering platform. Deposit funds, deploy a match at your chosen stake, and a live opponent accepts the challenge. The winner's payout is processed the moment the result is verified — no house cut, no middlemen.",
    },
    {
      question: "How do I deploy a match and set my wager?",
      answer: "Head to the Deploy page, select your game and platform, enter your in-game ID, and set your wager amount. Your stake enters escrow immediately. Once an opponent joins and confirms their ID, the match goes live.",
    },
    {
      question: "How fast are winnings paid out after a match?",
      answer: "Instantly. When both players submit matching results, the prize pool is released to the winner's Compete wallet automatically. From there, you can withdraw to M-Pesa or bank at any time via the Vault.",
    },
    {
      question: "What happens if my opponent disputes the result?",
      answer: "Disputed matches are escalated to our moderator team with both players' submitted proof — screenshots or scoreboard captures. A moderator reviews the evidence and issues a binding resolution. Repeat false disputes result in account action.",
    },
    {
      question: "How is my money kept safe inside the platform?",
      answer: "Your balance is held in a secure escrow system — never pooled with operational funds. Wager amounts are locked from both players the moment a match is accepted. All transactions are logged, and payments are processed through Paystack.",
    },
    {
      question: "What games and platforms are supported?",
      answer: "Currently supported: EA FC 26, PES 26, and PUBG on PC, PlayStation, and Xbox. On mobile: CODM, PUBG, and PES. Nintendo Switch support is coming soon. Suggest a game or platform below — we expand the roster based on community requests.",
    },
    {
      question: "How does the ranking and XP system work?",
      answer: "Every resolved match earns or costs XP — +10 for a win, -3 for a loss. XP drives your level (1–300) and your position on the leaderboard. Rankings are updated in real time after every result.",
    },
    {
      question: "Where is Compete available?",
      answer: "Compete is open globally with a strong presence across Africa — Kenya, Nigeria, Ghana, South Africa, Tanzania, Uganda, and growing. Any player with a verified account and a funded wallet can enter the arena. One global leaderboard.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
          Frequent <span className="text-compete-purple">Questions</span>
        </h2>
        <p className="text-compete-muted mt-2 uppercase tracking-widest font-bold text-[10px]">
          Everything you need to know to get started
        </p>
      </div>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-xl border border-white/5 bg-compete-card/20 overflow-hidden">
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
            >
              <span className="font-bold text-white uppercase tracking-tight text-xs pr-4">{faq.question}</span>
              {activeIndex === index
                ? <Minus size={14} className="text-compete-purple shrink-0" />
                : <Plus size={14} className="text-compete-muted shrink-0" />}
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 text-compete-muted text-[12px] border-t border-white/5 pt-3 leading-relaxed"
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

// --- FEEDBACK FORM ---
const FEEDBACK_CATEGORIES = [
  { value: "game",     label: "Game" },
  { value: "platform", label: "Platform" },
  { value: "bug",      label: "Bug Report" },
  { value: "feedback", label: "Feedback" },
];

const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  game:     "e.g. Add Valorant on PC — it has a huge competitive scene...",
  platform: "e.g. Add PS5 support — lots of players in Kenya have consoles...",
  bug:      "Describe what went wrong and how to reproduce it...",
  feedback: "What would make Compete better for you?",
};

const CATEGORY_LABELS: Record<string, string> = {
  game:     "Suggest a Game",
  platform: "Suggest a Platform",
  bug:      "Report a Bug",
  feedback: "General Feedback",
};

function FeedbackForm() {
  const [category, setCategory] = useState("game");
  const [message, setMessage]   = useState("");
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: message.trim(), email: email.trim() || null }),
      });
      if (res.ok) {
        setDone(true);
      } else {
        const body = await res.json();
        setError(body.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-compete-purple/10 border border-compete-purple/30 flex items-center justify-center mb-6">
          <CheckCircle2 size={24} className="text-compete-purple" />
        </div>
        <div className="text-[9px] font-black tracking-[0.4em] text-compete-purple uppercase mb-3">Received</div>
        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-2">Thank you.</h3>
        <p className="text-[12px] text-white/40 max-w-xs leading-relaxed mb-6">
          We review every submission. If you left your email, you&apos;ll hear from us when your suggestion goes live.
        </p>
        <button
          onClick={() => { setDone(false); setMessage(""); setEmail(""); }}
          className="text-[9px] font-black tracking-widest text-compete-purple hover:text-white transition-colors uppercase"
        >
          Submit another →
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Category selector */}
      <div className="flex justify-center mb-6">
        <Radio
          name="feedback-category"
          options={FEEDBACK_CATEGORIES}
          value={category}
          onChange={(v) => { setCategory(v); setMessage(""); }}
        />
      </div>

      {/* Message */}
      <div className="space-y-1 mb-4">
        <label className="text-[9px] font-black tracking-widest text-white/40 uppercase ml-1">
          {CATEGORY_LABELS[category]}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={CATEGORY_PLACEHOLDERS[category]}
          rows={4}
          className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-xs text-white placeholder:text-white/15 font-medium leading-relaxed resize-none outline-none focus:border-compete-purple/40 transition-colors"
        />
      </div>

      {/* Email */}
      <div className="space-y-1 mb-6">
        <label className="text-[9px] font-black tracking-widest text-white/40 uppercase ml-1">
          Your email <span className="text-white/20 font-medium normal-case tracking-normal">— optional, get notified when it&apos;s live</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder:text-white/15 font-medium outline-none focus:border-compete-purple/40 transition-colors"
        />
      </div>

      {error && (
        <p className="text-[11px] text-red-400 mb-4 ml-1">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !message.trim()}
        className="w-full py-3.5 rounded-full bg-compete-purple text-white text-[10px] font-black tracking-[0.2em] uppercase transition-all hover:bg-compete-purple/80 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading
          ? <><Loader2 size={12} className="animate-spin" /> Sending...</>
          : "Submit"}
      </button>
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
      time: "2–4 Hour Response"
    },
    {
      title: "Social Support",
      contact: "@CompeteHq",
      desc: "Quick questions regarding platform status or community events.",
      workflow: "DM Sent → Social Mod Review → Direct Fix",
      icon: <MessageCircle className="text-compete-purple" />,
      time: "10am – 10pm EAT"
    }
  ];

  return (
    <main className="min-h-screen bg-black px-4 pt-32">

      {/* FAQ Accordion */}
      <FAQ />

      {/* Support methods */}
      <section className="max-w-7xl mx-auto py-12 border-y border-white/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter">
            Our <span className="text-compete-purple">Support</span> Channels
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
                <p className="text-[9px] font-black uppercase text-white/40">Workflow</p>
                <p className="text-[10px] font-bold text-white/80">{method.workflow}</p>
                <p className="text-[10px] font-bold text-compete-purple">{method.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feedback / suggestions form */}
      <section className="max-w-7xl mx-auto py-16 border-b border-white/5">
        <div className="text-center mb-10">
          <span className="text-[9px] font-black tracking-[0.4em] text-compete-purple uppercase block mb-3">
            Community Roadmap
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tighter mb-3">
            Shape the <span className="text-compete-purple">Arena</span>
          </h2>
          <p className="text-white/40 text-xs max-w-md mx-auto leading-relaxed">
            Want a game added? Found a bug? Have an idea? Every submission goes directly to the team.
            We build what the community asks for.
          </p>
        </div>
        <FeedbackForm />
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-8 md:p-16 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-compete-purple/50 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.5em] text-compete-purple mb-4 block">
              Ready?
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-4">
              Enter the Arena.
            </h2>
            <p className="max-w-xl mx-auto text-white/40 text-xs md:text-sm font-medium mb-8 leading-relaxed tracking-wide">
              High-stakes competition with real cash payouts. Join players dominating the global leaderboards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={isLoggedIn ? "/deploy" : "/auth"}
                className="group px-8 py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-full hover:bg-compete-purple hover:text-white transition-all duration-300 flex items-center gap-2"
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
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }}
          />
        </div>
      </section>

    </main>
  );
}
