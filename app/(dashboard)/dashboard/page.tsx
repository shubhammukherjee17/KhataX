'use client';

import { 
  ArrowUpRight, 
  ArrowDownRight, 
  IndianRupee, 
  TrendingUp, 
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Welcome back, {profile?.name || 'User'}. Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="Total Sales" 
          value="₹1,24,500" 
          change="+12.5%" 
          trend="up" 
          icon={<IndianRupee className="h-5 w-5 text-green-600" />} 
        />
        <KpiCard 
          title="Total Expenses" 
          value="₹45,200" 
          change="-4.2%" 
          trend="down" 
          icon={<ArrowDownRight className="h-5 w-5 text-red-600" />} 
        />
        <KpiCard 
          title="Accounts Receivable" 
          value="₹12,400" 
          change="5 Invoices Pending" 
          trend="neutral" 
          icon={<Receipt className="h-5 w-5 text-blue-600" />} 
        />
        <KpiCard 
          title="Accounts Payable" 
          value="₹8,100" 
          change="3 Bills Pending" 
          trend="neutral" 
          icon={<TrendingUp className="h-5 w-5 text-orange-600" />} 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Cash Flow</h2>
          </div>
          <div className="flex h-[300px] items-center justify-center text-slate-400 bg-slate-50 rounded border border-dashed">
            [Chart Component Placeholder: Recharts AreaChart]
          </div>
        </div>

        <div className="col-span-3 rounded-xl border bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Low Stock Alerts
            </h2>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium text-sm">Product Name {i}</p>
                  <p className="text-xs text-slate-500">Category: Electronics</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">5 PCS</p>
                  <p className="text-xs text-slate-500">Min: 10</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, trend, icon }: { title: string, value: string, change: string, trend: 'up' | 'down' | 'neutral', icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between space-y-0 mb-2">
        <h3 className="tracking-tight text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-md">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <p className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
          {trend === 'up' ? <ArrowUpRight className="inline h-3 w-3 mr-1" /> : trend === 'down' ? <ArrowDownRight className="inline h-3 w-3 mr-1" /> : null}
          {change} from last month
        </p>
      </div>
    </div>
  );
}
