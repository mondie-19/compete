"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Headphones, Users, Search, Ban, Key, Trash2 } from "lucide-react";
import Dropdown from "@/components/Dropdown";
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

  const handleAction = async (action: 'ban' | 'delete' | 'reset_password', userId: string, username: string) => {
    if (!confirm(`Are you sure you want to ${action === 'reset_password' ? 'reset access for' : action} user "${username}"? This cannot be undone.`)) return;
    try {
      const response = await fetch('/api/admin/user-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Action '${action}' executed on ${username}`);
      } else {
        throw new Error(result.error || 'Action failed');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Role Tabs & Provision Action */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <div className="flex bg-transparent p-1 rounded-none border border-white/10 overflow-x-auto custom-scrollbar flex-[3]">
          <button
            onClick={() => setActiveTab('client')}
            className={`flex-1 py-1.5 px-3 min-w-[80px] text-[8px] font-black uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1 ${
              activeTab === 'client' ? 'bg-white text-black' : 'text-white/40 hover:text-white'
            }`}
          >
            <Users size={10} /> Players
          </button>
          <button
            onClick={() => setActiveTab('moderator')}
            className={`flex-1 py-1.5 px-3 min-w-[80px] text-[8px] font-black uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1 ${
              activeTab === 'moderator' ? 'bg-compete-purple text-white shadow-purple-glow' : 'text-white/40 hover:text-white'
            }`}
          >
            <Shield size={10} /> Mods
          </button>
          <button
            onClick={() => setActiveTab('customer_care')}
            className={`flex-1 py-1.5 px-3 min-w-[80px] text-[8px] font-black uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-1 ${
              activeTab === 'customer_care' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-white/40 hover:text-white'
            }`}
          >
            <Headphones size={10} /> Support
          </button>
        </div>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-none border font-black uppercase text-[8px] tracking-widest transition-all flex items-center justify-center gap-1.5 ${
            showCreateForm 
            ? 'bg-red-500/10 border-red-500/30 text-red-500' 
            : 'bg-green-500/10 border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white'
          }`}
        >
          {showCreateForm ? (
            <>Cancel</>
          ) : (
            <><div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" /> Provision</>
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
            <div className="bg-transparent border border-white/10 rounded-none p-4 space-y-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Shield size={14} className="text-compete-purple" />
                <h3 className="text-[10px] font-black uppercase tracking-widest">Neural Identity Provisioning</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <p className="text-[7px] font-black uppercase text-white/40 tracking-widest ml-0.5">Codename / Username</p>
                  <input 
                    type="text" 
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. GhostOperator"
                    className="w-full bg-black/40 border border-white/10 rounded-none py-2 px-3 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[7px] font-black uppercase text-white/40 tracking-widest ml-0.5">Secure Email Uplink</p>
                  <input 
                    type="email" 
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="operator@compete.network"
                    className="w-full bg-black/40 border border-white/10 rounded-none py-2 px-3 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[7px] font-black uppercase text-white/40 tracking-widest ml-0.5">Initial Access Key</p>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/40 border border-white/10 rounded-none py-2 px-3 text-xs outline-none focus:border-compete-purple transition-all text-white"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[7px] font-black uppercase text-white/40 tracking-widest ml-0.5">Assigned Badge / Role</p>
                  <Dropdown
                    options={[
                      { value: 'client',       label: 'Player Badge' },
                      { value: 'moderator',    label: 'Moderator Shield' },
                      { value: 'customer_care', label: 'Support Unit' },
                      { value: 'admin',        label: 'Command Admin' },
                    ]}
                    value={newRole}
                    onChange={(val) => setNewRole(val as any)}
                  />
                </div>
              </div>

              <button 
                onClick={handleProvision}
                disabled={isProvisioning}
                className="w-full py-2.5 bg-compete-purple text-white font-black uppercase text-[9px] tracking-[0.3em] rounded-none hover:scale-[1.01] transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProvisioning ? "Establishing Link..." : "Establish Secure Identity"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <input
          type="text"
          placeholder={`Search ${activeTab.replace('_', ' ')}s...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-none py-2 pl-9 pr-3 text-xs outline-none focus:border-compete-purple placeholder:text-white/20 transition-colors"
        />
      </div>

      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <div className="py-8 text-center border border-white/10 rounded-none text-white/20 bg-transparent">
            <Users className="mx-auto mb-2 opacity-50" size={24} />
            <p className="text-[9px] font-black uppercase tracking-widest">No users found in this category</p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <div key={user.id} className="bg-transparent border border-white/10 p-3 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:border-white/20 transition-all">
              
              <div className="flex items-center gap-3 flex-1">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-none flex items-center justify-center border ${
                    activeTab === 'moderator' ? 'bg-compete-purple/5 border-compete-purple/30 text-compete-purple' :
                    activeTab === 'customer_care' ? 'bg-blue-500/5 border-blue-500/30 text-blue-500' :
                    'bg-transparent border-white/10 text-white/40'
                  }`}>
                    {activeTab === 'moderator' ? <Shield size={16} /> : activeTab === 'customer_care' ? <Headphones size={16} /> : <Users size={16} />}
                  </div>
                  {/* Status Dot */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[#0A0A0F] ${
                    (new Date().getTime() - new Date(user.last_seen_at || user.created_at).getTime()) < 24 * 60 * 60 * 1000
                    ? 'bg-green-500'
                    : 'bg-red-500/50'
                  }`} />
                </div>
                <div>
                  <h4 className="font-bold text-xs flex items-center gap-1.5 leading-none">
                    {user.username}
                    {user.is_admin && <span className="bg-red-500 text-white text-[7px] px-1 py-0.5 rounded-none uppercase font-black">Admin</span>}
                  </h4>
                  <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mt-1 leading-none">
                    {user.region || 'Unknown'} • Joined {new Date(user.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-[7px] font-black uppercase text-white/20 mt-1 leading-none">
                    Last Seen: {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handleAction('reset_password', user.id, user.username)}
                  className="p-2 bg-transparent border border-white/10 rounded-none text-white/40 hover:text-white hover:bg-white/5 transition-colors"
                  title="Reset Access"
                >
                  <Key size={12} />
                </button>
                <button 
                  onClick={() => handleAction('ban', user.id, user.username)}
                  className="p-2 bg-transparent border border-yellow-500/20 rounded-none text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/5 transition-colors"
                  title="Ban User"
                >
                  <Ban size={12} />
                </button>
                <button 
                  onClick={() => handleAction('delete', user.id, user.username)}
                  className="p-2 bg-transparent border border-red-500/20 rounded-none text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-colors"
                  title="Delete User"
                >
                  <Trash2 size={12} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}
