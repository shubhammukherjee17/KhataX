'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ChevronDown, ArrowRight, Lock, MapPin, Building2, Check } from 'lucide-react';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    gstin: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const handleNext = () => setStep(step + 1);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* Top Header for Mobile */}
      <div className="lg:hidden p-6 bg-[#0a0a0a] border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00ea77] flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-[2px]"></div>
          </div>
          <span className="font-bold text-lg tracking-tight text-white">KhataX</span>
        </div>
        <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Login</Link>
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex w-[35%] bg-[#111] border-r border-white/5 p-12 flex-col relative shadow-[10px_0_40px_rgba(0,0,0,0.5)] z-10">
        <div className="flex items-center gap-2 mb-20 text-white">
          <div className="w-8 h-8 rounded-lg bg-[#00ea77] flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">KhataX</span>
        </div>

        <div className="flex-1">
          <div className="relative isolate px-4">
            {/* Step Line */}
            <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-white/10 -z-10"></div>

            <div className="space-y-12">
              {/* Step 1 */}
              <div className="flex gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-[#111] ${step >= 1 ? 'bg-[#00ea77] text-black shadow-lg shadow-[#00ea77]/20 relative z-10' : 'bg-white/10 text-slate-500 relative z-10'}`}>
                  {step > 1 ? <Check className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <div className={`${step === 1 ? 'opacity-100' : 'opacity-40'} pt-1`}>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">STEP 01</p>
                  <h3 className="font-bold text-white text-lg mb-1">Business Details</h3>
                  <p className="text-sm text-slate-400 font-medium">Basic information about your company.</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-[#111] ${step >= 2 ? 'bg-[#00ea77] text-black shadow-lg shadow-[#00ea77]/20 relative z-10' : 'bg-white/5 text-slate-600 relative z-10'}`}>
                  {step > 2 ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className={`${step === 2 ? 'opacity-100' : 'opacity-40'} pt-1`}>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">STEP 02</p>
                  <h3 className="font-bold text-white text-lg mb-1">Contact Info</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Primary contact and address<br />details.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-6 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-[#111] ${step >= 3 ? 'bg-[#00ea77] text-black shadow-lg shadow-[#00ea77]/20 relative z-10' : 'bg-white/5 text-slate-600 relative z-10'}`}>
                  {step > 3 ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </div>
                <div className={`${step === 3 ? 'opacity-100' : 'opacity-40'} pt-1`}>
                  <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-1">STEP 03</p>
                  <h3 className="font-bold text-white text-lg mb-1">Secure Account</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">Set up your credentials and<br />security.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 mt-12 bg-[#00ea77]/5 p-4 rounded-xl border border-[#00ea77]/10">
          <ShieldCheck className="w-5 h-5 text-[#00ea77] shrink-0 mt-0.5" />
          <p className="text-sm font-bold text-slate-400 leading-relaxed">
            Your data is secured with enterprise-grade encryption.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col pt-12 lg:pt-8 bg-[#0a0a0a] relative">
        <div className="hidden lg:flex justify-end pr-12 absolute top-12 right-0 w-full">
          <p className="text-sm font-medium text-slate-500">
            Already have an account? <Link href="/login" className="text-white font-bold hover:text-[#00ea77] transition-colors ml-1">Login</Link>
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 pb-24 lg:p-12">
          <div className="w-full max-w-[480px]">

            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-2">Registration Flow</p>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                  Tell us about your <br /> business
                </h1>
                <p className="text-slate-400 font-medium text-lg leading-relaxed mb-10">
                  We&apos;ll use this information to tailor your dashboard experience and ensure regulatory compliance.
                </p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex gap-1 items-center">
                      Business Name <span className="text-[#00ea77] text-base leading-none">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div className="space-y-2 relative">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex gap-1 items-center">
                      Industry Type <span className="text-[#00ea77] text-base leading-none">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium appearance-none"
                      >
                        <option value="">Select an industry</option>
                        <option value="retail">Retail & E-commerce</option>
                        <option value="software">Software & IT</option>
                        <option value="services">Professional Services</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold tracking-widest text-slate-400 uppercase">GSTIN</label>
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">OPTIONAL</span>
                    </div>
                    <input
                      type="text"
                      value={formData.gstin}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium uppercase"
                      placeholder="Enter 15-digit GSTIN"
                      maxLength={15}
                    />
                    <p className="text-xs text-slate-500 font-medium">Providing GSTIN helps in faster tax reconciliation.</p>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!formData.businessName || !formData.industry}
                    className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-black font-bold text-base bg-[#00ea77] hover:bg-[#00c563] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)] mt-8 gap-2 group tracking-wide uppercase text-sm"
                  >
                    Continue to Contact Info <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-xs font-medium text-slate-500 px-8 pt-4">
                    By continuing, you agree to our <Link href="#" className="font-bold text-white underline underline-offset-2 decoration-white/20 hover:text-[#00ea77] hover:decoration-[#00ea77]/50 transition-colors">Terms of Service</Link> and <Link href="#" className="font-bold text-white underline underline-offset-2 decoration-white/20 hover:text-[#00ea77] hover:decoration-[#00ea77]/50 transition-colors">Privacy Policy</Link>.
                  </p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-2">Registration Flow</p>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                  Secure Account
                </h1>
                <p className="text-slate-400 font-medium text-lg mb-10">
                  Let&apos;s create your login credentials for KhataX.
                </p>

                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex gap-1 items-center">
                      Admin Email <span className="text-[#00ea77] text-base leading-none">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium"
                      placeholder="admin@company.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex gap-1 items-center">
                      Password <span className="text-[#00ea77] text-base leading-none">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium"
                      placeholder="Create a strong password"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 mt-8">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 flex justify-center items-center py-4 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.email || !formData.password}
                      className="w-2/3 flex justify-center items-center py-4 px-4 rounded-xl text-black font-bold uppercase text-sm tracking-wide bg-[#00ea77] hover:bg-[#00c563] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)] flex-1 gap-2"
                    >
                      {loading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* Footer Links */}
        <div className="absolute bottom-8 w-full flex justify-center gap-8 text-[11px] font-bold tracking-widest text-slate-500 uppercase lg:pl-12">
          <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
          <Link href="#" className="hover:text-white transition-colors">Security</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
        </div>
      </div>

    </div>
  );
}
