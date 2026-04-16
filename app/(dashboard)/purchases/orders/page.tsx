'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, Search, Eye, FileDiff } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchaseOrdersPage() {
  const { transactions, isLoading } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const purchaseOrders = transactions.filter(t => t.type === 'purchase_order');

  const filteredOrders = purchaseOrders.filter(t =>
    t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Purchase Orders (PO)</h1>
          <p className="text-sm font-medium text-slate-400">Track and manage orders placed with vendors.</p>
        </div>
        <Link
          href="/purchases/orders/new"
          className="flex items-center gap-2 bg-[#00FFA3] text-black font-bold px-5 py-2.5 rounded-xl hover:bg-[#00ffa3]/90 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Create PO
        </Link>
      </div>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-4 bg-[#0a0a0a]">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by PO # or Vendor Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#111] border border-white/5 rounded-xl text-sm font-medium text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 font-medium">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium">
            <p className="mb-2">No purchase orders found.</p>
            <Link href="/purchases/orders/new" className="text-[#00FFA3] font-bold hover:text-[#00c563] inline-block border-b border-[#00FFA3]/30 pb-0.5">
              Create your first PO
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0a0a0a] text-slate-500 font-bold tracking-wider uppercase text-xs border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">PO No</th>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4 text-right">Value Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {format(new Date(order.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-300">
                      {order.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-white">₹{order.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1.5 px-3 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] font-mono border
                        ${order.status === 'fully_billed' ? 'bg-[#00FFA3]/10 text-[#00FFA3] border-[#00FFA3]/20' :
                          order.status === 'partially_billed' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                      `}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {order.status !== 'fully_billed' && order.status !== 'cancelled' && (
                          <Link
                            href={`/purchases/new?fromPo=${order.id}`}
                            className="text-[#00FFA3] hover:text-[#00c563] inline-flex items-center gap-1 border border-[#00FFA3]/20 bg-[#00FFA3]/5 px-2.5 py-1 rounded-md uppercase text-[10px] font-bold tracking-widest transition-colors hover:bg-[#00FFA3]/10"
                            title="Convert to Bill"
                          >
                            <FileDiff className="h-3 w-3" /> Convert
                          </Link>
                        )}
                        <button className="text-slate-400 hover:text-white p-2 flex items-center justify-center transition-colors rounded-lg hover:bg-white/10" title="View details">
                          <Eye className="h-4 w-4" />
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
