'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { LandingNavAuth } from './LandingNavAuth';

export function LandingNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00ea77] flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-sm"></div>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">KhataX</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-white transition">Product</Link>
          <Link href="#features" className="hover:text-white transition">Features</Link>
          <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
          <Link href="#demo" className="hover:text-white transition">Demo</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <LandingNavAuth />
          </div>
          
          <button 
            className="md:hidden text-slate-300 p-2 hover:bg-white/5 rounded-lg transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col gap-6 shadow-2xl h-[calc(100vh-80px)]">
          <div className="flex flex-col gap-6">
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Product</Link>
            <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Features</Link>
            <Link href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Pricing</Link>
            <Link href="#demo" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-medium text-slate-300 hover:text-white">Demo</Link>
          </div>
          <div className="pt-6 border-t border-white/10 w-full flex justify-start">
            <LandingNavAuth isMobile={true} />
          </div>
        </div>
      )}
    </nav>
  );
}
