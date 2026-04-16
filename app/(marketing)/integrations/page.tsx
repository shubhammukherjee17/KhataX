import Link from 'next/link';
import { ArrowLeft, Cpu, Smartphone, Database, Workflow } from 'lucide-react';

export const metadata = {
  title: 'Integrations | KhataX',
  description: 'Connect KhataX with Banking endpoints and legacy ERP databases.',
};

export default function IntegrationsPage() {
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ea77]/5 rounded-full blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold mb-6">Seamless Integrations</h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">Connect KhataX with the tools you already use. Sync your data effortlessly with banks and other business software.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <div className="bg-[#111] p-8 border border-white/10 rounded-2xl">
              <Cpu className="w-8 h-8 text-[#00ea77] mb-4" />
              <h3 className="text-xl font-bold mb-2">Tally ERP Migration</h3>
              <p className="text-sm text-slate-400">Easily import your existing data, ledgers, and inventory settings from Tally so you can get started with KhataX in minutes.</p>
            </div>
            <div className="bg-[#111] p-8 border border-white/10 rounded-2xl">
              <Database className="w-8 h-8 text-[#00ea77] mb-4" />
              <h3 className="text-xl font-bold mb-2">Banking Integration</h3>
              <p className="text-sm text-slate-400">Connect securely with major banks (ICICI, HDFC, SBI) to automatically track and reconcile your payments and receipts.</p>
            </div>
            <div className="bg-[#111] p-8 border border-white/10 rounded-2xl">
              <Smartphone className="w-8 h-8 text-[#00ea77] mb-4" />
              <h3 className="text-xl font-bold mb-2">WhatsApp Reminders</h3>
              <p className="text-sm text-slate-400">Send friendly, automated payment reminders and invoice PDFs directly to your customers on WhatsApp.</p>
            </div>
          </div>

          <div className="bg-[#18181b] p-10 rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold mb-3 flex items-center gap-3"><Workflow className="text-[#00ea77]" /> Need custom integrations?</h2>
              <p className="text-slate-400">Our enterprise team can help build custom connections to match your specific business workflows.</p>
            </div>
            <Link href="/" className="px-8 py-4 bg-[#00ea77] text-black rounded-xl font-bold hover:bg-[#00c563] transition whitespace-nowrap">
              Contact Enterprise Sales
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
