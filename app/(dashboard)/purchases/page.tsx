'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Bell, Calendar, ChevronDown, Filter,
  TrendingUp, Wallet, Landmark, CheckCircle2, XCircle,
  FileText, UploadCloud, Zap, MoreHorizontal
} from 'lucide-react';

export default function PurchasesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    {
      id: 'PUR-00245',
      vendor: 'Acme Corp',
      avatar: 'AC',
      date: 'Oct 24, 2023',
      amount: '12,000',
      gstRate: '18%',
      itc: 'Eligible',
      itcStatus: 'success'
    },
    {
      id: 'PUR-00241',
      vendor: 'Global Tech',
      avatar: 'GT',
      date: 'Oct 22, 2023',
      amount: '45,500',
      gstRate: '12%',
      itc: 'Eligible',
      itcStatus: 'success'
    },
    {
      id: 'PUR-00236',
      vendor: 'Modern Designs',
      avatar: 'MD',
      date: 'Oct 20, 2023',
      amount: '8,900',
      gstRate: '5%',
      itc: 'Ineligible',
      itcStatus: 'error'
    },
    {
      id: 'PUR-00235',
      vendor: 'Stationary Hub',
      avatar: 'SH',
      date: 'Oct 18, 2023',
      amount: '2,400',
      gstRate: '18%',
      itc: 'Eligible',
      itcStatus: 'success'
    }
  ];

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

          {/* Profile placeholder matches image orange variant */}
          <div className="h-9 w-9 rounded-full bg-orange-100/10 flex items-center justify-center border border-orange-500/30 shrink-0">
            <span className="text-orange-300 font-bold text-xs">A</span>
          </div>
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
          Showing 24 of 128 transactions
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-[#00ea77]/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#00ea77]/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-[#00ea77]" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#00ea77]/10 text-[#00ea77] text-[10px] uppercase font-bold tracking-wider">
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Total Expenses (Month)</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹4,52,000</h3>
          </div>
        </div>

        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-yellow-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-yellow-500" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold tracking-wider">
              +5.2%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Pending Payments</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹85,000</h3>
          </div>
        </div>

        <div className="bg-[#121c17] rounded-2xl border border-[#1a231f] p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Landmark className="h-5 w-5 text-blue-500" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] uppercase font-bold tracking-wider">
              -2.1%
            </span>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">GST Input Tax Credit (ITC)</p>
            <h3 className="text-3xl font-extrabold text-white tracking-tight">₹18,240</h3>
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
                  <th className="px-6 py-4">AMOUNT</th>
                  <th className="px-6 py-4">GST RATE</th>
                  <th className="px-6 py-4">ITC ELIGIBILITY</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a231f]">
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-[#16221c] transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative overflow-hidden w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                          <span className="relative z-10">{tx.avatar}</span>
                          <FileText className="absolute opacity-10 w-6 h-6 z-0" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200 group-hover:text-white transition-colors">{tx.vendor}</p>
                          <p className="text-[10px] font-semibold text-slate-600 mt-0.5 tracking-wide">{tx.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-400 text-xs">
                      {tx.date.split(',').map((part, i) => (
                        <span key={i} className="block">{part.trim()}</span>
                      ))}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-200 text-sm">₹{tx.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-3 py-1 bg-[#1a231f] text-slate-400 text-[10px] font-bold tracking-wider rounded border border-[#232f29]">
                        {tx.gstRate}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-2 font-bold text-[11px] uppercase tracking-wider ${tx.itcStatus === 'success' ? 'text-[#00ea77]' : 'text-slate-500'}`}>
                        {tx.itcStatus === 'success' ? (
                          <div className="w-4 h-4 rounded-full border border-[#00ea77] flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 fill-[#00ea77] text-[#121c17]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center">
                            <XCircle className="w-3 h-3 text-slate-500" />
                          </div>
                        )}
                        {tx.itc}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-600 hover:text-slate-300 transition-colors p-1">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
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
                <span className="font-bold text-white">4 Vendors</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-500">Next Due Date</span>
                <span className="font-bold text-orange-400">Oct 28</span>
              </div>
            </div>

            <div className="space-y-4 mb-6 pt-2 border-t border-[#1a231f]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded border border-slate-700 bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400">BT</div>
                  <span className="text-xs font-bold text-slate-300">Blue Tech</span>
                </div>
                <span className="text-xs font-bold text-white">₹12,400</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded border border-slate-700 bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400">SC</div>
                  <span className="text-xs font-bold text-slate-300">Swift Cloud</span>
                </div>
                <span className="text-xs font-bold text-white">₹8,500</span>
              </div>
            </div>

            <button className="w-full py-2.5 bg-[#1a231f] hover:bg-slate-800 text-slate-300 text-xs font-bold tracking-wide rounded-xl transition border border-[#232f29]">
              View Payables
            </button>
          </div>

          {/* Upload Receipt Card */}
          <div className="bg-[#121c17] border border-dashed border-[#00ea77]/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#00ea77]/5 transition group">
            <div className="w-10 h-10 rounded-xl bg-[#00ea77]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
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
          </div>
        </div>
      </div>
    </div>
  );
}
