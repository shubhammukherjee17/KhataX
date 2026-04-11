'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, ArrowRight, CheckCircle2, FileText, PieChart, Bell, Zap, ArrowUpRight, Check, X, QrCode } from 'lucide-react';
import { LandingNavBar } from '@/components/layout/LandingNavBar';
import { QRCodeSVG } from 'qrcode.react';
export default function LandingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [checkoutPlan, setCheckoutPlan] = useState<{ name: string; price: number } | null>(null);

  const handleCheckout = (name: string, price: number) => {
    setCheckoutPlan({ name, price });
  };

  const simulatedPaymentComplete = () => {
    alert(`Testing Mode: Successfully upgraded to ${checkoutPlan?.name}! In production, this would trigger after webhook confirmation.`);
    setCheckoutPlan(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00ea77] selection:text-black font-sans relative">
      
      {/* Checkout Modal Overlay */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in slide-in-from-bottom-8 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
              <div>
                <h3 className="text-xl font-bold text-white">Upgrade to {checkoutPlan.name}</h3>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{isYearly ? 'Yearly' : 'Monthly'} Subscription</p>
              </div>
              <button 
                onClick={() => setCheckoutPlan(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                aria-label="Close Checkout"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-8 flex flex-col items-center text-center">
              <div className="bg-[#00ea77]/10 text-[#00ea77] p-3 rounded-full mb-6">
                <QrCode className="w-8 h-8" />
              </div>
              
              <h4 className="text-sm font-bold text-slate-300 mb-2">Scan to start your subscription</h4>
              <p className="text-xs font-medium text-slate-500 mb-6">
                Complete your seamless, zero-fee UPI payment directly to KhataX Technologies.
              </p>

              <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(0,234,119,0.15)] mb-6 inline-block">
                <QRCodeSVG 
                  value={`upi://pay?pa=7067294951@ptsbi&pn=KhataX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`KhataX ${checkoutPlan.name} Sub`)}`} 
                  size={200} 
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-3xl font-black tracking-tight flex items-start">
                  <span className="text-xl mt-1 mr-1 text-[#00ea77]">₹</span>
                  {checkoutPlan.price}
                </span>
                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-2">.00</span>
              </div>

              <div className="flex flex-col items-center mb-8 w-full border-t border-white/5 pt-6">
                <p className="text-[10px] text-slate-500 font-bold mb-3 uppercase tracking-wider">Tap to Pay via App</p>
                <div className="flex flex-wrap justify-center gap-2">
                   <a 
                     href={`gpay://upi/pay?pa=7067294951@ptsbi&pn=KhataX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`KhataX ${checkoutPlan.name} Sub`)}`}
                     className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                   >
                     GPay
                   </a>
                   <a 
                     href={`phonepe://pay?pa=7067294951@ptsbi&pn=KhataX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`KhataX ${checkoutPlan.name} Sub`)}`}
                     className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                   >
                     PhonePe
                   </a>
                   <a 
                     href={`paytmmp://pay?pa=7067294951@ptsbi&pn=KhataX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`KhataX ${checkoutPlan.name} Sub`)}`}
                     className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                   >
                     Paytm
                   </a>
                   <a 
                     href={`upi://pay?pa=7067294951@ptsbi&pn=KhataX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`KhataX ${checkoutPlan.name} Sub`)}`}
                     className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                   >
                     Any UPI App
                   </a>
                </div>
              </div>

              <button 
                onClick={simulatedPaymentComplete}
                className="w-full py-4 rounded-xl bg-[#00ea77] text-black font-bold text-sm tracking-wide hover:bg-[#00c563] transition shadow-[0_0_20px_rgba(0,234,119,0.2)]"
              >
                I have paid (Simulator)
              </button>
              <button 
                onClick={() => setCheckoutPlan(null)}
                className="w-full mt-3 py-3 rounded-xl border border-transparent text-slate-400 font-semibold text-sm hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <LandingNavBar />

      <main>
        {/* Hero Section */}
        <section id="product" className="relative pt-24 pb-32 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ea77]/10 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00ea77] mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00ea77] animate-pulse"></span>
                NEW: AI TAX ASSISTANT
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Smarter Invoicing <br />
                <span className="text-[#00ea77]">& GST.</span> Less Effort.
              </h1>
              
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                Automate your business finances, stay GST compliant, and get paid 3x faster with our intuitive management suite. Built for modern Indian enterprises.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00ea77] text-black px-8 py-4 rounded-full font-semibold hover:bg-[#00c563] transition text-lg">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Link>
                <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition text-lg">
                  <Play className="h-5 w-5 fill-white" /> Watch Demo
                </a>
              </div>

              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-slate-800 flex items-center justify-center overflow-hidden">
                      <Image src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Avatar" width={40} height={40} className="w-[40px] h-[40px] object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-400">
                  Join <strong className="text-white">10,000+</strong> businesses already growing with us.
                </p>
              </div>
            </div>

            {/* Dashboard Mockup abstract */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="aspect-[4/3] rounded-2xl bg-[#111] border border-white/10 p-6 shadow-2xl relative">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">Cash Flow Overview</h3>
                  <p className="text-sm text-slate-500">LAST 30 DAYS</p>
                </div>
                <div className="flex items-end gap-3 h-48 mb-6">
                  {[40, 60, 30, 80, 50, 90].map((h, i) => (
                    <div key={i} className="flex-1 bg-[#00ea77] rounded-sm relative group cursor-pointer" style={{ height: `${h}%` }}>
                      <div className={`absolute inset-0 bg-black/20 group-hover:bg-transparent transition rounded-sm ${i === 5 ? 'bg-transparent' : ''}`}></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between border-t border-white/10 pt-6">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">GST Collected</p>
                    <p className="text-xl font-bold">₹8.1L</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Pending</p>
                    <p className="text-xl font-bold">₹12.4L</p>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 shadow-xl w-64 rotate-[-2deg]">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-xs font-semibold text-slate-400 tracking-wider">NEW INVOICE</span>
                    <CheckCircle2 className="w-4 h-4 text-[#00ea77]" />
                  </div>
                  <div className="w-3/4 h-2 bg-slate-800 rounded-full mb-2"></div>
                  <div className="w-1/2 h-2 bg-slate-800 rounded-full mb-6"></div>
                  <div className="flex justify-between items-end">
                    <span className="text-2xl font-bold">₹1,24,000</span>
                    <span className="text-xs font-semibold bg-[#00ea77]/20 text-[#00ea77] px-2 py-1 rounded">SENT</span>
                  </div>
                </div>

                <div className="absolute -right-6 -top-6 bg-[#1a1a1a] border border-white/10 rounded-xl p-3 shadow-xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00ea77]/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-[#00ea77]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">GST Compliant</p>
                    <p className="text-xs text-slate-400">Auto-filing Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="py-10 border-y border-white/5 bg-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-bold tracking-[0.2em] text-slate-500 mb-8 uppercase">Trusted by modern industry leaders</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition duration-500">
              {['FLASH', 'CODEBASE', 'NEXUS', 'ORBIT', 'PRISM'].map((logo, i) => (
                <div key={i} className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" /> {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#00ea77] mb-6">
                PREMIUM ENTERPRISE SUITE
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Powerful tools for <span className="text-[#00ea77]">modern business</span>
              </h2>
              <p className="text-lg text-slate-400">
                Everything you need to manage GST, track real-time cash flow, and automate your back-office operations in one high-performance interface.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: FileText, title: "GST-Compliant Invoicing", desc: "Generate professional, tax-ready bills in seconds with automated HSN lookups and tax calculations." },
                { icon: PieChart, title: "Smart Payment Tracking", desc: "Real-time updates on pending receivables with automated follow-ups for outstanding client payments." },
                { icon: Box, title: "Inventory & Stock Alerts", desc: "Intelligent stock monitoring system that notifies you before high-demand items run out." },
                { icon: ScanFace, title: "AI Bill Scan", desc: "OCR-powered data entry. Just snap a photo of any vendor bill and let AI extract the line items automatically." }
              ].map((ft, i) => (
                <div key={i} className="bg-[#111] border border-white/5 rounded-2xl p-8 hover:bg-[#161616] transition group">
                  <div className="w-12 h-12 rounded-xl bg-[#00ea77]/10 text-[#00ea77] flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <ft.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{ft.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{ft.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section id="demo" className="py-20">
          <div className="max-w-7xl mx-auto px-6">
             <div className="bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden">
               <div className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden flex">
                  {/* Sidebar mockup */}
                  <div className="w-64 border-r border-white/5 p-6 hidden md:block">
                    <div className="flex items-center gap-2 mb-10">
                      <div className="w-6 h-6 rounded bg-[#00ea77]"></div>
                      <span className="font-bold">KhataX</span>
                    </div>
                    <div className="space-y-2">
                       {['Overview', 'Finances', 'Sales', 'Customers'].map((item, i) => (
                         <div key={i} className={`px-4 py-2.5 rounded-lg text-sm font-medium ${i === 0 ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white'}`}>
                           {item}
                         </div>
                       ))}
                    </div>
                  </div>
                  {/* Main Content Mockup */}
                  <div className="flex-1 p-8 lg:p-12">
                     <div className="flex justify-between items-center mb-10">
                        <div>
                          <h3 className="text-2xl font-bold">Sales Summary</h3>
                          <p className="text-slate-400 text-sm mt-1">Real-time performance metrics</p>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium">Last 30 Days</button>
                          <button className="px-4 py-2 bg-[#00ea77] text-black rounded-lg text-sm font-medium">Export PDF</button>
                        </div>
                     </div>
                     <div className="grid md:grid-cols-3 gap-6 mb-10">
                       {[
                         { label: 'TOTAL REVENUE', val: '$128,430.00', plus: true, pct: '+12.5%' },
                         { label: 'OUTSTANDING', val: '$32,150.24', plus: false, pct: '-4.2%' },
                         { label: 'COLLECTED', val: '$96,280.00', plus: true, pct: '+15.8%' }
                       ].map((stat, i) => (
                         <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
                           <p className="text-xs font-semibold tracking-wider text-slate-500 mb-2">{stat.label}</p>
                           <div className="flex items-center gap-3">
                             <span className="text-2xl md:text-3xl font-bold">{stat.val}</span>
                             <span className={`text-xs font-bold px-2 py-1 rounded bg-white/5 ${stat.plus ? 'text-[#00ea77]' : 'text-red-500'}`}>{stat.pct}</span>
                           </div>
                         </div>
                       ))}
                     </div>
                     <div className="h-64 bg-[#1a1a1a] border border-white/5 rounded-xl p-6 relative overflow-hidden">
                       <p className="text-sm font-medium text-slate-400 mb-4">Cash Flow Velocity</p>
                       <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#00ea77]/20 to-transparent"></div>
                       {/* SVG Wave */}
                       <svg className="absolute bottom-0 left-0 w-full h-[120px]" preserveAspectRatio="none" viewBox="0 0 1440 320">
                         <path fill="none" stroke="#00ea77" strokeWidth="4" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64"></path>
                       </svg>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* AI Assistant Section */}
        <section id="ai" className="py-32 bg-[#111] border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00ea77]/5 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ea77]/10 text-xs font-semibold text-[#00ea77] mb-6 border border-[#00ea77]/20">
                <span className="w-2 h-2 rounded-full bg-[#00ea77] animate-pulse"></span>
                LIVE AI AGENTS ACTIVE
              </div>
              <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                    Your Daily Business Assistant
                  </h2>
                  <p className="text-lg text-slate-400">
                    Proactive automation that identifies bottlenecks and resolves them before they become problems.
                  </p>
                </div>
                <Link href="/login" className="flex items-center gap-2 text-[#00ea77] font-semibold hover:text-[#00c563] transition shrink-0">
                  View all AI Capabilities <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               {[
                 { icon: Bell, title: "Follow up overdue payments", text: "12 pending invoices require attention. 4 clients have exceeded 30 days. Send personalized reminders?", action: "Run Action", sub: "DISMISS INTELLIGENCE" },
                 { icon: Box, title: "Low stock alerts", text: "5 critical items are below the safety threshold. Predicted out-of-stock in 48 hours. Generate purchase orders?", action: "View Inventory", sub: "CONFIGURE THRESHOLDS" },
                 { icon: FileText, title: "GST Reconciliation", text: "Found 3 discrepancies between GSTR-2B and your purchase ledger. Action required for ITC optimization.", action: "Reconcile Now", sub: "DOWNLOAD REPORT" }
               ].map((ai, i) => (
                 <div key={i} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 flex flex-col h-full hover:border-[#00ea77]/30 transition group">
                   <div className="w-10 h-10 rounded-lg bg-[#00ea77]/10 text-[#00ea77] flex items-center justify-center mb-6">
                     <ai.icon className="w-5 h-5" />
                   </div>
                   <h3 className="text-xl font-semibold mb-3">{ai.title}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed mb-8 flex-1">{ai.text}</p>
                   
                   <div className="space-y-4">
                     <button className="w-full py-3 rounded-lg bg-white/5 text-[#00ea77] font-semibold text-sm hover:bg-[#00ea77]/10 transition flex items-center justify-center gap-2 border border-white/5">
                       {ai.action} <ArrowUpRight className="w-4 h-4" />
                     </button>
                     <p className="text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase cursor-pointer hover:text-slate-300 transition">
                       {ai.sub}
                     </p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-32">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-slate-400 mb-10">
                Choose the plan that fits your business scale. No hidden fees, no complicated tiers.
              </p>

              <div className="inline-flex bg-white/5 p-1 rounded-full border border-white/10 relative">
                <div 
                  className="absolute top-1 bottom-1 bg-[#00ea77] rounded-full transition-all duration-300 ease-in-out z-0" 
                  style={{ 
                    left: isYearly ? '124px' : '4px', 
                    width: isYearly ? '160px' : '120px' 
                  }}
                ></div>
                <button 
                  onClick={() => setIsYearly(false)}
                  className={`w-[120px] py-2 rounded-full font-semibold text-sm transition relative z-10 ${!isYearly ? 'text-black' : 'text-slate-300 hover:text-white'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsYearly(true)}
                  className={`w-[160px] py-2 rounded-full font-semibold text-sm transition relative z-10 ${isYearly ? 'text-black' : 'text-slate-300 hover:text-white'}`}
                >
                  Yearly (Save 20%)
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
              {/* Plan 1 */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">ESSENTIAL</p>
                <h3 className="text-2xl font-bold mb-4">Starter</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">{isYearly ? '₹1,299' : '₹149'}</span>
                  <span className="text-slate-500 mb-1">{isYearly ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-slate-400 mb-8 h-10">Perfect for freelancers & small shops</p>
                
                <div className="space-y-4 flex-1 mb-8">
                  {['GST Invoicing & Filing', 'Up to 100 Transactions/mo', 'Inventory Management', 'No AI Assistant Features'].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Check className={`w-5 h-5 shrink-0 ${i === 3 ? 'text-slate-600' : 'text-[#00ea77]'}`} />
                      <span className={i === 3 ? 'text-slate-600' : 'text-slate-300'}>{feat}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleCheckout('Starter', isYearly ? 1299 : 149)}
                  className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition"
                >
                  Get Started
                </button>
              </div>

              {/* Plan 2 */}
              <div className="bg-[#1a1a1a] border-2 border-[#00ea77] rounded-3xl p-8 flex flex-col relative transform md:-translate-y-4 shadow-2xl">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00ea77] text-black text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
                  MOST POPULAR
                </div>
                <p className="text-xs font-bold tracking-widest text-[#00ea77] uppercase mb-2">AUTOMATED</p>
                <h3 className="text-2xl font-bold mb-4">Professional</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">{isYearly ? '₹1,899' : '₹299'}</span>
                  <span className="text-slate-500 mb-1">{isYearly ? '/year' : '/mo'}</span>
                </div>
                <p className="text-sm text-slate-400 mb-8 h-10">Scaling businesses needing speed</p>
                
                <div className="space-y-4 flex-1 mb-8">
                  {['Everything in Starter', 'Unlimited Transactions', 'Full AI Assistant Access', 'Multi-GSTIN Support', 'Automated Reconciliation'].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-[#00ea77] shrink-0" />
                      <span className="text-slate-200">{feat}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleCheckout('Professional', isYearly ? 1899 : 299)}
                  className="w-full py-4 rounded-xl bg-[#00ea77] text-black font-semibold hover:bg-[#00c563] transition shadow-[0_0_20px_rgba(0,234,119,0.3)]"
                >
                  Go Professional
                </button>
              </div>

              {/* Plan 3 */}
              <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col">
                <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-2">TAILORED</p>
                <h3 className="text-2xl font-bold mb-4">Enterprise</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-sm text-slate-400 mb-8 h-10">For large organizations & franchises</p>
                
                <div className="space-y-4 flex-1 mb-8">
                  {['Everything in Pro', 'Dedicated Account Manager', 'Custom API Integrations', 'On-premise Deployment'].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-[#00ea77] shrink-0" />
                      <span className="text-slate-300">{feat}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full py-4 rounded-xl border border-white/10 text-white font-semibold hover:bg-white/5 transition">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#00ea77] to-[#00b35c] rounded-[2rem] p-12 lg:p-16 text-center relative overflow-hidden">
            <svg className="absolute top-0 right-0 w-64 h-64 text-white opacity-10 transform translate-x-1/4 -translate-y-1/4" viewBox="0 0 100 100">
               <polygon points="50 15, 100 100, 0 100" fill="currentColor" />
            </svg>
            <h2 className="text-3xl md:text-5xl font-bold text-black mb-6 relative z-10">
              Ready to modernize your business?
            </h2>
            <p className="text-black/80 text-lg mb-10 max-w-2xl mx-auto relative z-10 font-medium">
              Join 10,000+ businesses owners who&apos;re saving 15+ hours weekly with KhataX.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/login" className="px-8 py-4 bg-black text-white rounded-full font-semibold hover:bg-slate-900 transition text-lg">
                Start Free Trial
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pt-20 pb-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded bg-[#00ea77] flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-sm"></div>
                </div>
                <span className="font-bold text-xl">KhataX</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                Empowering Indian businesses with AI-driven compliance and intelligent automation. The future of accounting is here.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#00ea77]">
                <CheckCircle2 className="w-3 h-3" /> Made for Indian SMBs
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Product</h4>
              <ul className="space-y-5 text-sm">
                <li>
                  <Link href="#features" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">Features & Tools</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Explore our core ERP modules</span>
                  </Link>
                </li>
                <li>
                  <Link href="#ai" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">KhataX AI Suite</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Tax Assistant & Intelligence</span>
                  </Link>
                </li>
                <li>
                  <Link href="/integrations" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">Live Integrations</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Banking & Payment protocols</span>
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">Enterprise Security</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">End-to-end Vault encryption</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Resources</h4>
              <ul className="space-y-5 text-sm">
                <li>
                  <Link href="/gst-guide" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">GST Compliance Guide</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Filing & tax slab tutorials</span>
                  </Link>
                </li>
                <li>
                  <Link href="/help-center" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">Support Center</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">24/7 technical assistance</span>
                  </Link>
                </li>
                <li>
                  <Link href="/api-docs" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">Developer API Docs</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Headless REST endpoints</span>
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="group block">
                    <span className="text-slate-400 group-hover:text-[#00ea77] transition block">KhataX Community</span>
                    <span className="text-[11px] text-slate-600 mt-1 block">Connect with business owners</span>
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h4 className="font-semibold text-white mb-6">Newsletter</h4>
              <p className="text-sm text-slate-400 mb-4">Get the latest updates right to your inbox.</p>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert("Successfully subscribed to KhataX insights!"); e.currentTarget.reset(); }}>
                <input 
                  type="email" 
                  required
                  suppressHydrationWarning
                  placeholder="Email address" 
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none focus:border-[#00ea77]/50"
                />
                <button type="submit" className="bg-[#00ea77] text-black px-4 rounded-lg flex items-center justify-center hover:bg-[#00c563] transition shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-slate-500 gap-4">
            <p>© 2026 KhataX Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/terms-of-service" className="hover:text-white transition">Terms of Service</Link>
              <Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
              <Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

    // Temporary icons for features that aren't imported previously
function Box(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
}
function ScanFace(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
}
