'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Activity, ArrowUpRight, Check, CreditCard, PieChart, ShieldCheck, FileText, Blocks, Zap, QrCode, X as XIcon } from 'lucide-react';
import { LandingNavBar } from '@/components/layout/LandingNavBar';
import Image from 'next/image';
import logo from '@/app/icon.png';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from 'recharts';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { QRCodeSVG } from 'qrcode.react';
import { AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  useGSAP(() => {
    const hiddenElements = gsap.utils.toArray('.gsap-reveal');
    hiddenElements.forEach((el: any) => {
      gsap.fromTo(el,
        { y: 30, opacity: 0 },
        {
          scrollTrigger: { trigger: el, start: 'top 85%' },
          y: 0, opacity: 1, duration: 0.8, ease: 'power2.out'
        }
      );
    });

    gsap.fromTo('.mock-chart-container',
      { width: '100%' },
      {
        scrollTrigger: { trigger: '.product-demo-section', start: 'top 60%' },
        width: '0%', duration: 1.2, ease: 'power3.inOut'
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-neutral text-white selection:bg-brand-primary/20 selection:text-brand-primary font-sans relative overflow-hidden">
      {/* Custom Cursor removed as requested */}
      <LandingNavBar />

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 flex flex-col items-center text-center px-6 mt-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-12">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-[#18181a] font-mono text-sm text-zinc-300 mb-8"
            >
              Introducing GononaX Copilot <ArrowRight className="w-3 h-3 text-zinc-500" />
            </motion.div>

            <motion.h1
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="text-5xl md:text-7xl font-heading font-semibold tracking-tight leading-[1.1] mb-6 text-white"
            >
              Modern finance infrastructure for scaling businesses.
            </motion.h1>

            <motion.p
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.7 }}
              className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed font-light"
            >
              Manage ledgers, automate expense tracking, and monitor cash flow with precision. An integrated financial suite built for the Indian market.
            </motion.p>

            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.7 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
            >
              {/* Primary UI Kit Button (White/Light green bg, dark text) */}
              <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#f4fff9] text-brand-neutral px-8 py-3.5 rounded-lg font-heading font-semibold hover:bg-white transition shadow-[0_4px_14px_0_rgba(0,255,163,0.1)] active:scale-[0.98] duration-200">
                Start for free
              </Link>
              {/* Secondary UI Kit Button (Dark gray bg, white text) */}
              <a href="#demo" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1A1A1A] text-zinc-300 px-8 py-3.5 rounded-lg font-heading font-medium hover:bg-[#222] transition active:scale-[0.98] duration-200">
                <Play className="h-4 w-4 fill-zinc-400 text-zinc-400" /> Book a demo
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-20 relative w-full max-w-5xl mx-auto z-10 px-4 md:px-0"
          >
            <div className="bg-[#111] rounded-2xl p-2 border border-white/[0.05] shadow-2xl relative">
              <div className="bg-[#0A0A0A] rounded-xl border border-white/[0.08] overflow-hidden">
                {/* Desktop Header */}
                <div className="h-12 border-b border-white/[0.05] bg-[#0c0c0c] flex items-center px-4 gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                  </div>
                </div>
                {/* Dashboard layout */}
                <div className="flex h-[400px]">
                  <div className="w-56 border-r border-white/[0.05] p-4 hidden md:block">
                    <div className="h-6 w-24 bg-white/10 rounded mb-8"></div>
                    <div className="space-y-3">
                      {/* Brand primary active state in sidebar mockup */}
                      <div className="h-8 w-full bg-brand-primary/10 border-l-2 border-brand-primary rounded-r"></div>
                      <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                      <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                      <div className="h-4 w-full bg-white/5 rounded"></div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 relative">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="h-5 w-32 bg-white/10 rounded mb-2"></div>
                        <div className="h-3 w-48 bg-white/5 rounded"></div>
                      </div>
                      <div className="h-8 w-64 bg-[#181818] border border-white/5 rounded flex items-center px-3">
                        <div className="w-3 h-3 rounded-full bg-white/20 mr-2"></div>
                        <div className="h-2 w-12 bg-white/10 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="h-20 border border-white/[0.05] rounded-lg p-4 bg-[#111]">
                        <div className="h-3 w-16 bg-white/10 rounded mb-4"></div>
                        <div className="h-5 w-24 bg-white/70 rounded"></div>
                      </div>
                      <div className="h-20 border border-white/[0.05] rounded-lg p-4 bg-[#111]">
                        <div className="h-3 w-16 bg-white/10 rounded mb-4"></div>
                        <div className="h-5 w-32 bg-white/70 rounded"></div>
                      </div>
                      <div className="h-20 border border-white/[0.05] rounded-lg p-4 bg-brand-primary/[0.02] border-brand-primary/10">
                        <div className="h-3 w-16 bg-brand-primary/40 rounded mb-4"></div>
                        <div className="h-5 w-24 bg-brand-primary/80 rounded"></div>
                      </div>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6 h-32 border border-white/[0.05] rounded-lg bg-gradient-to-t from-white/[0.02] to-transparent"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- LOGO MARQUEE --- */}
        <section className="py-12 border-y border-white/[0.02] bg-brand-neutral overflow-hidden whitespace-nowrap relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-brand-neutral to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-brand-neutral to-transparent z-10"></div>

          <div className="flex justify-center mb-8">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-500">Powering finance for innovative companies</p>
          </div>
          <div className="inline-flex gap-20 items-center justify-around animate-[marquee_30s_linear_infinite] px-10">
            {['Acme Corp', 'Global Inc', 'Titan', 'Pulse', 'Veritas', 'Nova', 'Quantum'].map((logo, i) => (
              <div key={i} className="font-heading text-xl font-bold text-zinc-600 cursor-default">
                {logo}
              </div>
            ))}
            {['Acme Corp', 'Global Inc', 'Titan', 'Pulse', 'Veritas', 'Nova', 'Quantum'].map((logo, i) => (
              <div key={i + "dup"} className="font-heading text-xl font-bold text-zinc-600 cursor-default">
                {logo}
              </div>
            ))}
          </div>
        </section>

        {/* --- CORE PRODUCT DEMO --- */}
        <section id="demo" className="py-24 relative product-demo-section px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 gsap-reveal">
              <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight mb-4">Financial clarity, instantly.</h2>
              <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Monitor your cash flow, track expenses, and view real-time projections inside a dashboard built for speed.</p>
            </div>

            <div className="bg-[#111] p-1.5 rounded-2xl border border-white/[0.05] gsap-reveal">
              <div className="bg-brand-neutral rounded-[14px] border border-white/[0.05]">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="font-heading text-xl font-semibold text-white">Cash Flow</h3>
                      <p className="font-mono text-sm text-zinc-500 mt-1">Last 30 Days</p>
                    </div>
                    <div className="flex items-center gap-6 bg-[#18181a] px-4 py-2 rounded-lg border border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                        <p className="font-mono text-sm text-zinc-400">In</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                        <p className="font-mono text-sm text-zinc-400">Out</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] w-full relative">
                    <div className="absolute inset-0 z-10 w-full mock-chart-container pointer-events-none" style={{ backgroundColor: 'var(--color-brand-neutral)', transformOrigin: 'right', float: 'right' }}></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: '1st', in: 4000, out: 2400 },
                        { name: '5th', in: 3000, out: 1398 },
                        { name: '10th', in: 2000, out: 4800 },
                        { name: '15th', in: 2780, out: 3908 },
                        { name: '20th', in: 1890, out: 4800 },
                        { name: '25th', in: 2390, out: 3800 },
                        { name: '30th', in: 5500, out: 2300 },
                      ]}>
                        <defs>
                          <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#00FFA3" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#52525b" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#52525b" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#333" tick={{ fill: '#71717a', fontSize: 11, fontFamily: 'var(--font-space-grotesk)' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'var(--font-space-grotesk)' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="in" stroke="#00FFA3" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                        <Area type="monotone" dataKey="out" stroke="#52525b" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- INTELLIGENCE SECTION --- */}
        <section className="py-24 px-6 border-y border-white/[0.02] bg-[#0c0c0c]">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1 gsap-reveal">
              <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">
                Assisted by continuous intelligence.
              </h2>
              <p className="text-zinc-400 text-lg mb-8 font-light">
                GononaX reviews your ledgers and generates straightforward insights. It detects anomalies, sets up follow-ups, and prevents cash flow bottlenecks subtly in the background.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shrink-0">
                    <Check className="w-3 h-3 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-white text-base font-medium">Automated Reconciliation</h4>
                    <p className="text-zinc-500 text-sm mt-1">Match bank statements against invoices automatically.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="mt-1 w-6 h-6 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shrink-0">
                    <Check className="w-3 h-3 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="font-heading text-white text-base font-medium">Predictive Alerts</h4>
                    <p className="text-zinc-500 text-sm mt-1">Get notified of potential shortfalls 30 days in advance.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full gsap-reveal relative perspective-1000">
              <motion.div
                initial={{ rotateY: -5 }}
                whileHover={{ rotateY: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-brand-neutral border border-white/[0.05] rounded-2xl p-6 shadow-xl"
              >
                <div className="font-mono text-sm font-medium text-zinc-400 mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-tertiary" /> Insight Report
                </div>
                <div className="space-y-3">
                  <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/[0.02]">
                    <p className="font-heading text-white text-sm font-medium">3 recurring expenses increased by 15% this month.</p>
                    <p className="font-mono text-zinc-500 text-xs mt-2">Software subscriptions • AWS Hosting</p>
                  </div>
                  <div className="bg-[#1a1a1a] border border-brand-primary/20 rounded-xl p-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                    <p className="font-heading text-white text-sm font-medium">You have ₹1.2M in outstanding payments older than 30 days.</p>
                    <button className="mt-4 text-xs font-heading font-medium bg-brand-primary text-black hover:bg-[#00e08e] px-4 py-2 rounded-lg transition active:scale-95">
                      Draft reminder emails
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section id="features" className="py-24 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 gsap-reveal">
              <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-4">Complete financial toolkit.</h2>
              <p className="text-zinc-400">Everything required to operate smoothly.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: FileText, title: "Effortless Invoicing", desc: "Create, customize, and send professional invoices in clicks." },
                { icon: CreditCard, title: "Expense Tracking", desc: "Log vendor bills and categorize costs automatically." },
                { icon: Blocks, title: "GST Preparation", desc: "Export compliant reports ready for portal submission." },
                { icon: Activity, title: "Live Analytics", desc: "Customizable views. Deep dive into specific product metrics." },
                { icon: ShieldCheck, title: "Enterprise Security", desc: "Your financial data is encrypted at rest and in transit." },
                { icon: Zap, title: "API Integrations", desc: "Connect with existing CRMs and major Indian payment gateways." }
              ].map((feat, i) => (
                <FeatureCard key={i} feat={feat} />
              ))}
            </div>
          </div>
        </section>

        {/* --- PRICING SECTION --- */}
        <PricingSection />

        {/* --- FOOTER CTA --- */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto gsap-reveal bg-[#111] p-12 md:p-16 rounded-3xl border border-white/[0.05]">
            <h2 className="font-heading text-3xl md:text-5xl font-semibold text-white mb-6">
              Start building your financial foundation.
            </h2>
            <p className="text-zinc-400 text-lg mb-10">
              Join thousands of businesses streamlining their operations.
            </p>
            {/* Primary Button Kit */}
            <Link href="/login" className="inline-block px-10 py-4 bg-[#f4fff9] text-black rounded-lg font-heading font-bold hover:bg-white transition active:scale-[0.98]">
              Create an account
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-brand-neutral pt-16 pb-8 border-t border-white/[0.05] px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src={logo} alt="GononaX Logo" width={24} height={24} className="rounded object-contain" />
            <span className="font-heading font-bold text-white text-lg">GononaX</span>
          </div>

          <div className="flex gap-6 font-mono text-sm text-zinc-500">
            <Link href="/terms-of-service" className="hover:text-white transition">Terms</Link>
            <Link href="/privacy-policy" className="hover:text-white transition">Privacy</Link>
            <Link href="/security" className="hover:text-white transition">Security</Link>
            <span>© 2026 GononaX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ feat }: { feat: any }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-[#111] border border-white/[0.05] p-6 rounded-xl hover:bg-[#151515] hover:border-white/10 transition-colors cursor-default"
    >
      <div style={{ transform: "translateZ(10px)" }}>
        <div className="w-10 h-10 rounded bg-[#18181A] border border-white/5 flex items-center justify-center mb-6">
          <feat.icon className="w-5 h-5 text-brand-primary" />
        </div>
        <h3 className="font-heading text-lg font-medium mb-2 text-white">{feat.title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{feat.desc}</p>
      </div>
    </motion.div>
  );
}

function PricingSection() {
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
    <section id="pricing" className="py-24 px-6 border-y border-white/[0.02] relative">
      <AnimatePresence>
        {checkoutPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-[#111] border border-white/[0.05] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
            >
              <div className="p-6 border-b border-white/[0.05] flex justify-between items-center bg-[#0A0A0A]">
                <div>
                  <h3 className="text-xl font-heading font-bold text-white">Upgrade to {checkoutPlan.name}</h3>
                  <p className="font-mono text-xs font-semibold text-zinc-500 mt-1 uppercase tracking-wider">{isYearly ? 'Yearly' : 'Monthly'} Subscription</p>
                </div>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-brand-primary/10 text-brand-primary p-3 rounded-xl border border-brand-primary/20 mb-6">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="font-heading text-base font-semibold text-white mb-2">Scan to start your subscription</h4>
                <p className="text-sm font-medium text-zinc-400 mb-6">Complete your seamless, zero-fee UPI payment directly to GononaX Technologies.</p>
                <div className="bg-white p-4 rounded-xl shadow-[0_0_30px_rgba(0,255,163,0.1)] mb-6 inline-block border border-white/10">
                  <QRCodeSVG
                    value={`upi://pay?pa=7067294951@ptsbi&pn=GononaX%20Pro&am=${checkoutPlan.price}.00&cu=INR&tn=${encodeURIComponent(`GononaX ${checkoutPlan.name} Sub`)}`}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 mb-8 text-white">
                  <span className="font-heading text-4xl font-bold tracking-tight">
                    <AnimatedNumber value={checkoutPlan.price} format="currency" />
                  </span>
                  <span className="font-mono text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">.00</span>
                </div>
                <button
                  onClick={simulatedPaymentComplete}
                  className="w-full py-4 rounded-xl bg-[#f4fff9] text-brand-neutral font-heading font-bold text-base tracking-wide hover:bg-white transition active:scale-[0.98]"
                >
                  I have paid (Simulator)
                </button>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="w-full mt-3 py-3 rounded-xl border border-transparent text-zinc-400 font-medium text-sm hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <div className="text-center mb-16 gsap-reveal">
          <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight mb-4 text-white">Simple, predictable pricing.</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">Choose the plan that fits your business scale. No hidden fees.</p>

          <div className="inline-flex items-center bg-[#111] p-1.5 rounded-full border border-white/[0.05] shadow-inner relative z-0">
            <button
              onClick={() => setIsYearly(false)}
              className={`relative py-2 px-6 rounded-full font-heading font-semibold text-sm transition-colors duration-200 ${!isYearly ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              {!isYearly && <motion.div layoutId="pill-bg" className="absolute inset-0 bg-brand-primary rounded-full z-[-1]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative py-2 px-6 rounded-full font-heading font-semibold text-sm transition-colors duration-200 ml-1 ${isYearly ? 'text-black' : 'text-zinc-400 hover:text-white'}`}
            >
              {isYearly && <motion.div layoutId="pill-bg" className="absolute inset-0 bg-brand-primary rounded-full z-[-1]" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />}
              Yearly (Save up to 69%)
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 w-full gsap-reveal">
          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.05] rounded-[24px] p-8 flex flex-col">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">Essential</p>
            <h3 className="font-heading text-2.5xl font-bold mb-4 text-white">Starter</h3>
            <div className="flex items-center gap-2 mb-4 h-10">
              <span className="font-heading text-4xl leading-none font-bold text-white">
                <AnimatedNumber value={isYearly ? 899 : 149} format="currency" />
              </span>
              <div className="flex flex-col justify-end pb-1">
                <span className="font-mono text-zinc-500 text-sm leading-none">{isYearly ? '/year' : '/month'}</span>
              </div>
              {isYearly && (
                <span className="ml-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border border-brand-primary/20 self-end mb-1">
                  Save 50%
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-8 h-10">Perfect for freelancers & small shops</p>

            <div className="space-y-4 flex-1 mb-10">
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
                <span className="text-zinc-200">GST Invoicing & Filing</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
                <span className="text-zinc-200">Up to 100 Transactions/mo</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
                <span className="text-zinc-200">Inventory Management</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-zinc-600">
                <Check className="w-4 h-4 shrink-0 text-zinc-700 mt-0.5" />
                <span>No AI Assistant Features</span>
              </div>
            </div>

            <button onClick={() => handleCheckout('Starter', isYearly ? 899 : 149)} className="w-full py-3.5 rounded-xl border border-white/10 text-white font-heading font-semibold hover:bg-white/5 transition text-center inline-block">
              Get Started
            </button>
          </div>

          <div className="bg-[#111] border border-brand-primary shadow-[0_0_40px_rgba(0,255,163,0.05)] rounded-[24px] p-8 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-primary text-black font-mono text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.1em] shadow-sm">
              Most Popular
            </div>
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-brand-primary uppercase mb-4 mt-2">Automated</p>
            <h3 className="font-heading text-2.5xl font-bold mb-4 text-white">Professional</h3>
            <div className="flex items-center gap-2 mb-4 h-10">
              <span className="font-heading text-4xl leading-none font-bold text-white">
                <AnimatedNumber value={isYearly ? 1099 : 299} format="currency" />
              </span>
              <div className="flex flex-col justify-end pb-1">
                <span className="font-mono text-zinc-500 text-sm leading-none">{isYearly ? '/year' : '/month'}</span>
              </div>
              {isYearly && (
                <span className="ml-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-widest border border-brand-primary/20 self-end mb-1">
                  Save 69%
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-8 h-10">Scaling businesses needing speed</p>

            <div className="space-y-4 flex-1 mb-10">
              {['Everything in Starter', 'Unlimited Transactions', 'Full AI Assistant Access', 'Multi-GSTIN Support', 'Automated Reconciliation'].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
                  <span className="text-zinc-200">{feat}</span>
                </div>
              ))}
            </div>

            <button onClick={() => handleCheckout('Professional', isYearly ? 1099 : 299)} className="w-full py-3.5 rounded-xl bg-brand-primary text-black font-heading font-bold hover:bg-[#00ea77] transition text-center inline-block">
              Go Professional
            </button>
          </div>

          <div className="bg-[#111]/80 backdrop-blur-xl border border-white/[0.05] rounded-[24px] p-8 flex flex-col">
            <p className="font-mono text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4">Tailored</p>
            <h3 className="font-heading text-2.5xl font-bold mb-4 text-white">Enterprise</h3>
            <div className="flex items-end gap-1 mb-4 h-10">
              <span className="font-heading text-4xl leading-none font-bold text-white">Custom</span>
            </div>
            <p className="text-sm text-zinc-400 mb-8 h-10">For large organizations & franchises</p>

            <div className="space-y-4 flex-1 mb-10">
              {['Everything in Pro', 'Dedicated Account Manager', 'Custom API Integrations', 'On-premise Deployment'].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Check className="w-4 h-4 shrink-0 text-brand-primary mt-0.5" />
                  <span className="text-zinc-200">{feat}</span>
                </div>
              ))}
            </div>

            <button className="w-full py-3.5 rounded-xl border border-white/10 text-white font-heading font-semibold hover:bg-white/5 transition text-center inline-block">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}