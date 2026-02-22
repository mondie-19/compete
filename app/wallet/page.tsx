"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight, ArrowDownLeft, CreditCard, History,
  ShieldCheck, ChevronRight, Wallet, ArrowLeft,
  CheckCircle2, Loader2, Lock
} from "lucide-react";
import Link from "next/link";
// @ts-ignore
import { usePaystackPayment } from "react-paystack";
import { verifyAndAddFunds, requestWithdrawal } from "@/app/actions/wallet";
import { createClient } from "@/supabase/client";

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [rememberCard, setRememberCard] = useState(false);

  // REAL-TIME STATE
  const [balance, setBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState("player@compete.gg");
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const supabase = createClient();

  // 1. INITIAL FETCH & REAL-TIME SUBSCRIPTION
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email) setUserEmail(user.email);

      // Fetch Requests
      const { data: requests } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("created_at", { ascending: false });
      setWithdrawalHistory(requests || []);

      // Initial Fetch
      const { data } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (data) setBalance(data.balance);

      // Subscribe to changes on the profiles table for THIS user
      const channel = supabase
        .channel(`wallet-updates-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`
          },
          (payload) => {
            setBalance(payload.new.balance);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    fetchAndSubscribe();
  }, [supabase]);

  // Paystack Config
  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: parseFloat(amount || "0") * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key",
    metadata: { remember_card: rememberCard }
  };

  const initializePayment = usePaystackPayment(config);

  const handleTransaction = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setStatus("processing");

    if (activeTab === "deposit") {
      initializePayment(
        async (ref: any) => {
          try {
            const result = await verifyAndAddFunds(ref.reference, parseFloat(amount));
            if (result.success) {
              setStatus("success");
              setTimeout(() => { setStatus("idle"); setAmount(""); }, 3000);
            } else {
              setStatus("idle");
              alert(result.error || "Verification failed");
            }
          } catch (err) {
            setStatus("idle");
            console.error(err);
          }
        },
      );
    } else {
      // Withdrawal Logic (New Request System)
      requestWithdrawal(parseFloat(amount)).then((result) => {
        if (result.success) {
          setStatus("success");
          setTimeout(() => { setStatus("idle"); setAmount(""); }, 3000);
          // Optimistically update history locally or wait for real-time
        } else {
          setStatus("idle");
          // @ts-ignore
          alert(result.error || "Withdrawal request failed");
        }
      }).catch((err) => {
        setStatus("idle");
        console.error(err);
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-white pb-24 overflow-x-hidden font-sans">
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          >
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-8">
              <CheckCircle2 size={100} className="text-compete-purple mx-auto mb-6" />
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Vault <span className="text-compete-purple">Secured</span></h2>
              <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">Transaction Processed Successfully</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="fixed top-0 left-0 z-50 p-6 pointer-events-none w-full flex justify-between">
        <div className="pointer-events-auto flex flex-col gap-1">
          <Link href="/lobby" className="flex items-center gap-2 text-white/30 hover:text-compete-purple transition-colors mb-2">
            <ArrowLeft size={14} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Exit Terminal</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-compete-purple flex items-center justify-center shadow-[0_0_20px_rgba(155,92,255,0.3)]">
              <Wallet size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter leading-none">
                Compete <span className="text-compete-purple">Vault</span>
              </h1>
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Auth Required</p>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-32 px-4 space-y-6 max-w-2xl mx-auto">
        {/* UPDATED BALANCE CARD WITH REAL DATA */}
        <section className="relative overflow-hidden bg-gradient-to-br from-compete-purple to-purple-900 p-8 rounded-[32px] shadow-purple-glow border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-1">Total Available</p>
          <h2 className="text-6xl font-black italic tracking-tighter">
            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <div className="mt-8">
            <div className="inline-block px-3 py-1 rounded-full bg-black/20 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/80">Platinum Member</div>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none rotate-12"><Wallet size={160} /></div>
        </section>

        <div className="flex bg-neutral-900/50 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-sm">
          <button onClick={() => setActiveTab("deposit")} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white text-black shadow-lg' : 'text-white/30'}`}>Deposit</button>
          <button onClick={() => setActiveTab("withdraw")} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white text-black shadow-lg' : 'text-white/30'}`}>Withdraw</button>
        </div>

        <section className="bg-neutral-900 border border-white/10 rounded-[32px] p-8 shadow-2xl">
          <div className="space-y-8">
            <div>
              <label className="text-[10px] font-black uppercase text-compete-purple mb-4 block tracking-[0.3em]">Amount to {activeTab}</label>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-black italic text-white/10">$</span>
                <input
                  type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00"
                  className="w-full bg-transparent border-b border-white/10 py-4 pl-8 text-6xl font-black italic outline-none focus:border-compete-purple transition-all placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#011b33] flex items-center justify-center border border-[#09a5db]/20"><CreditCard size={18} className="text-[#09a5db]" /></div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase tracking-widest">Paystack Gateway</span>
                    <span className="text-[8px] text-white/20 font-bold uppercase tracking-tight">Encrypted Transaction</span>
                  </div>
                </div>
                <Lock size={14} className="text-white/10" />
              </div>

              <div className="flex items-center justify-between px-2 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Remember for next time</span>
                  <span className="text-[8px] text-white/20 uppercase font-bold tracking-tight">Tokenized secure storage</span>
                </div>
                <button onClick={() => setRememberCard(!rememberCard)} className={`w-11 h-6 rounded-full transition-all relative ${rememberCard ? 'bg-compete-purple' : 'bg-white/10'}`}>
                  <motion.div animate={{ x: rememberCard ? 22 : 4 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                </button>
              </div>
            </div>

            <button onClick={handleTransaction} disabled={status !== "idle" || !amount} className="w-full h-20 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] italic hover:bg-compete-purple hover:text-white transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              <AnimatePresence mode="wait">
                {status === "idle" ? <motion.span key="id">Execute {activeTab}</motion.span> : <motion.div key="pr" className="flex items-center gap-3"><Loader2 className="animate-spin" size={20} /> Authorizing</motion.div>}
              </AnimatePresence>
            </button>
          </div>
        </section>
        <section className="bg-neutral-900 border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden">
          <h3 className="text-[10px] font-black uppercase text-white/30 mb-6 tracking-[0.3em] flex items-center gap-2">
            <History size={14} className="text-compete-purple" /> Request Protocol History
          </h3>
          <div className="space-y-4">
            {withdrawalHistory.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-white/10 tracking-widest">No Previous Uplinks</p>
              </div>
            ) : (
              withdrawalHistory.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                  <div>
                    <p className="text-sm font-black italic uppercase tracking-tighter">${req.amount}</p>
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                      req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 animate-pulse'
                    }`}>
                    {req.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}