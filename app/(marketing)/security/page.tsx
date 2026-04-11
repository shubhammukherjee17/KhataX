import Link from 'next/link';
import { ArrowLeft, Shield, Lock, FileKey } from 'lucide-react';

export const metadata = {
  title: 'Security | KhataX',
  description: 'Enterprise Vault Security & End-to-End Encryption specifications.',
};

export default function SecurityPage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ea77]/10 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10 text-center">
          <Shield className="w-16 h-16 text-[#00ea77] mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Enterprise Security Vaults</h1>
          <p className="text-xl text-slate-400 mb-12">Engineered strictly against top-tier financial compliances. Your ledger array is mathematically locked.</p>
          
          <div className="grid md:grid-cols-2 gap-6 text-left mb-12">
            <div className="bg-[#111] p-8 border border-white/10 rounded-3xl">
              <Lock className="w-8 h-8 text-white mb-4" />
              <h3 className="text-xl font-bold mb-2">AES-256 Encryption</h3>
              <p className="text-sm text-slate-400">All data generated iteratively across invoices, receipts, and JSON payloads is strictly locked at rest and in transit via SHA-256 and SSL/TLS standards.</p>
            </div>
            <div className="bg-[#111] p-8 border border-white/10 rounded-3xl">
              <FileKey className="w-8 h-8 text-white mb-4" />
              <h3 className="text-xl font-bold mb-2">Role-Based Access</h3>
              <p className="text-sm text-slate-400">Enterprise owners possess granular matrix controls over staff capabilities preventing destructive mutations or sensitive reporting leaks.</p>
            </div>
          </div>

          <div className="p-8 border-2 border-[#00ea77]/30 bg-[#00ea77]/5 rounded-3xl text-left">
             <h2 className="text-2xl font-bold text-white mb-4">Infrastructure Specs</h2>
             <p className="text-slate-300 leading-relaxed max-w-2xl">KhataX relies natively on Google Cloud Firebase architectures ensuring 99.99% uptime with geometric geographical backups mapped entirely out of redundant servers located strictly in Mumbai (asia-south1) for uncompromising Indian Data Residency constraints.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
