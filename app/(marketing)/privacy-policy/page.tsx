import Link from 'next/link';
import { ArrowLeft, Shield, EyeOff, Server } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | KhataX',
  description: 'How we protect and manage your financial data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ea77]/30 selection:text-white font-sans flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center justify-between z-10 relative bg-[#0a0a0a]">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded bg-[#00ea77] flex items-center justify-center">
             <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">KhataX</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </header>
      
      <main className="flex-1 flex justify-center p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-6 uppercase tracking-widest">Legal Document</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Privacy Policy</h1>
          <p className="text-lg text-slate-400 mb-12 border-b border-white/10 pb-8">Last Updated: April 11, 2026. This Privacy Policy clarifies how KhataX Technologies Pvt. Ltd. collects, leverages, and mathematically secures your financial transaction parameters.</p>
          
          <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-8">
            <div className="flex gap-4">
               <Shield className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">1. Information Collection</h2>
                 <p>When you synthesize a Dashboard configuration with us, KhataX locally aggregates your Business profiles, GSTIN markers, vendor lists, and explicitly supplied inventory parameters natively syncing directly to your encrypted Firebase array.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <EyeOff className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">2. Core Usage Limitations</h2>
                 <p>KhataX employs Zero-Knowledge conceptual pipelines for enterprise transaction indexing. We **never** sell your ledgers to third-party ad networks. Your transaction velocity graphs are utilized solely to output personalized AI Intelligence insights natively on your instance.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <Server className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">3. Automated Data Retention</h2>
                 <p>Your data stays entirely intact across your active subscription cycle. Upon triggering a Vault deletion, KhataX mathematically wipes all associated Firestore endpoints within 30 chronological days.</p>
               </div>
            </div>
            
            <p className="text-sm mt-12 bg-[#111] p-6 rounded-2xl border border-white/5">
              For privacy-related data export requests or DPO communications, please ping our legal engineering department natively at <span className="text-[#00ea77]">privacy@khatax.com</span>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
