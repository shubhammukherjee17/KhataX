import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Refund Policy | GononaX',
  description: 'Understand the GononaX cancellation and refund policies.',
};

export default function RefundPolicyPage() {
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
        <div className="max-w-3xl w-full relative z-10">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Refund & Cancellation</h1>
            <p className="text-lg text-slate-400">Simple and transparent guidelines on subscription cancellations.</p>
          </div>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 space-y-8 text-slate-300 leading-relaxed">
            
            <div className="flex gap-4">
              <RefreshCw className="w-6 h-6 text-[#00ea77] shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">1. 14-Day Money-Back Guarantee</h3>
                <p>GononaX provides a 14-day refund window for all new <strong>Yearly</strong> subscriptions. If our platform doesn't meet your business needs, simply cancel within the first 14 days for a full refund, no questions asked.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-[#00ea77] shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">2. Monthly Subscriptions</h3>
                <p>Monthly subscriptions (e.g., ₹299/mo) are non-refundable once billed. However, you can cancel your subscription at any time to prevent future billing, and you will continue to have access until the end of your billing cycle.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 mt-8">
              <p className="text-white font-bold mb-2">How to Cancel Your Subscription:</p>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-400">
                 <li>Go to Settings &gt; Billing.</li>
                 <li>Click on 'Cancel Subscription'.</li>
                 <li>If you are eligible for a refund under our 14-day yearly guarantee, the amount will be credited back to your original payment method within 5-7 business days.</li>
              </ul>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
