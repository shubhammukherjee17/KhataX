import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Clock, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Help Center | KhataX',
  description: 'Search for articles, guides, and 24/7 technical support.',
};

export default function HelpCenterPage() {
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
      
      <main className="flex-1 flex flex-col items-center p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ea77]/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-6">How can we help?</h1>
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00ea77] transition-colors" />
              <input 
                type="text" 
                placeholder="Search for 'How to add credit limit', 'Fix invoice PDF'..." 
                className="w-full bg-[#111] border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#00ea77] transition-colors shadow-2xl"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#00ea77]/50 transition cursor-pointer">
              <BookOpen className="text-[#00ea77] w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Getting Started</h3>
              <p className="text-sm text-slate-400">Everything you need to successfully setup your Cloud Vault, add items, and create your first invoice.</p>
            </div>
            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 hover:border-[#00ea77]/50 transition cursor-pointer">
              <ShieldCheck className="text-blue-500 w-8 h-8 mb-4" />
              <h3 className="text-xl font-bold mb-2">Account & Billing</h3>
              <p className="text-sm text-slate-400">Manage your Pro/Enterprise subscription, modify owner roles, and review statement charges.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#18181b] to-[#111] border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center">
            <Clock className="w-10 h-10 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Enterprise Support Line</h2>
            <p className="text-slate-400 max-w-xl mb-6">Our system architects natively monitor all Enterprise Vaults for latency drops. For immediate engineering intervention, use the Portal in your Dashboard.</p>
            <Link href="/dashboard" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition">
              Open Support Ticket
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
