'use client';

import { useAuth } from '@/hooks/useAuth';
import { useMemo, useEffect } from 'react';
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useBankStore } from '@/store/useBankStore';
import { format, isSameDay, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function DashboardPage() {
  const { user, profile, businessId } = useAuth();
  const { parties } = useMasterDataStore();
  const { transactions } = useTransactionStore();
  const { accounts, fetchAccounts } = useBankStore();

  useEffect(() => {
    // Ensure bank accounts are loaded for the current business
    if (businessId) {
      useBankStore.getState().setBusinessId(businessId);
    }
  }, [businessId]);

  const { totalLiquidity, todayRevenue, openInvoicesCount, totalExpenseMonth, recentTransactions, chartData, distributionData, topPartiesData } = useMemo(() => {
    const today = new Date();

    // 1. Net Liquidity
    let liquidity = 0;
    accounts.forEach(acc => {
      liquidity += acc.currentBalance;
    });

    if (liquidity === 0 && transactions.length > 0) {
      // Fallback pseudo-liquidity if they haven't set up bank accounts
      let calculated = 0;
      transactions.forEach(t => {
        if (t.type === 'sale_invoice' || t.type === 'payment_in') calculated += t.amountPaid;
        if (t.type === 'purchase_invoice' || t.type === 'payment_out') calculated -= t.amountPaid;
      });
      liquidity = Math.max(0, calculated); // Avoid negative liquidity for display purporses uness actual
    }

    // 2. Daily Revenue
    let dailyRev = 0;

    // 3. Open Invoices
    let openInvCount = 0;

    // 4. Total Expenses (Month)
    let totalExpense = 0;
    const startMonth = startOfMonth(today);
    const endMonth = endOfMonth(today);

    transactions.forEach(tx => {
      const txDate = new Date(tx.date);

      // Revenue today
      if (tx.type === 'sale_invoice' || tx.type === 'payment_in') {
        const amount = tx.type === 'sale_invoice' ? tx.grandTotal : tx.grandTotal; // Use grandTotal for sales created today as revenue booked today?
        // Or cash collected today? The prompt implied booked revenue
        if (isSameDay(txDate, today) && tx.type === 'sale_invoice') {
          dailyRev += tx.grandTotal;
        }
      }

      // Open Invoices
      if (tx.type === 'sale_invoice' && tx.status !== 'paid') {
        openInvCount++;
      }

      // Expenses this month
      if (tx.type === 'purchase_invoice') {
        if (isWithinInterval(txDate, { start: startMonth, end: endMonth })) {
          totalExpense += tx.grandTotal;
        }
      }
    });

    // 5. Recent Transactions
    // Get last 5, map them cleanly
    const recent = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(tx => {
        let isDebit = false; // Money going OUT (our perspective)
        let amount = tx.grandTotal;

        if (tx.type === 'purchase_invoice' || tx.type === 'payment_out') {
          isDebit = true;
          amount = tx.type === 'payment_out' ? tx.grandTotal : tx.grandTotal;
        }

        let txTypeLabel = '';
        if (tx.type === 'sale_invoice') txTypeLabel = 'Sale Invoice';
        else if (tx.type === 'purchase_invoice') txTypeLabel = 'Purchase Bill';
        else if (tx.type === 'payment_in') txTypeLabel = 'Payment Received';
        else if (tx.type === 'payment_out') txTypeLabel = 'Payment Sent';
        else if (tx.type === 'purchase_order') txTypeLabel = 'Purchase Order';
        else if (tx.type === 'estimate') txTypeLabel = 'Estimate';

        const partyName = tx.partyName || 'Unknown';

        // Friendly time string
        const diffHours = Math.floor((today.getTime() - new Date(tx.date).getTime()) / (1000 * 60 * 60));
        let timeStr = '';
        if (diffHours < 24) {
          timeStr = diffHours <= 0 ? 'Just now' : `${diffHours} hours ago`;
        } else {
          const diffDays = Math.floor(diffHours / 24);
          if (diffDays === 1) timeStr = 'Yesterday';
          else timeStr = `${diffDays} days ago`;
        }

        return {
          id: tx.id,
          title: partyName,
          subtitle: `${txTypeLabel} • ${timeStr}`,
          amount,
          isDebit,
          statusBadge: isDebit ? 'DEBIT' : 'CREDIT'
        };
      });

    // 6. Last 7 Days Chart Data (Revenue vs Expenses)
    const dynamicChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayLabel = format(d, 'MMM dd');
      
      let dayRev = 0;
      let dayExp = 0;
      
      transactions.forEach(tx => {
        if (isSameDay(new Date(tx.date), d)) {
          if (tx.type === 'sale_invoice' || tx.type === 'payment_in') {
            dayRev += tx.amountPaid || tx.grandTotal;
          } else if (tx.type === 'purchase_invoice' || tx.type === 'payment_out') {
            dayExp += tx.amountPaid || tx.grandTotal;
          }
        }
      });
      
      dynamicChartData.push({
        name: dayLabel,
        Revenue: dayRev,
        Expenses: dayExp
      });
    }


    let totalSalesVolume = 0;
    let totalPurchasesVolume = 0;

    transactions.forEach(tx => {
      const amt = tx.grandTotal;
      if (tx.type === 'sale_invoice' || tx.type === 'payment_in') {
         totalSalesVolume += amt;
      } else if (tx.type === 'purchase_invoice' || tx.type === 'payment_out') {
         totalPurchasesVolume += amt;
      }
    });

    const dData = [
      { name: 'Income', value: totalSalesVolume },
      { name: 'Expenses', value: totalPurchasesVolume }
    ];

    const partyVolumes: Record<string, number> = {};
    transactions.forEach(tx => {
       if (tx.partyName) {
         partyVolumes[tx.partyName] = (partyVolumes[tx.partyName] || 0) + tx.grandTotal;
       }
    });

    const pData = Object.entries(partyVolumes)
      .map(([name, volume]) => ({ name, volume }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    return {
      totalLiquidity: liquidity,
      todayRevenue: dailyRev,
      openInvoicesCount: openInvCount,
      totalExpenseMonth: totalExpense,
      recentTransactions: recent,
      chartData: dynamicChartData,
      distributionData: dData,
      topPartiesData: pData
    };
  }, [accounts, transactions]);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight leading-tight">Financial Intelligence</h1>
          <p className="text-zinc-400 font-medium text-sm mt-1">Overview for Global Vault #{businessId ? businessId.substring(0, 4) : '4920'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#111] border border-white/[0.05] px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse"></div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">Systems Nominal</span>
          </div>
          <div className="w-10 h-10 rounded-full border border-white/[0.05] overflow-hidden bg-[#111] flex flex-shrink-0 items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#00FFA3] font-bold text-sm uppercase">
                {(profile?.name || user?.displayName || user?.email || 'A').charAt(0)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Row 1: Liquidity & Predictive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Net Liquidity Card (Span 2) */}
        <div className="lg:col-span-2 bg-[#111] rounded-2xl p-8 border border-white/[0.05] shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-1 z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] font-heading font-bold text-[#00FFA3]">Net Liquidity</p>
              <h2 className="text-5xl font-black tracking-tighter text-white">
                ₹{totalLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#1a1a1a] flex items-center justify-center z-10">
              <TrendingUp className="w-5 h-5 text-zinc-400" />
            </div>
          </div>

          {/* Cash Flow Area Chart */}
          <div className="h-40 mt-8 -mx-2 z-10 relative cursor-crosshair">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FFA3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FFA3" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 'auto']} />
                <Area type="monotone" dataKey="Revenue" stroke="#00FFA3" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subtle Background glow */}
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00FFA3]/5 rounded-full blur-[80px] pointer-events-none"></div>
        </div>

        {/* Right: Predictive Analysis Card */}
        <div className="col-span-1 bg-[#111] rounded-2xl p-8 border border-white/[0.05] shadow-lg flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#00FFA3]" />
            <h3 className="text-sm font-heading font-bold text-white">Predictive Analysis</h3>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-auto">
            Cash flow optimization detected.<br />
            Reducing inventory lag could yield <span className="text-[#00FFA3] font-bold">+12.4%</span> margin by Q4.
          </p>

          <div className="mt-8 border border-white/[0.05] p-4 rounded-xl bg-[#0a0a0a]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[9px] uppercase tracking-[0.2em] font-mono font-heading font-bold text-zinc-400">Confidence Level</span>
              <span className="text-[10px] font-black text-[#00FFA3]">94%</span>
            </div>
            <div className="h-1.5 w-full bg-[#111] rounded-full overflow-hidden">
              <div className="h-full bg-[#00FFA3] rounded-full w-[94%] shadow-[0_0_10px_rgba(0,234,119,0.5)]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: 3 KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Daily Revenue */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/[0.05] flex items-center gap-5 shadow-sm hover:border-[#3f3f46] transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#00FFA3]/10 flex flex-shrink-0 items-center justify-center">
            <TrendingUp className="w-6 h-6 text-[#00FFA3]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Daily Revenue</p>
            <p className="text-2xl font-black text-white mt-0.5">
              ₹{todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Open Invoices */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/[0.05] flex items-center gap-5 shadow-sm hover:border-[#3f3f46] transition-colors">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex flex-shrink-0 items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Open Invoices</p>
            <p className="text-2xl font-black text-white mt-0.5">
              {openInvoicesCount} <span className="text-sm font-semibold text-zinc-400">Pending</span>
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/[0.05] flex items-center gap-5 shadow-sm hover:border-[#3f3f46] transition-colors">
          <div className="w-12 h-12 rounded-xl bg-[#00FFA3]/10 flex flex-shrink-0 items-center justify-center">
            <Wallet className="w-5 h-5 text-[#00FFA3]" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest">Total Expenses</p>
            <p className="text-2xl font-black text-white mt-0.5">
              ₹{totalExpenseMonth.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

      </div>

      {/* Row 3: Advanced Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Distribution */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/[0.05] shadow-sm flex flex-col">
          <h3 className="text-lg font-heading font-bold text-white mb-2">Cash Distribution</h3>
          <p className="text-[11px] uppercase font-bold text-zinc-400 tracking-widest mb-6">Income vs Expenses (All time)</p>
          <div className="flex-1 min-h-[250px] w-full relative">
            {distributionData[0].value === 0 && distributionData[1].value === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-zinc-400">No data available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#00FFA3" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#a1a1aa' }}/>
                  </PieChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Parties */}
        <div className="bg-[#111] rounded-2xl p-6 border border-white/[0.05] shadow-sm flex flex-col">
          <h3 className="text-lg font-heading font-bold text-white mb-2">Top Parties</h3>
          <p className="text-[11px] uppercase font-bold text-zinc-400 tracking-widest mb-6">By Total Transaction Volume</p>
          <div className="flex-1 min-h-[250px] w-full relative">
            {topPartiesData.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-zinc-400">No data available</div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topPartiesData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 12, fontWeight: 'bold' }} width={80} />
                    <Tooltip 
                      cursor={{ fill: '#27272a', opacity: 0.4 }}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Volume']}
                    />
                    <Bar dataKey="volume" fill="#00FFA3" radius={[0, 4, 4, 0]} barSize={20}>
                       {
                         topPartiesData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00FFA3' : '#00c563'} />
                         ))
                       }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Transactions */}
      <div className="bg-[#111] rounded-2xl border border-white/[0.05] overflow-hidden shadow-sm">
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/[0.05]">
          <h2 className="text-lg font-heading font-bold text-white">Recent Transactions</h2>
          <Link href="/reports" className="text-[10px] font-heading font-bold tracking-widest uppercase text-[#00FFA3] hover:text-[#00c563] transition-colors">
            View Archive
          </Link>
        </div>

        <div className="divide-y divide-[#27272a]">
          {recentTransactions.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-sm font-medium">No recent transactions.</div>
          ) : (
            recentTransactions.map((tx, idx) => (
              <div key={idx} className="flex items-center justify-between px-8 py-5 hover:bg-[#1a1a1a]/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex flex-shrink-0 items-center justify-center group-hover:bg-[#3f3f46] transition-colors">
                    {/* Alternate icons based on party name first letter to look nice dynamically */}
                    <span className="text-zinc-400 font-bold text-sm uppercase">
                      {tx.title.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-heading font-bold text-white">{tx.title}</p>
                    <p className="text-xs font-medium text-zinc-400 mt-0.5">{tx.subtitle}</p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-end gap-1">
                  <p className={`text-sm font-black ${tx.isDebit ? 'text-red-500' : 'text-[#00FFA3]'}`}>
                    {tx.isDebit ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </p>
                  <span className={`text-[8px] font-black uppercase tracking-[0.2em] font-mono px-2 py-0.5 rounded ${tx.isDebit ? 'bg-red-500/10 text-red-500' : 'bg-[#00FFA3]/10 text-[#00FFA3]'
                    }`}>
                    {tx.statusBadge}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
