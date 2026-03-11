'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Save, Loader2 } from 'lucide-react';
import { getDocument, updateDocument } from '@/lib/firebase/firestore';
import { Business } from '@/types';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchBusiness() {
      if (profile?.currentBusinessId) {
        try {
          const b = await getDocument<Business>('businesses', profile.currentBusinessId);
          setBusiness(b);
        } catch (e) {
          console.error("Error fetching business", e);
        }
      }
      setLoading(false);
    }
    fetchBusiness();
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.currentBusinessId || !business) return;
    
    setIsSaving(true);
    try {
      await updateDocument('businesses', profile.currentBusinessId, {
        name: business.name || '',
        gstin: business.gstin || '',
        address: business.address || '',
        upiId: business.upiId || ''
      });
      // Optional toast notification
    } catch (error) {
      console.error("Failed to save:", error);
    }
    setIsSaving(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

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

          <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Business Name</label>
                <input 
                  value={business?.name || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), name: e.target.value } as Business))}
                  placeholder="My Business"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">GSTIN / Tax ID</label>
                <input 
                  value={business?.gstin || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), gstin: e.target.value } as Business))}
                  placeholder="Your GSTIN"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 uppercase"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Registered Address</label>
                <textarea 
                  rows={3}
                  value={business?.address || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), address: e.target.value } as Business))}
                  placeholder="123 Business Park, Tech City"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold tracking-wider text-[#00ea77] uppercase flex items-center gap-2">
                   UPI ID (VPA) for Payments
                   <span className="bg-[#00ea77]/20 text-[#00ea77] px-2 py-0.5 rounded text-[10px] tracking-widest">NEW</span>
                </label>
                <input 
                  value={business?.upiId || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), upiId: e.target.value } as Business))}
                  placeholder="merchant@sbi / 9876543210@ybl"
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-[#00ea77]/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-bold placeholder:text-slate-600 placeholder:font-medium"
                />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">If provided, invoices will automatically include a dynamic Scan-to-Pay QR Code.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#00ea77] text-black font-bold px-6 py-2.5 rounded-xl hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)] disabled:opacity-70"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
                {isSaving ? 'Saving...' : 'Save Profile'}
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
