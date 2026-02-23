'use client';

import { useAuth } from '@/hooks/useAuth';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  FileText, 
  Wallet, 
  AlertTriangle, 
  Users,
  Landmark,
  ChevronDown
} from 'lucide-react';

const salesData = [
  { name: 'JAN', value: 100 },
  { name: 'FEB', value: 150 },
  { name: 'MAR', value: 200 },
  { name: 'APR', value: 400 },
  { name: 'MAY', value: 150 },
  { name: 'JUN', value: 350 },
];

const expenseData = [
  { name: 'Rent', value: 40, color: '#00ea77' },
  { name: 'Inv', value: 20, color: '#009e52' },
  { name: 'Tax', value: 15, color: '#006536' },
  { name: 'Others', value: 25, color: '#003b1f' },
];

export default function DashboardPage() {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      
      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard 
          title="TOTAL RECEIVABLE" 
          val="₹45,200" 
          subtext="vs. last 30 days" 
          badge="+5.2%"
          badgeType="positive"
        />
        <KpiCard 
          title="TOTAL PAYABLE" 
          val="₹12,800" 
          subtext="Due in 7 days" 
          badge="-2.1%"
          badgeType="negative"
        />
        <KpiCard 
          title="CASH IN HAND" 
          val="₹85,400" 
          subtext="Steady liquidity" 
          icon={<Landmark className="w-5 h-5 text-[#00ea77]" />}
        />
        <KpiCard 
          title="NET PROFIT" 
          val="₹32,600" 
          subtext="Current quarter" 
          badge="+12.4%"
          badgeType="positive"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Sales Performance Area Chart */}
        <div className="col-span-2 rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white">Sales Performance</h2>
              <p className="text-sm text-slate-500">Monthly revenue overview</p>
            </div>
            <button className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-[#1a231f] px-4 py-2 rounded-lg hover:text-white transition-colors">
              Last 6 Months <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ea77" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00ea77" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} dy={10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0A0F0D', borderColor: '#1a231f', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#00ea77', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#00ea77" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown Donut Chart */}
        <div className="col-span-1 rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm flex flex-col">
          <div>
            <h2 className="text-lg font-bold text-white">Expense Breakdown</h2>
            <p className="text-sm text-slate-500">Allocation by category</p>
          </div>
          <div className="flex-1 relative flex items-center justify-center py-4">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0A0F0D', borderColor: '#1a231f', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-xs text-slate-500 font-bold mb-1">Total</span>
              <span className="text-xl font-bold text-white">₹42.8k</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-[#1a231f]">
            {expenseData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-medium text-slate-400">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <button className="text-xs font-bold text-[#00ea77] hover:underline">View All</button>
          </div>
          <div className="space-y-6">
            <ActivityRow 
              icon={<FileText className="w-4 h-4 text-[#00ea77]" />}
              iconBg="bg-[#0b2217]"
              title="Invoice #INV-2042 Generated"
              desc="For Rajesh Exports • ₹12,500"
              time="12:45 PM"
            />
            <ActivityRow 
              icon={<Wallet className="w-4 h-4 text-blue-400" />}
              iconBg="bg-blue-900/30"
              title="Payment Received"
              desc="From Sunita Furnitures • ₹8,000"
              time="10:30 AM"
            />
            <ActivityRow 
              icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
              iconBg="bg-red-900/30"
              title="Late Payment Alert"
              desc="Modern Retailers • 5 days overdue"
              time="YESTERDAY"
            />
            <ActivityRow 
              icon={<Users className="w-4 h-4 text-[#00ea77]" />}
              iconBg="bg-[#0b2217]"
              title="New Party Added"
              desc="Global Tech Solutions"
              time="YESTERDAY"
            />
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Inventory Alerts</h2>
            <div className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              4 LOW ITEMS
            </div>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a231f]">
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">ITEM NAME</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-center">CURRENT</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-center">REORDER LEVEL</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a231f]">
              <InventoryRow name="Wireless Keyboard X1" sku="SKU: HW-402" current={5} alert={true} reorder={20} />
              <InventoryRow name="HDMI Cables 2m" sku="SKU: CB-901" current={12} alert={true} reorder={15} />
              <InventoryRow name="Laser Paper A4" sku="SKU: ST-112" current={2} alert={true} reorder={50} />
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, val, subtext, badge, badgeType, icon }: { title: string, val: string, subtext: string, badge?: string, badgeType?: 'positive' | 'negative', icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm relative overflow-hidden group hover:border-[#00ea77]/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</h3>
        {badge && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded ${badgeType === 'positive' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'bg-red-500/10 text-red-500'}`}>
            {badge}
          </span>
        )}
        {icon && (
          <div className="p-1">
            {icon}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight">{val}</div>
        <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
      </div>
    </div>
  );
}

function ActivityRow({ icon, iconBg, title, desc, time }: { icon: React.ReactNode, iconBg: string, title: string, desc: string, time: string }) {
  return (
    <div className="flex items-start justify-between group">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
        </div>
      </div>
      <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 pt-1">{time}</span>
    </div>
  );
}

function InventoryRow({ name, sku, current, reorder, alert }: { name: string, sku: string, current: number, reorder: number, alert: boolean }) {
  return (
    <tr>
      <td className="py-4">
        <h4 className="text-sm font-bold text-slate-200">{name}</h4>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1">{sku}</p>
      </td>
      <td className="py-4 text-center">
        <span className={`text-sm font-bold ${alert ? (current < 10 ? 'text-red-500' : 'text-yellow-500') : 'text-slate-200'}`}>{current}</span>
      </td>
      <td className="py-4 text-center">
        <span className="text-sm font-bold text-slate-200">{reorder}</span>
      </td>
      <td className="py-4 text-right">
        <button className="text-[10px] font-bold tracking-wider uppercase bg-[#00ea77]/10 text-[#00ea77] hover:bg-[#00ea77] hover:text-black transition-colors px-3 py-1.5 rounded">
          Restock
        </button>
      </td>
    </tr>
  );
}
