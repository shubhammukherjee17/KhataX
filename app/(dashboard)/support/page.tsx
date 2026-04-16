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
      a: 'No. KhataX Pro uses highly resilient local syncing with Firebase. Your active Business Vault is preserved across hard reloads, immediately restoring your active context.'
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
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight leading-tight flex items-center gap-3">
            <Headset className="w-8 h-8 text-[#00FFA3]" />
            Enterprise Support
          </h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">Get priority assistance from the KhataX Pro engineering team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Direct Contact */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-[#111] rounded-2xl p-8 border border-white/[0.05] shadow-lg relative overflow-hidden">
            <h2 className="text-lg font-heading font-bold text-white mb-6">Open a Support Ticket</h2>
            
            {isSuccess ? (
              <div className="bg-[#00FFA3]/10 border border-[#00FFA3]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-[#00FFA3]/20 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-[#00FFA3]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ticket Submitted Successfully</h3>
                {/* eslint-disable-next-line react-hooks/purity */}
                <p className="text-zinc-400 text-sm">Our enterprise support team will review your request and get back to you within 2 hours. Ticket ID: #KX-{Math.floor(Math.random() * 90000) + 10000}</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-[#00FFA3] text-sm font-bold hover:text-white transition-colors"
                >
                  Open another ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Subject Context</label>
                  <select 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FFA3]/50 focus:ring-1 focus:ring-[#00FFA3]/50 appearance-none transition-colors"
                    required
                  >
                    <option value="" disabled>Select an issue category...</option>
                    <option value="billing">Billing & Subscriptions</option>
                    <option value="data">Data Synchronization Issue</option>
                    <option value="feature">Feature Request / Feedback</option>
                    <option value="technical">Technical Bug Report</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Detailed Description</label>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Please provide steps to reproduce, relevant invoice numbers, or expected outcomes..."
                    className="w-full bg-[#0a0a0a] border border-white/[0.05] rounded-xl px-4 py-3 text-white placeholder-[#52525b] focus:outline-none focus:border-[#00FFA3]/50 focus:ring-1 focus:ring-[#00FFA3]/50 transition-colors resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    disabled={isSubmitting || !subject || !message}
                    className="flex items-center gap-2 bg-[#00FFA3] text-black font-heading font-bold px-8 py-3 rounded-xl hover:bg-[#00ffa3]/90 transition-all shadow-[0_0_15px_rgba(0,234,119,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" strokeWidth={3} /> Dispatch Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="mailto:support@khatax.com" className="bg-[#111] border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#00FFA3]/50 transition-colors group">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-bold text-white mb-1">Email Support</h3>
              <p className="text-sm text-zinc-400">support@khatax.com</p>
            </a>
            <div className="bg-[#111] border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-[#00FFA3]/50 transition-colors group cursor-not-allowed">
              <div className="w-12 h-12 rounded-full bg-[#00FFA3]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PhoneCall className="w-6 h-6 text-[#00FFA3]" />
              </div>
              <h3 className="font-bold text-white mb-1">Priority Hotline</h3>
              <p className="text-sm text-zinc-400">1-800-KHATAX <br/><span className="text-[10px] text-[#00FFA3] uppercase font-bold tracking-widest">Available 24/7</span></p>
            </div>
          </div>
        </div>

        {/* Right Column: FAQ */}
        <div className="col-span-1">
          <div className="bg-[#111] rounded-2xl border border-white/[0.05] overflow-hidden shadow-lg sticky top-6">
            <div className="px-6 py-5 border-b border-white/[0.05] flex items-center gap-2 bg-[#121214]">
              <MessageSquare className="w-4 h-4 text-zinc-400" />
              <h2 className="text-sm font-heading font-bold text-white uppercase tracking-wider">Common Questions</h2>
            </div>
            <div className="divide-y divide-[#27272a]">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-[#111]">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a]/30 transition-colors"
                  >
                    <span className="font-bold text-sm text-white pr-4">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-6 pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-[#00FFA3]/50 pl-3 py-1">
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
