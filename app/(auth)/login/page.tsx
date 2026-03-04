'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Loader2, Check } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white font-sans">

      {/* Left Dark Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#111] border-r border-white/5 text-white p-12 flex-col relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-20 relative z-10">
          <div className="w-8 h-8 rounded-lg bg-[#00ea77] flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight">KhataX</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1]">
            Empower your <br />
            business with <br />
            <span className="text-[#00ea77]">AI-first</span> <br />
            accounting.
          </h1>
          <p className="text-slate-400 text-lg mb-12 max-w-md">
            Automate your invoicing and expense tracking with our intelligent premium platform.
          </p>

          {/* Glowing element */}
          <div className="absolute top-[80%] left-[-10%] w-72 h-72 bg-[#00ea77]/20 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Invoice Mockup Card */}
          <div className="bg-[#111]/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#00ea77] uppercase mb-1">INVOICE #8842</p>
                <h3 className="text-white font-bold text-lg">Design Agency Co.</h3>
              </div>
              <span className="text-xs font-bold text-[#00ea77] bg-[#00ea77]/10 px-3 py-1 rounded-full border border-[#00ea77]/20">PAID</span>
            </div>
            <div className="w-3/4 h-2 bg-white/5 rounded-full mb-3"></div>
            <div className="w-1/2 h-2 bg-white/5 rounded-full mb-8"></div>
            <div className="flex justify-between items-end">
              <span className="text-sm text-slate-500 font-medium tracking-wide">Total Amount</span>
              <span className="text-3xl font-bold text-white">$4,250.00</span>
            </div>
          </div>
        </div>

        <div className="mt-auto relative z-10 pt-12">
          <p className="text-slate-500 text-sm italic">&quot;The most intuitive financial platform we&apos;ve ever used.&quot; — CEO, KhataX</p>
        </div>
      </div>

      {/* Right Light Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="w-full max-w-[440px]">

          {/* Top Toggle */}
          <div className="flex bg-white/5 p-1.5 rounded-xl mb-12 border border-white/10">
            <button className="flex-1 py-2.5 text-sm font-bold bg-[#00ea77]/10 text-[#00ea77] rounded-lg shadow-sm border border-[#00ea77]/20">
              Login
            </button>
            <Link href="/signup" className="flex-1 py-2.5 text-sm font-bold text-slate-500 text-center hover:text-white transition-colors">
              Sign Up
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
            <p className="text-slate-400 font-medium">Please enter your details to sign in.</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-[#111] border border-white/10 rounded-xl hover:bg-white/5 transition-colors font-bold text-white mb-6 group disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="text-xs font-bold text-slate-500 tracking-widest">OR SIGN IN WITH EMAIL</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-500/20">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase" htmlFor="email">Business Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold tracking-widest text-slate-400 uppercase" htmlFor="password">Password</label>
                <Link href="#" className="text-xs font-bold text-[#00ea77] hover:text-[#00c563] transition-colors">Forgot Password?</Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="w-full px-4 py-3.5 bg-[#111] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 transition-colors placeholder:text-slate-600 text-white font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center mb-6 pt-2">
              <div className="flex items-center h-5">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    id="remember"
                    type="checkbox"
                    className="appearance-none w-5 h-5 bg-[#111] border border-white/20 rounded checked:bg-[#00ea77] checked:border-[#00ea77] transition-colors cursor-pointer"
                  />
                  <Check className="w-3 h-3 text-black absolute pointer-events-none opacity-0 data-[checked=true]:opacity-100" />
                </div>
              </div>
              <div className="ml-3">
                <label htmlFor="remember" className="text-sm font-bold text-slate-400 cursor-pointer">
                  Keep me signed in
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-4 px-4 rounded-xl text-sm font-bold text-black bg-[#00ea77] hover:bg-[#00c563] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00ea77] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)] uppercase tracking-widest gap-2"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
              {!loading && <span className="text-lg leading-none">→</span>}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400 font-medium">
            New to the platform? <Link href="/signup" className="text-white border-b border-white/20 font-bold pb-0.5 hover:text-[#00ea77] hover:border-[#00ea77] transition-colors">Create an account</Link>
          </p>

        </div>

        <div className="absolute bottom-8 flex gap-6 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
