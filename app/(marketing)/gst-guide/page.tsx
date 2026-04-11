import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, AlertTriangle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'GST Compliance Guide | KhataX',
  description: 'Understand Indian GST mechanisms and how KhataX automates filing.',
};

export default function GSTGuidePage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">GST Compliance Guide</h1>
          <p className="text-xl text-[#00ea77] mb-12">Navigating the Indian Taxation System with KhataX Intelligence.</p>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><FileText className="text-purple-500" /> Automated GSTIN Resolution</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              The Indian Goods and Services Tax implies a massive computational load on distributors who have hundreds of daily invoices. KhataX automates this mathematically by linking the <strong>HSN Configuration</strong> directly to your inventory setup.
            </p>
            
            <h3 className="text-lg font-bold text-white mb-4">How KhataX Parses Tax Logic:</h3>
            <ul className="space-y-4 text-slate-400 mb-8">
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Intrastate Recognition:</strong> If your business state matches your customer's state, KhataX dynamically splits the GST into CGST and SGST on the PDF export natively.</span>
               </li>
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Interstate Recognition:</strong> If you are shipping out of state, KhataX consolidates the tax string into an IGST block.</span>
               </li>
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Input Tax Credit (ITC):</strong> By utilizing the KhataX AI Receipt Scanner, your purchases are aggressively logged, preserving your ITC and netting your monthly payout accurately.</span>
               </li>
            </ul>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl flex gap-4 items-start">
               <AlertTriangle className="text-yellow-500 w-6 h-6 shrink-0 mt-1" />
               <div>
                  <h4 className="font-bold text-yellow-500">A Note on E-Invoicing</h4>
                  <p className="text-sm text-yellow-500/80 mt-1">If your business aggregates over ₹5 Crore in annual turnover, you are mandated by the NIC for E-invoicing (IRN). KhataX Enterprise contains the B2B E-invoice JSON generator embedded natively.</p>
               </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#0a0a0a] border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
