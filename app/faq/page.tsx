"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, Mail, MessageCircle, PhoneCall, ShieldCheck, Clock, Headphones } from "lucide-react";

// --- FAQ COMPONENT (Moved inside to fix import error) ---
function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const faqs = [
    {
      question: "How do I join a tournament?",
      answer: "Simply click 'Start Your Journey' or 'Join' on any active tournament card. You'll need to link your game ID (Steam, Riot, etc.) to participate.",
    },
    {
      question: "Is there a entry fee for games?",
      answer: "We offer both 'Free-to-Play' tournaments and 'High-Stakes' arenas. Entry fees for stakes games are handled via our secure encrypted wallet system.",
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
          Frequent <span className="text-compete-purple">Questions</span>
        </h2>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-xl border border-white/5 bg-compete-card/20 overflow-hidden">
            <button onClick={() => setActiveIndex(activeIndex === index ? null : index)} className="w-full flex items-center justify-between p-5 text-left">
              <span className="font-bold text-white">{faq.question}</span>
              {activeIndex === index ? <Minus size={16} className="text-compete-purple" /> : <Plus size={16} className="text-compete-muted" />}
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="px-5 pb-5 text-compete-muted text-sm border-t border-white/5 pt-4">
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
  const supportMethods = [
    {
      title: "Direct Helpline",
      contact: "+1 (800) COMPETE",
      desc: "Instant connection for urgent tournament disputes or account lockouts.",
      workflow: "Live Agent → Verification → Resolution",
      icon: <PhoneCall className="text-green-400" />,
      time: "24/7 Availability"
    },
    {
      title: "Email Support",
      contact: "support@compete.gg",
      desc: "Best for technical bugs, partnership inquiries, or general feedback.",
      workflow: "Ticket Issued → Dev Review → Detailed Response",
      icon: <Mail className="text-blue-400" />,
      time: "2-4 Hour Response"
    },
    {
      title: "Social Support",
      contact: "@CompeteHQ",
      desc: "Quick questions regarding platform status or community events.",
      workflow: "DM Sent → Social Mod Review → Direct Fix",
      icon: <MessageCircle className="text-compete-purple" />,
      time: "10am - 10pm EST"
    }
  ];

  return (
    <main className="min-h-screen bg-black px-4">
      <div className="h-20" /> 
      <FAQ />
      
      <section className="max-w-7xl mx-auto py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Our <span className="text-compete-purple">Resolution</span> Process
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {supportMethods.map((method, i) => (
            <div key={i} className="bg-compete-card/20 border border-white/5 p-8 rounded-2xl">
              <div className="mb-6">{method.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">{method.title}</h3>
              <p className="text-compete-purple text-sm font-mono mb-4">{method.contact}</p>
              <p className="text-compete-muted text-sm mb-6 leading-relaxed">{method.desc}</p>
              <div className="space-y-3 bg-white/5 p-4 rounded-xl">
                <p className="text-[10px] font-black uppercase text-white/40">The Workflow</p>
                <p className="text-xs font-bold text-white/80">{method.workflow}</p>
                <p className="text-xs font-bold text-compete-purple">{method.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}