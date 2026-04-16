'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
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
    <div className="space-y-6 text-zinc-200 w-full max-w-[1400px] mx-auto pb-8 font-sans pt-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Purchases</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Manage vendor bills, receipts, and track outbounds.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
          <div className="relative flex-1 md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search explicitly or loosely..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/50 transition-all font-medium"
            />
          </div>

          <button className="p-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-zinc-400 hover:text-white transition-colors">
            <Bell className="h-4 w-4" />
          </button>

          <Link
            href="/purchases/new"
            className="flex items-center gap-2 bg-brand-primary text-black px-4 py-2.5 rounded-xl font-heading font-semibold text-sm hover:bg-brand-primary/90 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Add Purchase
          </Link>
        </div>
      </div>

      {/* Filters and Count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/[0.04] rounded-xl text-[11px] font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors uppercase shadow-sm">
            <Calendar className="h-4 w-4 text-zinc-500" />
            Filter by Date
            <ChevronDown className="h-4 w-4 ml-1 text-zinc-500" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A0A0A] border border-white/[0.04] rounded-xl text-[11px] font-semibold tracking-wide text-zinc-400 hover:text-white transition-colors uppercase shadow-sm">
            <Filter className="h-4 w-4 text-zinc-500" />
            Filter by Vendor
            <ChevronDown className="h-4 w-4 ml-1 text-zinc-500" />
          </button>
        </div>
        <div className="text-xs font-semibold tracking-wide text-zinc-500">
          Showing {filteredPurchases.length} of {purchaseInvoices.length} transactions
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 relative overflow-hidden group hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-brand-primary" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase font-mono font-semibold text-zinc-500 mb-1.5">Total Expenses (Month)</p>
            <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center">
              <span>₹</span><NumberFlow value={totalExpensesMonth} format={{ maximumFractionDigits: 2 }} />
            </h3>
          </div>
        </div>

        <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 relative overflow-hidden group hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase font-mono font-semibold text-zinc-500 mb-1.5">Pending Payments</p>
            <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center">
              <span>₹</span><NumberFlow value={pendingPayments} format={{ maximumFractionDigits: 2 }} />
            </h3>
          </div>
        </div>

        <div className="bg-[#0A0A0A] rounded-2xl border border-white/[0.04] p-6 relative overflow-hidden group hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] uppercase font-mono font-semibold text-zinc-500 mb-1.5">GST Input Tax Credit (ITC)</p>
            <h3 className="text-3xl font-semibold text-white tracking-tight flex items-center">
              <span>₹</span><NumberFlow value={totalITC} format={{ maximumFractionDigits: 2 }} />
            </h3>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 pt-2">
        {/* Main Table Area */}
        <div className="flex-1 bg-[#0A0A0A] rounded-2xl border border-white/[0.04] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-transparent text-[9px] uppercase font-mono tracking-[0.2em] font-semibold text-zinc-500 border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4">VENDOR</th>
                  <th className="px-6 py-4">DATE</th>
                  <th className="px-6 py-4 text-right">AMOUNT</th>
                  <th className="px-6 py-4 text-center">STATUS</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">Loading purchases...</td>
                  </tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500 font-medium">No purchase bills found.</td>
                  </tr>
                ) : (
                  filteredPurchases.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-shrink-0 items-center justify-center text-xs font-semibold text-zinc-500">
                            <span className="relative z-10">{tx.partyName.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">{tx.partyName}</p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-0.5 tracking-wide">{tx.number}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-400 text-xs">
                        {format(new Date(tx.date), 'dd MMM, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-white text-sm">₹{tx.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className={`inline-flex py-1 px-2.5 rounded border text-[9px] font-mono font-semibold uppercase tracking-[0.2em]
                          ${tx.status === 'paid' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                            tx.status === 'partially_paid' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                              tx.status === 'unpaid' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'}
                        `}>
                          {tx.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/purchases/${tx.id}`} className="text-zinc-500 hover:text-brand-primary transition-colors p-2 inline-flex items-center justify-center rounded-lg hover:bg-white/[0.04]">
                          <MoreHorizontal className="w-4 h-4" />
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
        <div className="w-full xl:w-80 flex flex-col gap-6">
          {/* Quick Summary Card */}
          <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-white font-heading font-semibold text-sm tracking-wide mb-6">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-brand-primary/10 border border-brand-primary/20">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
              </div>
              Quick Summary
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-400">Upcoming Payments</span>
                <span className="font-semibold text-white">{upcomingVendors.length} Vendors</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 pt-4 border-t border-white/[0.04]">
              {upcomingVendors.length === 0 ? (
                <div className="text-xs text-zinc-500 italic">No pending payments.</div>
              ) : (
                upcomingVendors.map((vendor, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded border border-white/[0.06] bg-white/[0.02] flex items-center justify-center text-[9px] font-semibold text-zinc-400 uppercase">
                        {vendor.name.substring(0,2).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-zinc-300 max-w-[100px] truncate">{vendor.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">₹{vendor.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              )}
            </div>

            <Link href="/reports" className="w-full py-2 bg-white/[0.02] hover:bg-white/[0.04] text-zinc-300 text-[11px] uppercase font-mono font-semibold tracking-[0.2em] rounded-xl transition-colors border border-white/[0.04] block text-center">
              View Payables
            </Link>
          </div>

          {/* Upload Receipt Card */}
          <Link href="/purchases/new" className="bg-[#0A0A0A] border border-dashed border-brand-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-primary/5 transition-colors group block shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform mx-auto">
              <UploadCloud className="w-5 h-5 text-brand-primary" />
            </div>
            <h4 className="font-semibold font-heading text-white text-sm mb-1">Upload Receipt</h4>
            <p className="text-[11px] font-medium text-zinc-500 mb-6 px-2">
              Drag & drop or click to scan invoice
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[9px] font-semibold tracking-[0.2em] font-mono uppercase text-brand-primary">
              <Zap className="w-3 h-3 fill-current" />
              AUTO-SCAN ENABLED
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
