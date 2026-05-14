"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Headphones, Users, Search, Ban, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UserManagementDetailProps {
  users: any[];
}

export function UserManagementDetail({ users }: UserManagementDetailProps) {
  const [activeTab, setActiveTab] = useState<'client' | 'moderator' | 'customer_care'>('client');
  const [search, setSearch] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Form State
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<'client' | 'moderator' | 'customer_care' | 'admin'>('client');

  const handleProvision = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      toast.error("All identity parameters are required");
      return;
    }

    setIsProvisioning(true);
    try {
      const response = await fetch('/api/admin/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Identity established: ${newUsername}`);
        setShowCreateForm(false);
        // Clear form
        setNewUsername("");
        setNewEmail("");
        setNewPassword("");
      } else {
        throw new Error(result.error || "Provisioning failed");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  const filteredUsers = users
    .filter(u => u.role === activeTab || (activeTab === 'client' && !u.role))
    .filter(u => u.username?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (action: string, username: string) => {
    toast.success(`Action '${action}' executed on ${username}`);
    // In a real app, this would call a Supabase Edge Function to securely perform the admin action.
  };

  return (
    <div className="space-y-6">
      {/* Role Tabs & Provision Action */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar flex-[3]">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-2 px-3 min-w-[90px] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'client' ? 'bg-white text-black shadow-lg' : 'text-white/40 hover:text-white'
            }`}
          >
            <Users size={12} /> Players
          </button>
          <button
            onClick={() => setActiveTab('moderator')}
            className={`flex-1 py-2 px-3 min-w-[90px] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'moderator' ? 'bg-compete-purple text-white shadow-purple-glow' : 'text-white/40 hover:text-white'
            }`}
          >
            <Shield size={12} /> Mods
          </button>
          <button
            onClick={() => setActiveTab('customer_care')}
            className={`flex-1 py-2 px-3 min-w-[90px] text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'customer_care' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-white/40 hover:text-white'
            }`}
          >
            <Headphones size={12} /> Support
          </button>
        </div>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl border font-black uppercase text-[9px] tracking-widest transition-all flex items-center justify-center gap-2 ${
            showCreateForm 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white shadow-[0_0_15px_rgba(34,197,94,0.1)]'
          }`}
        >
          {showCreateForm ? (
            <>Cancel</>
          ) : (
            <><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Provision</>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showCreateForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-compete-purple" />
                <h3 className="text-xs font-black uppercase tracking-widest">Neural Identity Provisioning</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest ml-1">Codename / Username</p>
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. GhostOperator"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest ml-1">Secure Email Uplink</p>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="operator@compete.network"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest ml-1">Initial Access Key</p>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest ml-1">Assigned Badge / Role</p>
                  <select 
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-xs outline-none focus:border-compete-purple transition-all appearance-none cursor-pointer text-white"
                  >
                    <option value="client" className="bg-[#0A0A0F]">Player Badge</option>
                    <option value="moderator" className="bg-[#0A0A0F]">Moderator Shield</option>
                    <option value="customer_care" className="bg-[#0A0A0F]">Support Unit</option>
                    <option value="admin" className="bg-[#0A0A0F]">Command Admin</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleProvision}
                disabled={isProvisioning}
                className="w-full py-4 bg-compete-purple text-white font-black uppercase text-[10px] tracking-[0.3em] rounded-xl shadow-purple-glow hover:scale-[1.01] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProvisioning ? "Establishing Link..." : "Establish Secure Identity"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
        <input
          type="text"
          placeholder={`Search ${activeTab.replace('_', ' ')}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-xs outline-none focus:border-compete-purple placeholder:text-white/20 transition-colors"
        />
      </div>

      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-2xl text-white/20">
            <Users className="mx-auto mb-3 opacity-50" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest">No users found in this category</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-white/10 transition-all">
              
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border ${
                    activeTab === 'moderator' ? 'bg-compete-purple/20 border-compete-purple/50 text-compete-purple' :
                    activeTab === 'customer_care' ? 'bg-blue-500/20 border-blue-500/50 text-blue-500' :
                    'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {activeTab === 'moderator' ? <Shield size={20} /> : activeTab === 'customer_care' ? <Headphones size={20} /> : <Users size={20} />}
                  </div>
                  {/* Status Dot */}
                  <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0A0A0F] shadow-lg ${
                    (new Date().getTime() - new Date(user.last_seen_at || user.created_at).getTime()) < 24 * 60 * 60 * 1000
                    ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                    : 'bg-red-500/50'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    {user.username}
                    {user.is_admin && <span className="bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-black">Admin</span>}
                  </h4>
                  <p className="text-[9px] font-black uppercase text-white/40 tracking-widest mt-1">
                    {user.region || 'Unknown'} • Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[8px] font-black uppercase text-white/20 mt-1">
                    Last Seen: {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleAction('reset_password', user.username)}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reset Access"
                >
                  <Key size={14} />
                </button>
                <button 
                  onClick={() => handleAction('suspend', user.username)}
                  className="p-2.5 bg-yellow-500/5 border border-yellow-500/10 rounded-lg text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10 transition-colors"
                  title="Suspend User"
                >
                  <Ban size={14} />
                </button>
                <button 
                  onClick={() => handleAction('delete', user.username)}
                  className="p-2.5 bg-red-500/5 border border-red-500/10 rounded-lg text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Delete User"
                >
                  <Trash2 size={14} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
