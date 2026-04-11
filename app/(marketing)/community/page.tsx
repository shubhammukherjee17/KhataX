import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare, Award, Globe } from 'lucide-react';

export const metadata = {
  title: 'Community | KhataX',
  description: 'Connect with a thriving KhataX community of business owners.',
};

export default function CommunityPage() {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">The KhataX Network</h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join India's fastest-growing ecosystem of wholesalers, distributors, and business owners scaling their operations mathematically.</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-blue-500/50 transition">
               <Globe className="w-8 h-8 text-[#00ea77] mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">10,000+ Founders</h3>
               <p className="text-sm text-slate-400">Network with distributors across 15+ states sharing localized insights and supply-chain logistics advice.</p>
             </div>
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-blue-500/50 transition">
               <MessageSquare className="w-8 h-8 text-blue-500 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Private Discord</h3>
               <p className="text-sm text-slate-400">Get direct access to our product engineering team. Shape the roadmap by voting on features.</p>
             </div>
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-blue-500/50 transition">
               <Award className="w-8 h-8 text-yellow-500 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Ambassador Events</h3>
               <p className="text-sm text-slate-400">Attend exclusive physical meetups in Tier-1 and Tier-2 cities hosted by the KhataX executive team.</p>
             </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/20 to-[#00ea77]/10 p-12 border border-white/10 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Network?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">Active KhataX Pro subscribers are automatically invited to the master Discord channel via their verified email address.</p>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-colors">
              Claim Community Access
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
