"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, History, Wallet, CheckCircle2, 
  Loader2, Lock, ArrowUpRight, ArrowDownLeft 
} from "lucide-react";
// @ts-ignore
import { usePaystackPayment } from "react-paystack";
import { verifyAndAddFunds, requestWithdrawal } from "@/app/actions/wallet";
import { createClient } from "@/supabase/client";
import { toast } from "sonner";

export default function VaultTab() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");
  const [rememberCard, setRememberCard] = useState(false);

  // REAL-TIME STATE
  const [balance, setBalance] = useState<number>(0);
  const [userEmail, setUserEmail] = useState("player@compete.gg");
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const supabase = createClient();

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: requests } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setWithdrawalHistory(requests || []);
  };

  useEffect(() => {
    const fetchAndSubscribe = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      if (user.email) setUserEmail(user.email);

      fetchHistory();

      const { data } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      if (data) setBalance(data.balance);

      const channel = supabase
        .channel(`vault-updates-${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          setBalance(payload.new.balance);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };

    fetchAndSubscribe();
  }, [supabase]);

  const config = {
    reference: (new Date()).getTime().toString(),
    email: userEmail,
    amount: parseFloat(amount || "0") * 100,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key",
    metadata: { remember_card: rememberCard }
  };

  const initializePayment = usePaystackPayment(config);

  const handleTransaction = () => {
    const numAmount = parseFloat(amount || "0");
    const minAmount = activeTab === 'withdraw' ? 100 : 1;
    
    if (!amount || numAmount < minAmount || numAmount > 50000) {
      toast.error(`Transaction amount out of bounds (${minAmount} - 50,000 Kshs)`);
      return;
    }
    setStatus("processing");

    if (activeTab === "deposit") {
      initializePayment(
        async (ref: any) => {
          try {
            const result = await verifyAndAddFunds(ref.reference, parseFloat(amount));
            if (result.success) {
              setStatus("success");
              fetchHistory();
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
      requestWithdrawal(parseFloat(amount)).then((result) => {
        if (result.success) {
          setStatus("success");
          fetchHistory();
          setTimeout(() => { setStatus("idle"); setAmount(""); }, 3000);
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <AnimatePresence>
        {status === "success" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl rounded-3xl"
          >
            <div className="text-center">
              <CheckCircle2 size={64} className="text-compete-purple mx-auto mb-4" />
              <h2 className="text-2xl font-black italic  tracking-tighter">Vault <span className="text-compete-purple">Secured</span></h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Compact Balance Card */}
          <div className="bg-gradient-to-br from-compete-purple/20 to-black border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-compete-purple/10 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-compete-purple/20 transition-all" />
            <p className="text-[8px] font-black  tracking-[0.3em] text-white/30 mb-1">Available Credits</p>
            <h2 className="text-4xl font-black italic tracking-tighter text-white">
              Kshs {balance.toLocaleString()}
            </h2>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[7px] font-black  tracking-widest text-white/40">Secure Escrow Linked</span>
            </div>
          </div>

          {/* Action Form */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button onClick={() => setActiveTab("deposit")} className={`flex-1 py-2 rounded-lg text-[8px] font-black  tracking-widest transition-all ${activeTab === 'deposit' ? 'bg-white text-black' : 'text-white/20'}`}>Deposit</button>
              <button onClick={() => setActiveTab("withdraw")} className={`flex-1 py-2 rounded-lg text-[8px] font-black  tracking-widest transition-all ${activeTab === 'withdraw' ? 'bg-white text-black' : 'text-white/20'}`}>Withdraw</button>
            </div>

            <div>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-black italic text-white/10 ml-1">Kshs</span>
                <input
                  type="number" value={amount} 
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > 50000) {
                      setAmount("50000");
                      toast.error("Maximum transaction limit is 50,000 Kshs");
                    } else {
                      setAmount(e.target.value);
                    }
                  }} 
                  placeholder="0"
                  min={activeTab === 'withdraw' ? "100" : "1"}
                  max="50000"
                  className="w-full bg-transparent border-b border-white/5 py-4 pl-12 text-4xl font-black italic outline-none focus:border-compete-purple transition-all placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <p className="text-[7px] font-black text-white/20 tracking-widest mt-2">
                Min: {activeTab === 'withdraw' ? '100' : '1'} • Max: 50,000 Kshs
              </p>
            </div>

            <button 
              onClick={handleTransaction} 
              disabled={status !== "idle" || !amount || parseFloat(amount) < (activeTab === 'withdraw' ? 100 : 1) || parseFloat(amount) > 50000} 
              className="w-full py-4 bg-white text-black rounded-xl font-black  tracking-[0.2em] italic hover:bg-compete-purple hover:text-white transition-all disabled:opacity-20 flex items-center justify-center text-[10px]"
            >
              {status === "idle" ? `Execute ${activeTab}` : <Loader2 className="animate-spin" size={16} />}
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white/[0.01] border border-white/5 rounded-3xl p-6 flex flex-col h-[400px]">
          <h3 className="text-[8px] font-black  text-white/20 mb-6 tracking-[0.3em] flex items-center gap-2">
            <History size={12} className="text-compete-purple" /> Request History
          </h3>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {withdrawalHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10">
                <Wallet size={32} className="mb-2" />
                <p className="text-[8px] font-black  tracking-widest">No Activity</p>
              </div>
            ) : (
              withdrawalHistory.map((req) => (
                <button 
                  key={req.id} 
                  onClick={() => {
                    setAmount(req.amount.toString());
                    setActiveTab(req.type === 'deposit' ? 'deposit' : 'withdraw');
                  }}
                  className="w-full flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-white/5 hover:border-compete-purple/30 hover:bg-white/[0.04] transition-all text-left"
                >
                  <div>
                    <p className="text-xs font-black italic text-white tracking-tighter">Kshs {req.amount}</p>
                    <p className="text-[7px] font-black  text-white/20 tracking-widest">{new Date(req.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[6px] font-black  tracking-widest ${
                    req.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                    req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  }`}>
                    {req.status}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
