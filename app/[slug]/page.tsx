import Link from 'next/link';
import { ArrowLeft, Beaker } from 'lucide-react';

export default function GenericPage({ params }: { params: { slug: string } }) {
  // Format slug to readable title
  const title = params.slug
    .split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ea77]/30 font-sans flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded bg-[#00ea77] flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">GononaX</span>
        </Link>
        <Link href="/" className="text-sm font-semibold text-slate-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00ea77]/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="w-20 h-20 rounded-2xl bg-[#111] border border-[#00ea77]/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_40px_rgba(0,234,119,0.1)]">
          <Beaker className="w-10 h-10 text-[#00ea77]" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 relative z-10">{title}</h1>
        
        <p className="text-lg text-slate-400 max-w-md mx-auto mb-10 leading-relaxed relative z-10">
          This document is currently being drafted by our legal and content teams. Check back soon for the definitive version.
        </p>
        
        <Link 
          href="/" 
          className="px-8 py-3 bg-[#111] border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-colors relative z-10"
        >
          Return to Hub
        </Link>
      </main>
    </div>
  );
}
