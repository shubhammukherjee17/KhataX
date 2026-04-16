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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.8);
        setBusiness(prev => ({ ...(prev || {}), logoBase64: dataUrl } as Business));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.currentBusinessId || !business) return;
    
    setIsSaving(true);
    try {
      await updateDocument('businesses', profile.currentBusinessId, {
        name: business.name || '',
        gstin: business.gstin || '',
        address: business.address || '',
        upiId: business.upiId || '',
        logoBase64: business.logoBase64 || ''
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
        <h1 className="text-2xl font-heading font-semibold tracking-tight text-white">Settings</h1>
        <p className="text-[12px] font-mono tracking-widest uppercase font-semibold text-zinc-500 mt-2">Manage your business profile and preferences.</p>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
        <div className="p-6 border-b border-white/[0.04] bg-white/[0.02]">
          <h2 className="text-lg font-heading font-semibold text-white">Business Profile</h2>
          <p className="text-xs font-medium text-zinc-500 mt-1 mb-6">Update your company details and GST information.</p>

          <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Logo Upload */}
              <div className="space-y-4 md:col-span-2 border-b border-white/[0.04] pb-6 mb-2">
                <label className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">Business Logo</label>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                    {business?.logoBase64 ? (
                      <img src={business.logoBase64} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 font-semibold">No Logo</span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[11px] file:font-semibold file:uppercase file:tracking-widest file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 file:transition-colors file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[9px] text-zinc-600 font-semibold uppercase tracking-widest">Recommended size: 200x200px. PNG or JPG.</p>
                  </div>
                  {business?.logoBase64 && (
                    <button 
                      type="button" 
                      onClick={() => setBusiness(prev => ({ ...(prev || {}), logoBase64: undefined } as Business))}
                      className="text-[11px] font-semibold uppercase tracking-widest text-red-500 hover:text-red-400 px-4 py-2.5 bg-red-500/10 rounded-xl transition-colors ml-auto shadow-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">Business Name</label>
                <input 
                  value={business?.name || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), name: e.target.value } as Business))}
                  placeholder="My Business"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary/50 text-white font-medium placeholder:text-zinc-600 transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">GSTIN / Tax ID</label>
                <input 
                  value={business?.gstin || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), gstin: e.target.value } as Business))}
                  placeholder="Your GSTIN"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary/50 text-white font-medium placeholder:text-zinc-600 uppercase transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">Registered Address</label>
                <textarea 
                  rows={3}
                  value={business?.address || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), address: e.target.value } as Business))}
                  placeholder="123 Business Park, Tech City"
                  className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 focus:border-brand-primary/50 text-white font-medium placeholder:text-zinc-600 resize-none transition-all shadow-sm"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-mono tracking-[0.2em] font-semibold text-brand-primary uppercase flex items-center gap-2">
                   UPI ID (VPA) for Payments
                   <span className="bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded text-[9px] tracking-widest font-bold">NEW</span>
                </label>
                <input 
                  value={business?.upiId || ''}
                  onChange={e => setBusiness(prev => ({ ...(prev || {}), upiId: e.target.value } as Business))}
                  placeholder="merchant@sbi / 9876543210@ybl"
                  className="w-full px-4 py-3 bg-brand-primary/5 border border-brand-primary/20 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-brand-primary font-semibold placeholder:text-brand-primary/30 transition-all shadow-sm"
                />
                <p className="text-[9px] font-medium text-brand-primary/60 uppercase tracking-widest mt-2">If provided, invoices will automatically include a dynamic Scan-to-Pay QR Code.</p>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.04] flex justify-end">
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex items-center gap-2 bg-brand-primary text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all shadow-sm disabled:opacity-70 active:scale-95"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} 
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-heading font-semibold text-white">User Account</h2>
          <p className="text-xs font-medium text-zinc-500 mt-1 mb-6">Your personal account details.</p>

          <div className="max-w-2xl space-y-2">
            <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
              <div>
                <p className="font-semibold text-white text-sm">Name</p>
                <p className="text-xs text-zinc-400 font-medium mt-1">{profile?.name || 'User'}</p>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-white/[0.04]">
              <div>
                <p className="font-semibold text-white text-sm">Email Address</p>
                <p className="text-xs text-zinc-400 font-medium mt-1">{profile?.email || 'email@example.com'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
