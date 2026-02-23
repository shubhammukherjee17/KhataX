import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart2, 
  Landmark,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sales / Invoices', href: '/sales', icon: FileText },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCart },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Parties', href: '/parties', icon: Users },
  { name: 'Banking & Cash', href: '/banking', icon: Landmark },
  { name: 'Reports', href: '/reports', icon: BarChart2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white shadow-xl">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-blue-400">
          <Landmark className="h-6 w-6" />
          <span>KhataX</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                )} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-800 p-3 text-xs text-slate-400 text-center">
          KhataX v1.0 <br /> Business Manager
        </div>
      </div>
    </div>
  );
}
