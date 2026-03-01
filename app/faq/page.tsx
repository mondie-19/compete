"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, Mail, MessageCircle, PhoneCall, 
  ArrowRight 
} from "lucide-react";

// --- FAQ COMPONENT ---
function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  const faqs = [
    {
      question: "How do I start winning money on Compete?",
      answer: "It costs zero to create your account! Jump onto our web platform to dive into sports, shooters, and mobile hits instantly. We match you against opponents at your exact skill level for a fair fight for glory.",
    },
    {
      question: "What games does Compete offer?",
      answer: "We host the biggest titles in gaming! Sports: Madden NFL 26, EA Sports College Football 26, NBA 2K26, EAFC 26, and MLB The Show 26. Shooters: Apex Legends, Battlefield 6, Fortnite, Call Of Duty: Warzone, and COD Black Ops 7. Strategy: Marvel Rivals, Rocket League, and Clash Royale.",
    },
    {
      question: "How do high-stakes wagers work?",
      answer: "Ready to put your money where your mouth is? Wager whatever you like—from a $5 quick match to a legendary $5,000 showdown! You can even take the ultimate risk and bet on your own performance against the house.",
    },
    {
      question: "How do tournaments work?",
      answer: "The grind never stops with tournaments running every single day! Prove your dominance on Xbox or PlayStation in our free-to-enter events to earn cash without spending a dime. For the elite, the Compete+ Subscription offers exclusive access to premium monthly tournaments with massive prize pools.",
    },
    {
      question: "What if my favorite game isn't listed?",
      answer: "If your favorite title isn't on the list yet, tell us! We are always looking for the next big competitive hit to add to the Compete library.",
    }
  ];

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
          Frequent <span className="text-compete-purple">Questions</span>
        </h2>
        <p className="text-compete-muted mt-4 uppercase tracking-widest font-bold text-xs">
          Everything you need to know to dominate the arena
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="rounded-xl border border-white/5 bg-compete-card/20 overflow-hidden">
            <button 
              onClick={() => setActiveIndex(activeIndex === index ? null : index)} 
              className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
            >
              <span className="font-bold text-white uppercase tracking-tight">{faq.question}</span>
              {activeIndex === index ? <Minus size={16} className="text-compete-purple" /> : <Plus size={16} className="text-compete-muted" />}
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: "auto", opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }} 
                  className="px-5 pb-5 text-compete-muted text-sm border-t border-white/5 pt-4 leading-relaxed"
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
      
      <section className="max-w-7xl mx-auto py-24 border-y border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">
            Our <span className="text-compete-purple">Resolution</span> Process
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {supportMethods.map((method, i) => (
            <div key={i} className="bg-compete-card/20 border border-white/5 p-8 rounded-2xl hover:border-compete-purple/30 transition-all group">
              <div className="mb-6 transform group-hover:scale-110 transition-transform">{method.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tighter">{method.title}</h3>
              <p className="text-compete-purple text-sm font-mono mb-4">{method.contact}</p>
              <p className="text-compete-muted text-sm mb-6 leading-relaxed">{method.desc}</p>
              <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <p className="text-[10px] font-black uppercase text-white/40">The Workflow</p>
                <p className="text-xs font-bold text-white/80">{method.workflow}</p>
                <p className="text-xs font-bold text-compete-purple">{method.time}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MINIMALIST CALL TO ACTION */}
<section className="max-w-5xl mx-auto py-32 px-6">
  <div className="relative group overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-12 md:p-24 text-center">
    
    {/* Subtle Background Accent */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-compete-purple/50 to-transparent" />

    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative z-10"
    >
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-compete-purple mb-6 block">
        Final Objective
      </span>
      
      <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
        Enter the <span className="text-glow-sm">Arena.</span>
      </h2>
      
      <p className="max-w-xl mx-auto text-white/40 text-sm md:text-base font-medium mb-12 leading-relaxed tracking-wide">
        No fluff. Just high-stakes competition. Join thousands of players 
        dominating the global leaderboards today.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        <button className="group relative px-10 py-4 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-full hover:bg-compete-purple hover:text-white transition-all duration-300 flex items-center gap-2">
          Create Account
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <button className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors">
          View Live Matches
        </button>
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