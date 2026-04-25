'use client';

import { useState } from 'react';
import { HelpCircle, Mail, PhoneCall, MessageSquare, Send, CheckCircle2, ChevronDown, Headset } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How do I add multiple bank accounts for Net Liquidity?',
      a: 'Currently, the system sums all active accounts within your chosen Business Vault. You can manage them by navigating to the Settings panel and adding your financial institution connections or manual ledgers.'
    },
    {
      q: 'Will my data be lost if I refresh the page?',
      a: 'No. GononaX Pro uses highly resilient local syncing with Firebase. Your active Business Vault is preserved across hard reloads, immediately restoring your active context.'
    },
    {
      q: 'How is the ITC Eligibility calculated on purchases?',
      a: 'The GST Input Tax Credit is aggregated based on your submitted Purchase Invoices where the GST percentage is explicitly stated and marked as Eligible. It automatically offsets in your Tax AI reporting.'
    },
    {
      q: 'Can I restrict staff access to specific reports?',
      a: 'Yes. Enterprise Vault users with "Owner" roles can modify Staff permissions under Settings -> Roles, restricting views for sensitive metrics like Net Liquidity and Margin Calculators.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setSubject('');
      setMessage('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20"><Headset className="w-8 h-8 text-brand-primary" /></div>
            Enterprise Support
          </h1>
          <p className="text-[12px] font-mono tracking-widest uppercase font-semibold text-zinc-500 mt-3">Get priority assistance from the GononaX Pro engineering team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Direct Contact */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#0A0A0A] rounded-2xl p-8 border border-white/[0.04] shadow-sm relative overflow-hidden">
            <h2 className="text-lg font-heading font-semibold text-white mb-6">Open a Support Ticket</h2>
            
            {isSuccess ? (
              <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-brand-primary" />
                </div>
                <h3 className="text-xl font-heading font-semibold text-white mb-2">Ticket Submitted Successfully</h3>
                {/* eslint-disable-next-line react-hooks/purity */}
                <p className="text-zinc-400 font-medium text-sm">Our enterprise support team will review your request and get back to you within 2 hours. Ticket ID: #KX-{Math.floor(Math.random() * 90000) + 10000}</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-[11px] font-mono tracking-[0.2em] uppercase text-brand-primary font-semibold hover:text-white transition-colors"
                >
                  Open another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase mb-2">Subject Context</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-white font-medium focus:outline-none focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/30 appearance-none transition-all shadow-sm"
                    required
                  >
                    <option value="" disabled className="bg-[#0A0A0A]">Select an issue category...</option>
                    <option value="billing" className="bg-[#0A0A0A]">Billing & Subscriptions</option>
                    <option value="data" className="bg-[#0A0A0A]">Data Synchronization Issue</option>
                    <option value="feature" className="bg-[#0A0A0A]">Feature Request / Feedback</option>
                    <option value="technical" className="bg-[#0A0A0A]">Technical Bug Report</option>
                    <option value="other" className="bg-[#0A0A0A]">Other Inquiry</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase mb-2">Detailed Description</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Please provide steps to reproduce, relevant invoice numbers, or expected outcomes..."
                    className="w-full bg-white/[0.02] border border-white/[0.04] rounded-xl px-4 py-3 text-white font-medium placeholder:text-zinc-600 focus:outline-none focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/30 transition-all resize-none shadow-sm"
                    required
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !subject || !message}
                    className="flex items-center gap-2 bg-brand-primary text-black font-semibold px-8 py-3 rounded-xl hover:bg-brand-primary/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={2} /> Dispatch Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="mailto:support@gononax.com" className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors group shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <Mail className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="font-semibold text-white mb-1">Email Support</h3>
              <p className="text-xs text-zinc-400 font-medium">support@gononax.com</p>
            </a>
            <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/[0.02] transition-colors group shadow-sm cursor-not-allowed opacity-80">
              <div className="w-12 h-12 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-sm">
                <PhoneCall className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="font-semibold text-white mb-1">Priority Hotline</h3>
              <p className="text-xs text-zinc-400 font-medium mb-1">1-800-GONONAX</p>
              <span className="text-[9px] text-brand-primary uppercase font-mono font-semibold tracking-widest bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">Available 24/7</span>
            </div>
          </div>
        </div>

        {/* Right Column: FAQ */}
        <div className="col-span-1">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden shadow-sm sticky top-6">
            <div className="px-6 py-5 border-b border-white/[0.04] flex items-center gap-3 bg-white/[0.02]">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              <h2 className="text-[11px] font-mono font-semibold text-white uppercase tracking-[0.2em]">Common Questions</h2>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-transparent">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-5 flex items-start justify-between hover:bg-white/[0.02] transition-colors group"
                  >
                    <span className="font-semibold text-[13px] text-zinc-200 pr-4 leading-relaxed group-hover:text-brand-primary transition-colors">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 shrink-0 mt-0.5 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-6 pt-1 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[13px] text-zinc-400 font-medium leading-relaxed border-l-2 border-brand-primary/50 pl-4 py-1 bg-white/[0.02] rounded-r-xl pr-4">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
