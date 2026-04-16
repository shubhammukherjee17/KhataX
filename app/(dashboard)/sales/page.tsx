'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales Invoices</h1>
          <p className="text-sm font-semibold text-slate-400">Create, manage, and track your customer invoices.</p>
        </div>
        <Link
          href="/sales/new"
          className="flex items-center gap-2 bg-[#00FFA3] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00ffa3]/90 transition shadow-[0_0_15px_rgba(0,234,119,0.2)]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Create Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-[#00FFA3]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Total Sales (MTD)</p>
            <p className="text-2xl font-heading font-bold text-white">
              ₹{salesInvoices.reduce((sum, t) => sum + t.grandTotal, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-[#00FFA3]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00FFA3]/10 text-[#00FFA3] flex items-center justify-center">
            <IndianRupee className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Total Received</p>
            <p className="text-2xl font-heading font-bold text-white">
              ₹{salesInvoices.reduce((sum, t) => sum + t.amountPaid, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-[#00FFA3]/30 transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <IndianRupee className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Total Pending</p>
            <p className="text-2xl font-heading font-bold text-white">
              ₹{salesInvoices.reduce((sum, t) => sum + (t.grandTotal - t.amountPaid), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by Invoice # or Customer Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading sales...</div>
        ) : filteredSales.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <p className="font-medium">No invoices found.</p>
            <Link href="/sales/new" className="text-[#00FFA3] font-bold hover:text-[#00c563] mt-2 inline-block">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invoice No</th>
                  <th className="px-6 py-4">Party Name</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSales.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      {format(new Date(invoice.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-white font-bold text-sm">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 text-white font-bold text-sm">
                      {invoice.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-white font-bold text-sm">₹{invoice.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                      {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
                        <div className="text-[10px] font-bold text-[#00FFA3] uppercase tracking-wider mt-1">Recv: ₹{invoice.amountPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1 px-2.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${invoice.status === 'paid' ? 'bg-[#00FFA3]/10 text-[#00FFA3]' :
                          invoice.status === 'partially_paid' ? 'bg-orange-500/10 text-orange-500' :
                            invoice.status === 'unpaid' ? 'bg-red-500/10 text-red-500' :
                              'bg-white/5 text-slate-400'}
                      `}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/sales/${invoice.id}`} className="text-slate-500 hover:text-[#00FFA3] p-2 transition-colors rounded-lg hover:bg-[#00FFA3]/10 flex items-center justify-center border border-transparent" title="View details">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            import('@/lib/pdf/generateInvoice').then((mod) => {
                              mod.generateInvoicePDF(invoice, { name: 'My Business' });
                            });
                          }}
                          className="text-slate-500 hover:text-[#00FFA3] p-2 transition-colors rounded-lg hover:bg-[#00FFA3]/10 flex items-center justify-center border border-transparent" title="Download PDF"
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
