'use client';

import { useState } from 'react';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, Search, Eye, Download, IndianRupee } from 'lucide-react';
import { format } from 'date-fns';

export default function SalesPage() {
  const { transactions, isLoading } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const salesInvoices = transactions.filter(t => t.type === 'sale_invoice');

  const filteredSales = salesInvoices.filter(t =>
    t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Sales Invoices</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Create, manage, and track your customer invoices.</p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center gap-2 bg-brand-primary text-black font-heading font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Create Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden flex items-center gap-5 hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex flex-shrink-0 items-center justify-center">
            <IndianRupee className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Total Sales (MTD)</p>
            <p className="text-2xl font-semibold text-white mt-1 flex items-center">
              <span>₹</span><NumberFlow value={salesInvoices.reduce((sum, t) => sum + t.grandTotal, 0)} format={{ maximumFractionDigits: 2 }} />
            </p>
          </div>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden flex items-center gap-5 hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex flex-shrink-0 items-center justify-center">
            <IndianRupee className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Total Received</p>
            <p className="text-2xl font-semibold text-white mt-1 flex items-center">
              <span>₹</span><NumberFlow value={salesInvoices.reduce((sum, t) => sum + t.amountPaid, 0)} format={{ maximumFractionDigits: 2 }} />
            </p>
          </div>
        </div>
        
        <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-6 relative overflow-hidden flex items-center gap-5 hover:bg-white/[0.02] transition-colors shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex flex-shrink-0 items-center justify-center">
            <IndianRupee className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <p className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Total Pending</p>
            <p className="text-2xl font-semibold text-white mt-1 flex items-center">
              <span>₹</span><NumberFlow value={salesInvoices.reduce((sum, t) => sum + (t.grandTotal - t.amountPaid), 0)} format={{ maximumFractionDigits: 2 }} />
            </p>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
        {/* Search Header */}
        <div className="p-5 border-b border-white/[0.04] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by Invoice # or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all font-medium placeholder:text-zinc-500"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 font-medium">Loading sales...</div>
        ) : filteredSales.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <p className="font-medium mb-3">No invoices found.</p>
            <Link href="/sales/new" className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors inline-block text-sm">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Party Name</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredSales.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {format(new Date(invoice.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold text-sm">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-white font-semibold text-sm">
                      {invoice.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-semibold text-sm">₹{invoice.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                      {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
                        <div className="text-[9px] font-mono font-semibold text-brand-primary uppercase tracking-[0.2em] mt-1">Recv: ₹{invoice.amountPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1 px-2.5 rounded border text-[9px] font-mono font-semibold uppercase tracking-[0.2em]
                        ${invoice.status === 'paid' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' :
                          invoice.status === 'partially_paid' ? 'bg-orange-500/10 border-orange-500/20 text-orange-500' :
                            invoice.status === 'unpaid' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                              'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'}
                      `}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/sales/${invoice.id}`} className="text-zinc-500 hover:text-brand-primary p-2 transition-colors rounded-lg hover:bg-white/[0.04] flex items-center justify-center" title="View details">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            import('@/lib/pdf/generateInvoice').then((mod) => {
                              mod.generateInvoicePDF(invoice, { name: 'My Business' });
                            });
                          }}
                          className="text-zinc-500 hover:text-brand-primary p-2 transition-colors rounded-lg hover:bg-white/[0.04] flex items-center justify-center" title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
