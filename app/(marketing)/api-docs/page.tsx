import Link from 'next/link';
import { ArrowLeft, Code, Database, Lock, Zap } from 'lucide-react';

export const metadata = {
  title: 'API Documentation | KhataX',
  description: 'Build on top of KhataX with our robust headless APIs.',
};

export default function ApiDocsPage() {
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
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00ea77]/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-4xl w-full relative z-10">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#00ea77] mb-6">REST API V2.0</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Developer API Docs</h1>
          <p className="text-xl text-slate-400 mb-12">Integrate KhataX's ledger engine programmatically into your existing IT infrastructure using our secure Headless REST endpoints.</p>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12">
            <h2 className="text-2xl font-bold text-white mb-6">Core Capabilities</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-12">
               <div className="p-6 rounded-2xl bg-[#18181b] border border-white/5">
                 <Code className="text-[#00ea77] w-6 h-6 mb-4" />
                 <h3 className="font-bold mb-2">Automated Invoicing APIs</h3>
                 <p className="text-sm text-slate-400">Trigger invoice generation from your proprietary POS systems. Pass the parameters via JSON and receive a signed `pdf_url` instantly.</p>
               </div>
               <div className="p-6 rounded-2xl bg-[#18181b] border border-white/5">
                 <Database className="text-[#00ea77] w-6 h-6 mb-4" />
                 <h3 className="font-bold mb-2">Inventory Sync</h3>
                 <p className="text-sm text-slate-400">Synchronize your local godown ERP with KhataX securely. Live Webhook listeners for stock reduction events across all nodes.</p>
               </div>
               <div className="p-6 rounded-2xl bg-[#18181b] border border-white/5">
                 <Lock className="text-[#00ea77] w-6 h-6 mb-4" />
                 <h3 className="font-bold mb-2">Stateless Auth (JWT)</h3>
                 <p className="text-sm text-slate-400">All Enterprise API calls are secured via rotating JWT protocols natively synced with your Firebase Authentication layers.</p>
               </div>
               <div className="p-6 rounded-2xl bg-[#18181b] border border-white/5">
                 <Zap className="text-[#00ea77] w-6 h-6 mb-4" />
                 <h3 className="font-bold mb-2">GraphQL Alpha</h3>
                 <p className="text-sm text-slate-400">Reduce over-fetching with our new GraphQL endpoints designed for custom Dashboard aggregations and metric plotting.</p>
               </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Authentication Header</h2>
            <div className="bg-black p-4 rounded-xl border border-white/10 mb-8 font-mono text-sm text-green-400 overflow-x-auto">
              curl -X GET "https://api.khatax.com/v2/transactions" \<br />
              -H "Authorization: Bearer YOUR_ENTERPRISE_API_KEY" \<br />
              -H "Content-Type: application/json"
            </div>

            <p className="text-slate-400 leading-relaxed mb-6">
              Our API is currently in Closed Beta for Enterprise clients. If you are on an Enterprise Vault plan, reach out to your Account Manager for the exact Swagger definitions and Sandbox Vault API keys.
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#00ea77] text-black rounded-xl font-bold hover:bg-[#00c563] transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
