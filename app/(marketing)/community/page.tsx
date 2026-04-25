import Link from 'next/link';
import { ArrowLeft, Users, MessageSquare, Award, Globe } from 'lucide-react';

export const metadata = {
  title: 'Community | GononaX',
  description: 'Connect with a thriving GononaX community of business owners.',
};

export default function CommunityPage() {
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
      
      <main className="flex-1 flex flex-col items-center p-12 lg:p-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ea77]/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#00ea77]/10 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-[#00ea77]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">The GononaX Community</h1>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">Join India's fastest-growing ecosystem of wholesalers, distributors, and business owners who are scaling their businesses together.</p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-[#00ea77]/30 transition">
               <Globe className="w-8 h-8 text-[#00ea77] mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">10,000+ Businesses</h3>
               <p className="text-sm text-slate-400">Connect with fellow business owners from across the country to share insights and discuss market trends.</p>
             </div>
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-[#00ea77]/30 transition">
               <MessageSquare className="w-8 h-8 text-[#00ea77] mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Exclusive Forums</h3>
               <p className="text-sm text-slate-400">Chat directly with our team, give feedback on new features, and vote on what we should build next.</p>
             </div>
             <div className="bg-[#111] p-8 border border-white/10 rounded-3xl hover:border-[#00ea77]/30 transition">
               <Award className="w-8 h-8 text-[#00ea77] mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">Local Meetups</h3>
               <p className="text-sm text-slate-400">Attend community events in your city to network with other GononaX users and learn industry best practices.</p>
             </div>
          </div>

          <div className="bg-gradient-to-r from-[#00ea77]/5 to-[#00ea77]/10 p-12 border border-white/10 rounded-3xl">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Join?</h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">Active GononaX Pro subscribers receive a direct invitation to our exclusive community forum via email.</p>
            <button className="px-8 py-3 bg-[#00ea77] text-black rounded-xl font-bold hover:bg-[#00c563] transition-colors">
              Join the Community
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
