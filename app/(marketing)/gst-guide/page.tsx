import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, AlertTriangle, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'GST Compliance Guide | GononaX',
  description: 'Understand Indian GST mechanisms and how GononaX automates filing.',
};

export default function GSTGuidePage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ea77]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">GST Compliance Guide</h1>
          <p className="text-xl text-[#00ea77] mb-12">Navigating the Indian Taxation System with GononaX.</p>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><FileText className="text-[#00ea77]" /> Automated GST Calculation</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Managing Goods and Services Tax can be complex for businesses with high invoice volumes. GononaX simplifies this by automatically applying the correct taxes based on your item <strong>HSN/SAC codes</strong> and customer state.
            </p>
            
            <h3 className="text-lg font-bold text-white mb-4">How Tax Calculation Works:</h3>
            <ul className="space-y-4 text-slate-400 mb-8">
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Intrastate Sales:</strong> If you're selling within the same state, GononaX automatically splits the applicable tax into CGST and SGST on your invoices.</span>
               </li>
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Interstate Sales:</strong> When generating invoices for customers outside your state, GononaX seamlessly applies the unified IGST.</span>
               </li>
               <li className="flex gap-3">
                 <CheckCircle2 className="w-5 h-5 text-[#00ea77] shrink-0" />
                 <span><strong>Input Tax Credit (ITC):</strong> By accurately tracking all your business expenses and purchases, GononaX helps ensure you claim your correct Input Tax Credit during filing.</span>
               </li>
            </ul>

            <div className="bg-[#00ea77]/5 border border-[#00ea77]/20 p-6 rounded-2xl flex gap-4 items-start">
               <AlertTriangle className="text-[#00ea77] w-6 h-6 shrink-0 mt-1" />
               <div>
                  <h4 className="font-bold text-[#00ea77]">A Note on E-Invoicing</h4>
                  <p className="text-sm text-[#00ea77]/80 mt-1">If your business exceeds the ₹5 Crore annual turnover threshold, you are required to generate E-invoices. Our Enterprise plan fully supports one-click B2B E-invoicing and IRN generation.</p>
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
