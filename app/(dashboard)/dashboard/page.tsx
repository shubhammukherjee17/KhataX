'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  FileText,
  Wallet,
  AlertTriangle,
  Users,
  Landmark,
  ChevronDown,
  TrendingDown,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { format, differenceInDays, isSameDay, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { parties } = useMasterDataStore();
  const { transactions } = useTransactionStore();

  const customers = parties.filter(p => p.type === 'customer');

  const { totalOutstanding, overdueAmount, todayCollections, upcomingDues, riskyRetailers, salesData, expenseData, totalExpenseMonth } = useMemo(() => {
    let outstanding = 0;
    let overdue = 0;
    let collections = 0;
    let upcoming = 0;
    const today = new Date();

    const riskyTemp: { id: string, name: string, owed: number, overdue: number, risk: string, phone?: string }[] = [];

    // Calculate Today's Collections
    transactions.forEach(tx => {
      if (tx.type === 'payment_in' || (tx.type === 'sale_invoice' && tx.amountPaid > 0)) {
        const txDate = new Date(tx.date);
        const paymentAmount = tx.type === 'payment_in' ? tx.grandTotal : tx.amountPaid;
        if (isSameDay(txDate, today)) {
          collections += paymentAmount;
        }
      }
    });

    customers.forEach(customer => {
      if (customer.currentBalance < 0) {
        const owed = Math.abs(customer.currentBalance);
        outstanding += owed;

        let customerOverdue = 0;
        let customerUpcoming = 0;

        const customerTxs = transactions.filter(t => t.partyId === customer.id && t.type === 'sale_invoice');

        customerTxs.forEach((tx) => {
          const remaining = tx.grandTotal - (tx.amountPaid || 0);
          if (remaining > 0) {
            const invoiceDate = new Date(tx.date);
            const daysSinceInvoice = differenceInDays(today, invoiceDate);
            const creditDays = customer.creditDays !== undefined ? customer.creditDays : 30;

            // Overdue
            if (daysSinceInvoice > creditDays) {
              customerOverdue += remaining;
            }
            // Upcoming (Due in next 7 days)
            else if (creditDays - daysSinceInvoice <= 7 && creditDays - daysSinceInvoice >= 0) {
              customerUpcoming += remaining;
            }
          }
        });

        overdue += customerOverdue;
        upcoming += customerUpcoming;

        // Determine Risk
        if (customerOverdue > 0 || (customer.creditLimit && owed >= customer.creditLimit * 0.9)) {
          riskyTemp.push({
            ...customer,
            owed,
            overdue: customerOverdue,
            risk: customerOverdue > 0 ? 'High' : 'Medium'
          });
        }
      }
    });

    riskyTemp.sort((a, b) => b.overdue - a.overdue || b.owed - a.owed);

    // Sales Data Calculation (Last 6 Months)
    const last6Months = Array.from({ length: 6 }).map((_, i) => subMonths(today, 5 - i));
    const computedSalesData = last6Months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      
      let monthSales = 0;
      transactions.forEach(tx => {
        if (tx.type === 'sale_invoice') {
          const txDate = new Date(tx.date);
          if (isWithinInterval(txDate, { start, end })) {
            monthSales += tx.grandTotal;
          }
        }
      });
      
      return {
        name: format(month, 'MMM').toUpperCase(),
        value: monthSales
      };
    });

    // Expense Data Calculation (Purchases this month mapped by top vendors)
    const vendorPurchases: Record<string, number> = {};
    let totalPurchasesForMonth = 0;
    
    transactions.forEach(tx => {
      if (tx.type === 'purchase_invoice') {
        const txDate = new Date(tx.date);
        if (isWithinInterval(txDate, { start: startOfMonth(today), end: endOfMonth(today) })) {
          vendorPurchases[tx.partyName] = (vendorPurchases[tx.partyName] || 0) + tx.grandTotal;
          totalPurchasesForMonth += tx.grandTotal;
        }
      }
    });

    const colors = ['#00ea77', '#009e52', '#006536', '#003b1f'];
    const sortedVendors = Object.entries(vendorPurchases).sort((a,b) => b[1] - a[1]);
    const top3 = sortedVendors.slice(0, 3);
    const others = sortedVendors.slice(3).reduce((acc, [_, val]) => acc + val, 0);
    
    const rawExpenseData = [];
    let colorIndex = 0;
    
    top3.forEach(([name, value]) => {
      rawExpenseData.push({ name: name.substring(0, 10) + (name.length > 10 ? '...' : ''), value, color: colors[colorIndex++] });
    });
    
    if (others > 0) {
      rawExpenseData.push({ name: 'Others', value: others, color: colors[colorIndex] });
    }

    if (rawExpenseData.length === 0) {
      rawExpenseData.push({ name: 'No Expenses', value: 1, color: '#1a231f' });
    }

    // Convert values to percentages for the tooltip display
    const computedExpenseData = rawExpenseData.map(item => ({
      ...item,
      percentage: totalPurchasesForMonth > 0 && item.name !== 'No Expenses' ? Math.round((item.value / totalPurchasesForMonth) * 100) : (item.name === 'No Expenses' ? 0 : 100)
    }));

    return {
      totalOutstanding: outstanding,
      overdueAmount: overdue,
      todayCollections: collections,
      upcomingDues: upcoming,
      riskyRetailers: riskyTemp.slice(0, 10),
      salesData: computedSalesData,
      expenseData: computedExpenseData,
      totalExpenseMonth: totalPurchasesForMonth
    };
  }, [customers, transactions]);

  return (
    <div className="space-y-6">

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="TOTAL OUTSTANDING"
          val={`₹${totalOutstanding.toFixed(2)}`}
          subtext="Amount owed by customers"
          icon={<Wallet className="w-5 h-5 text-blue-500" />}
        />
        <KpiCard
          title="OVERDUE AMOUNT"
          val={`₹${overdueAmount.toFixed(2)}`}
          subtext="Past payment terms"
          badge="High Priority"
          badgeType="negative"
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
        />
        <KpiCard
          title="TODAY'S COLLECTIONS"
          val={`₹${todayCollections.toFixed(2)}`}
          subtext="Payments received today"
          icon={<Landmark className="w-5 h-5 text-[#00ea77]" />}
        />
        <KpiCard
          title="UPCOMING DUES (7d)"
          val={`₹${upcomingDues.toFixed(2)}`}
          subtext="Due in next 7 days"
          icon={<Clock className="w-5 h-5 text-yellow-500" />}
        />
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/sales/new" className="flex items-center gap-3 bg-[#121c17] border border-[#1a231f] hover:border-[#00ea77]/50 rounded-xl p-4 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-black transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">Create Invoice</span>
        </Link>
        <Link href="/purchases" className="flex items-center gap-3 bg-[#121c17] border border-[#1a231f] hover:border-[#00ea77]/50 rounded-xl p-4 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-black transition-colors">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">Add Purchase</span>
        </Link>
        <Link href="/parties" className="flex items-center gap-3 bg-[#121c17] border border-[#1a231f] hover:border-[#00ea77]/50 rounded-xl p-4 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-[#00ea77]/10 flex items-center justify-center text-[#00ea77] group-hover:bg-[#00ea77] group-hover:text-black transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">Manage Parties</span>
        </Link>
        <Link href="/inventory" className="flex items-center gap-3 bg-[#121c17] border border-[#1a231f] hover:border-[#00ea77]/50 rounded-xl p-4 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-black transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">Add Items</span>
        </Link>
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
                    <stop offset="5%" stopColor="#00ea77" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ea77" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} dy={10} />
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
              <span className="text-xs text-slate-500 font-bold mb-1">Total (Month)</span>
              <span className="text-xl font-bold text-white">₹{totalExpenseMonth >= 1000 ? (totalExpenseMonth/1000).toFixed(1) + 'k' : totalExpenseMonth.toFixed(0)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-3 pt-4 border-t border-[#1a231f]">
            {expenseData.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs font-medium text-slate-400">{item.name} {item.percentage > 0 && `(${item.percentage}%)`}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top 10 Risky Retailers */}
      <div className="rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-red-500" />
            Risky Retailers
          </h2>
          <div className={`bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider`}>
            {riskyRetailers.length} RETAILERS
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a231f]">
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">RETAILER</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-right">TOTAL OWED</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-red-500/70 text-right">OVERDUE</th>
                <th className="pb-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a231f]">
              {riskyRetailers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-500 text-sm">
                    No risky retailers currently. Great job on collections!
                  </td>
                </tr>
              ) : (
                riskyRetailers.map(r => (
                  <tr key={r.id} className="group">
                    <td className="py-4">
                      <Link href={`/parties/${r.id}`} className="text-sm font-bold text-slate-200 group-hover:text-blue-400 block">
                        {r.name}
                      </Link>
                      <p className="text-[10px] font-bold mt-1">
                        <span className={r.risk === 'High' ? 'text-red-500' : 'text-yellow-500'}>{r.risk} Risk</span>
                      </p>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-bold text-slate-200">₹{r.owed.toFixed(2)}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-sm font-bold text-red-400">{r.overdue > 0 ? `₹${r.overdue.toFixed(2)}` : '-'}</span>
                    </td>
                    <td className="py-4 text-right">
                      {r.phone ? (
                        <a
                          href={`https://wa.me/91${r.phone}?text=Hello ${r.name}, this is a gentle reminder for your outstanding balance of ₹${r.owed.toFixed(2)}${r.overdue > 0 ? ` (Overdue: ₹${r.overdue.toFixed(2)})` : ''}. Please process the payment at your earliest convenience.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold tracking-wider uppercase bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors px-3 py-1.5 rounded"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">No Phone</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
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



