import Link from 'next/link';
import { ArrowLeft, Shield, EyeOff, Server } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GononaX',
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
          <span className="font-bold text-xl tracking-tight">GononaX</span>
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
          <p className="text-lg text-slate-400 mb-12 border-b border-white/10 pb-8">Last Updated: April 11, 2026. This Privacy Policy explains how GononaX Technologies Pvt. Ltd. collects, uses, and protects your financial and personal data.</p>
          
          <div className="prose prose-invert prose-lg max-w-none text-slate-300 space-y-8">
            <div className="flex gap-4">
               <Shield className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">1. Information Collection</h2>
                 <p>When you create an account with us, GononaX safely stores your business profiles, GSTIN details, vendor lists, and inventory information to help you manage your business more efficiently.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <EyeOff className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">2. How We Use Your Data</h2>
                 <p>Your privacy is our priority. We <strong>never</strong> sell your data to third parties. Your financial information is strictly used to provide you with insights, improve the app experience, and help you manage your accounting seamlessly.</p>
               </div>
            </div>

            <div className="flex gap-4">
               <Server className="w-8 h-8 text-[#00ea77] shrink-0" />
               <div>
                 <h2 className="text-2xl font-bold text-white mb-3">3. Data Retention and Deletion</h2>
                 <p>Your data is securely stored while your account is active. If you choose to delete your account, GononaX will permanently remove all your associated data from our servers within 30 days.</p>
               </div>
            </div>
            
            <p className="text-sm mt-12 bg-[#111] p-6 rounded-2xl border border-white/5">
              For any questions regarding your privacy or data export requests, please reach out to our team at <span className="text-[#00ea77]">privacy@gononax.com</span>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
