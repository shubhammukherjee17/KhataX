'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Bell, Calendar, ChevronDown, Filter,
  TrendingUp, Wallet, Landmark, CheckCircle2, XCircle,
  FileText, UploadCloud, Zap, MoreHorizontal
} from 'lucide-react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { transactions, isLoading } = useTransactionStore();

  const purchaseInvoices = useMemo(() => {
    return transactions.filter(t => t.type === 'purchase_invoice');
  }, [transactions]);

  const { filteredPurchases, totalExpensesMonth, pendingPayments, totalITC, upcomingVendors } = useMemo(() => {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);

    let expensesMonth = 0;
    let pending = 0;
    let itc = 0;

    const vendorsOwed: Record<string, number> = {};

    const filtered = purchaseInvoices.filter(t => {
      const matchSearch = t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const txDate = new Date(t.date);
      if (isWithinInterval(txDate, { start, end })) {
        expensesMonth += t.grandTotal;
      }

      const balance = t.grandTotal - (t.amountPaid || 0);
      if (balance > 0) {
        pending += balance;
        vendorsOwed[t.partyName] = (vendorsOwed[t.partyName] || 0) + balance;
      }

      // Simplified ITC calculation: assuming all tax paid on purchases is eligible ITC for now
      itc += (t.taxAmountTotal || 0);

      return matchSearch;
    });

    const upcoming = Object.entries(vendorsOwed)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return { filteredPurchases: filtered, totalExpensesMonth: expensesMonth, pendingPayments: pending, totalITC: itc, upcomingVendors: upcoming };
  }, [purchaseInvoices, searchTerm]);

  return (
    <div className="space-y-6 text-slate-200 w-full max-w-[1400px] mx-auto pb-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Purchases</h1>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions, vendors or amounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-[#121c17] border border-[#1a231f] rounded-full text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00ea77]/50 focus:ring-1 focus:ring-[#00ea77]/50 transition-colors"
            />
          </div>

          <button className="p-2.5 bg-[#121c17] border border-[#1a231f] rounded-full text-slate-400 hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <Link
            href="/purchases/new"
            className="flex items-center gap-2 bg-[#00ea77] text-[#0b110e] px-4 py-2 rounded-full font-bold text-sm hover:bg-[#00ea77]/90 transition-all shadow-[0_0_15px_rgba(0,234,119,0.2)]"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add Purchase
          </Link>
        </div>
      </div>

      {/* Filters and Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#121c17] border border-[#1a231f] rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
            <Calendar className="h-4 w-4 text-slate-400" />
            Filter by Date
            <ChevronDown className="h-4 w-4 ml-1 text-slate-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#121c17] border border-[#1a231f] rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-colors">
            <Filter className="h-4 w-4 text-slate-400" />
            Filter by Vendor
            <ChevronDown className="h-4 w-4 ml-1 text-slate-500" />
          </button>
        </div>
        <div className="text-xs font-semibold tracking-wide text-slate-400">
          Showing {filteredPurchases.length} of {purchaseInvoices.length} transactions
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-[#00ea77]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#00ea77]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#00ea77]" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Expenses (Month)</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹{totalExpensesMonth.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Pending Payments</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹{pendingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>

        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">GST Input Tax Credit (ITC)</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹{totalITC.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5 pt-2">
        {/* Main Table Area */}
        <div className="flex-1 bg-[#121c17] rounded-2xl border border-[#1a231f] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-[#1a231f]">
                <tr>
                  <th className="px-6 py-4">VENDOR</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4 text-right">AMOUNT</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a231f]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">Loading purchases...</td>
                  </tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">No purchase bills found.</td>
                  </tr>
                ) : (
                  filteredPurchases.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#16221c] transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-[#23352a] flex items-center justify-center text-xs font-bold text-slate-400 border border-[#2c4033]">
                            <span className="relative z-10">{tx.partyName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{tx.partyName}</p>
                            <p className="text-[10px] font-semibold text-slate-600 mt-0.5 tracking-wide">{tx.number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-400 text-xs">
                        {format(new Date(tx.date), 'dd MMM, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-200 text-sm">₹{tx.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex py-1 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider
                          ${tx.status === 'paid' ? 'bg-[#00ea77]/10 text-[#00ea77]' :
                            tx.status === 'partially_paid' ? 'bg-orange-500/10 text-orange-500' :
                              tx.status === 'unpaid' ? 'bg-red-500/10 text-red-500' :
                                'bg-slate-500/10 text-slate-400'}
                        `}>
                          {tx.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/purchases/${tx.id}`} className="text-slate-600 hover:text-slate-300 transition-colors p-1 inline-block">
                          <MoreHorizontal className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar Area */}
        <div className="w-full xl:w-80 flex flex-col gap-5">
          {/* Quick Summary Card */}
          <div className="bg-[#121c17] border border-[#1a231f] rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-white font-bold text-sm tracking-wide mb-6">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#00ea77]/10">
                <TrendingUp className="w-4 h-4 text-[#00ea77]" />
              </div>
              Quick Summary
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Upcoming Payments</span>
                <span className="font-bold text-white">{upcomingVendors.length} Vendors</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 pt-2 border-t border-[#1a231f]">
              {upcomingVendors.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No pending payments.</div>
              ) : (
                upcomingVendors.map((vendor, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded border border-[#23352a] bg-[#1a2820] flex items-center justify-center text-[9px] font-bold text-slate-400">
                        {vendor.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-300 max-w-[100px] truncate">{vendor.name}</span>
                    </div>
                    <span className="text-xs font-bold text-white">₹{vendor.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>

            <Link href="/reports" className="w-full py-2.5 bg-[#1a231f] hover:bg-slate-800 text-slate-300 text-xs font-bold tracking-wide rounded-xl transition border border-[#232f29] block text-center">
              View Payables
            </Link>
          </div>

          {/* Upload Receipt Card */}
          <Link href="/purchases/new" className="bg-[#121c17] border border-dashed border-[#00ea77]/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#00ea77]/5 transition group block">
            <div className="w-10 h-10 rounded-xl bg-[#00ea77]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <UploadCloud className="w-5 h-5 text-[#00ea77]" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1.5">Upload Receipt</h4>
            <p className="text-[11px] font-medium text-slate-500 mb-5 px-2">
              Drag & drop or click to scan invoice
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold tracking-widest uppercase text-[#00ea77]">
              <Zap className="w-3 h-3 fill-current" />
              AUTO-SCAN ENABLED
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
