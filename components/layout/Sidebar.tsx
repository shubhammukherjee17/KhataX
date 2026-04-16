import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '@/app/icon.png';
import {
  Home,
  BarChart2,
  ShoppingCart,
  ClipboardList,
  Users,
  Package,
  FileText,
  Sparkles,
  Calculator,
  Landmark,
  Settings,
  HelpCircle,
  Plus,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Sales', href: '/sales', icon: BarChart2 },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { name: 'Orders', href: '/purchases/orders', icon: ClipboardList },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Items', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'AI Insights', href: '/tools/ai-insights', icon: Sparkles },
  { name: 'Margin Calculator', href: '/tools/margin-calculator', icon: Calculator },
  { name: 'Tax Assistant', href: '/tools/tax-assistant', icon: Landmark },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, logout } = useAuth();

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, setIsOpen]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#0a0a0a] text-slate-300 border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-24 items-center px-6 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,163,0.1)] overflow-hidden">
               <Image src={logo} alt="KhataX" width={32} height={32} className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-xl tracking-tight text-white leading-tight">KhataX Pro</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#00FFA3] font-bold mt-0.5">Enterprise Vault</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 layout-scrollbar">
          <nav className="space-y-1.5 px-3">
            {navItems.map((item) => {
              const exactMatch = pathname === item.href || (pathname === '/' && item.name === 'Home');
              const partialMatch = pathname.startsWith(item.href + '/') && item.name !== 'Home';
              const isPurchasesPOConflict = item.href === '/purchases' && pathname.startsWith('/purchases/orders');
              const isActive = exactMatch || (partialMatch && !isPurchasesPOConflict);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] font-heading font-semibold transition-all duration-200 overflow-hidden",
                    isActive
                      ? "bg-[#111] text-white"
                      : "text-zinc-500 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-brand-primary rounded-r-md shadow-[0_0_8px_rgba(0,255,163,0.8)]"></div>
                  )}
                  <item.icon className={cn(
                    "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                    isActive ? "text-brand-primary" : "text-zinc-500 group-hover:text-zinc-400"
                  )} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 space-y-6">
          <Link
            href="/sales/new"
            className="flex w-full items-center justify-center gap-2 bg-brand-primary text-black font-heading font-bold px-4 py-3 rounded-xl hover:bg-brand-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,163,0.2)] active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" strokeWidth={2.5} /> New Transaction
          </Link>

          <div className="flex flex-col gap-3 px-4 pb-4">
            <Link href="/settings" className="flex items-center gap-3 text-[13px] font-medium text-zinc-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4 text-zinc-600" /> Settings
            </Link>
            <Link href="/support" className="flex items-center gap-3 text-[13px] font-medium text-zinc-500 hover:text-white transition-colors">
              <HelpCircle className="w-4 h-4 text-zinc-600" /> Support
            </Link>
            <button onClick={logout} className="flex items-center gap-3 text-[13px] font-medium text-zinc-500 hover:text-red-500 group transition-colors mt-1 w-full text-left">
              <LogOut className="w-4 h-4 text-zinc-600 group-hover:text-red-500 transition-colors" /> Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
