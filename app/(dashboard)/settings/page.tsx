'use client';

import { useAuth } from '@/hooks/useAuth';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-sm font-semibold text-slate-400">Manage your business profile and preferences.</p>
      </div>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Business Profile</h2>
          <p className="text-sm text-slate-500 mb-6">Update your company details and GST information.</p>

          <form className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Business Name</label>
                <input 
                  defaultValue="My Business"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">GSTIN / Tax ID</label>
                <input 
                  defaultValue="29ABCDE1234F1Z5"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 uppercase"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Registered Address</label>
                <textarea 
                  rows={3}
                  defaultValue="123 Business Park, Tech City"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                type="button" 
                className="flex items-center gap-2 bg-[#00ea77] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)]"
              >
                <Save className="h-4 w-4" /> Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-white">User Account</h2>
          <p className="text-sm text-slate-500 mb-6">Your personal account details.</p>

          <div className="max-w-2xl space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="font-bold text-white text-sm">Name</p>
                <p className="text-sm text-slate-400 font-medium">{profile?.name || 'User'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-white/5">
              <div>
                <p className="font-bold text-white text-sm">Email Address</p>
                <p className="text-sm text-slate-400 font-medium">{profile?.email || 'email@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
