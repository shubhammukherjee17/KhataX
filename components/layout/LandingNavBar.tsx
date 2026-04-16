'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/icon.png';
import { Menu, X } from 'lucide-react';
import { LandingNavAuth } from './LandingNavAuth';
import { motion, AnimatePresence } from 'framer-motion';

export function LandingNavBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Product', href: '#product' },
    { name: 'Features', href: '#features' },
    { name: 'Demo', href: '#demo' },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image src={logo} alt="KhataX Logo" width={32} height={32} className="rounded-lg object-contain" />
          <span className="font-bold text-xl tracking-tight text-white">KhataX</span>
        </div>
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="text-sm font-semibold text-slate-300 hover:text-white transition relative group"
            >
              {link.name}
              <motion.span 
                className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ea77] transition-all duration-300 group-hover:w-full"
              />
            </Link>
          ))}
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'max-content' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden absolute top-20 left-0 right-0 bg-[#0a0a0a] border-b border-white/5 p-6 flex flex-col gap-6 shadow-2xl overflow-hidden origin-top"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link 
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="text-xl font-medium text-slate-300 hover:text-white inline-block w-full"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-white/10 w-full flex justify-start"
            >
              <LandingNavAuth />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
