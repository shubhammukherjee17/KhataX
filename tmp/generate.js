const fs = require('fs');
const path = require('path');

const pages = [
  { slug: 'terms-of-service', title: 'Terms of Service', desc: 'Read the terms and conditions for using KhataX.' },
  { slug: 'privacy-policy', title: 'Privacy Policy', desc: 'How we collect, use, and protect your data.' },
  { slug: 'refund-policy', title: 'Refund Policy', desc: 'Our policies regarding subscriptions and refunds.' },
  { slug: 'integrations', title: 'Integrations', desc: 'Connect KhataX with your favorite tools.' },
  { slug: 'security', title: 'Security', desc: 'Enterprise-grade security protecting your financial data.' },
  { slug: 'api-docs', title: 'API Documentation', desc: 'Build on top of KhataX with our robust API.' },
  { slug: 'gst-guide', title: 'GST Guide', desc: 'Comprehensive guides for Indian GST compliance.' },
  { slug: 'help-center', title: 'Help Center', desc: 'Find answers, tutorials, and support.' },
  { slug: 'community', title: 'Community', desc: 'Join other business owners using KhataX.' }
];

const appDir = path.join(process.cwd(), 'app', '(marketing)');

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

pages.forEach(page => {
  const pageDir = path.join(appDir, page.slug);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const content = `import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '${page.title} | KhataX',
  description: '${page.desc}',
};

export default function ${page.slug.replace(/[^a-zA-Z]/g, '')}Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ea77]/30 selection:text-white font-sans flex flex-col">
      <header className="p-6 border-b border-white/10 flex items-center justify-between">
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
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">${page.title}</h1>
          <p className="text-xl text-[#00ea77] mb-12">${page.desc}</p>
          
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 md:p-12 prose prose-invert max-w-none">
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              Welcome to the ${page.title} page for KhataX. This page outlines our comprehensive platform capabilities and guidelines tailored for Indian SMBs.
            </p>
            <div className="h-px w-full bg-white/10 my-8"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Our Commitment</h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              At KhataX, we are building the definitive financial operating system for businesses. We ensure that our infrastructure meets the highest standards of reliability, security, and compliance.
            </p>
            <div className="p-6 rounded-2xl bg-[#00ea77]/5 border border-[#00ea77]/20 text-[#00ea77] font-medium">
              This section is currently being updated by our designated authorities. Specific sub-clauses and detailed documentation will be propagated here soon.
            </div>
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
`;

  fs.writeFileSync(path.join(pageDir, 'page.tsx'), content);
});

console.log('Successfully created all marketing pages.');
