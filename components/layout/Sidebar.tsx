import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  BarChart2,
  Percent,
  Settings,
  Wallet,
  ShoppingCart,
  ClipboardList,
  Calculator,
  Landmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}


const navItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sales', href: '/sales', icon: FileText },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { name: 'Orders (PO)', href: '/purchases/orders', icon: ClipboardList },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Items', href: '/inventory', icon: Package },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Margin Calc', href: '/tools/margin-calculator', icon: Calculator },
  { name: 'Tax Assistant', href: '/tools/tax-assistant', icon: Landmark },
  { name: 'GST', href: '/settings', icon: Percent },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

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
        "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-[#111] text-slate-300 border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-20 items-center px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00ea77] flex items-center justify-center shadow-[0_0_15px_rgba(0,234,119,0.3)]">
              <Wallet className="w-6 h-6 text-[#0b110e]" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white leading-tight">KhataX Pro</span>
              <span className="text-[10px] uppercase tracking-wider text-[#00ea77] font-semibold">Enterprise Edition</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6">
          <nav className="space-y-2 px-4">
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
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 overflow-hidden",
                    isActive
                      ? "bg-[#00ea77]/10 text-[#00ea77]"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00ea77] rounded-r-md"></div>
                  )}
                  <item.icon className={cn(
                    "h-[18px] w-[18px] flex-shrink-0",
                    isActive ? "text-[#00ea77]" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between rounded-xl bg-white/5 p-3 border border-white/10 hover:border-[#00ea77]/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-[#1a231f] flex items-center justify-center overflow-hidden">
                <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-none">{profile?.name || 'Aditya Sharma'}</span>
                <span className="text-xs text-slate-500 mt-1">{profile?.businesses?.[0]?.role === 'owner' ? 'Admin' : 'User'}</span>
              </div>
            </div>
            <button className="text-slate-500 hover:text-white transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
