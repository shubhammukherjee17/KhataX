import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | GononaX',
  description: 'Terms governing the usage of the GononaX platform.',
};

export default function TermsOfServicePage() {
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
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-6 uppercase tracking-widest">Legal Document</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Terms of Service</h1>
          <p className="text-lg text-slate-400 mb-12 border-b border-white/10 pb-8">Last Updated: April 11, 2026. These terms govern your use of the GononaX platform and services.</p>
          
          <div className="prose prose-invert prose-lg max-w-none text-slate-300">
            <h2 className="text-2xl font-bold text-white mb-4">1. License and Usage</h2>
            <p className="mb-6">
              When you subscribe to GononaX, we grant you a non-exclusive, revocable license to use our application for your business accounting and management needs.
            </p>
            
            <h2 className="text-2xl font-bold text-white mb-4">2. Accuracy of Information</h2>
            <p className="mb-6">
              While our AI and tax assistance tools are designed to provide helpful suggestions, they rely on the accuracy of the data you input. GononaX is not legally liable for any tax miscalculations or business losses resulting from incorrect data entry.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">3. Prohibited Activities</h2>
            <p className="mb-6">
              Users may not reverse-engineer the platform, attempt to breach our security systems, or use the service for any illegal activities. Any violation of these terms may result in the suspension of your account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
