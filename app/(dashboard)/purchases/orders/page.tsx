'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTransactionStore } from '@/store/useTransactionStore';
import NumberFlow from '@number-flow/react';
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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Purchase Orders (PO)</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Track and manage orders placed with vendors.</p>
        </div>
        <Link
          href="/purchases/orders/new"
          className="flex items-center gap-2 bg-brand-primary text-black font-heading font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Create PO
        </Link>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
        <div className="p-5 border-b border-white/[0.04] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by PO # or Vendor Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-sm font-medium text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-colors"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 font-medium">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-zinc-500 font-medium">
            <p className="mb-3">No purchase orders found.</p>
            <Link href="/purchases/orders/new" className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors inline-block text-sm">
              Create your first PO
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-transparent text-zinc-500 font-semibold tracking-[0.2em] font-mono uppercase text-[9px] border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">PO No</th>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4 text-right">Value Amount</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="px-6 py-4 text-zinc-400 font-medium">
                      {format(new Date(order.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {order.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-semibold text-white flex items-center justify-end">
                        <span>₹</span><NumberFlow value={order.grandTotal} format={{ maximumFractionDigits: 2 }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1 px-2.5 rounded border text-[9px] font-semibold uppercase tracking-[0.2em] font-mono
                        ${order.status === 'fully_billed' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                          order.status === 'partially_billed' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                            order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                      `}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {order.status !== 'fully_billed' && order.status !== 'cancelled' && (
                          <Link
                            href={`/purchases/new?fromPo=${order.id}`}
                            className="text-brand-primary hover:text-brand-primary/80 inline-flex items-center gap-1 border border-brand-primary/20 bg-brand-primary/10 px-2.5 py-1 rounded-md uppercase text-[9px] font-mono font-semibold tracking-[0.2em] transition-colors"
                            title="Convert to Bill"
                          >
                            <FileDiff className="h-3 w-3" /> Convert
                          </Link>
                        )}
                        <button className="text-zinc-500 hover:text-brand-primary p-2 flex items-center justify-center transition-colors rounded-lg hover:bg-white/[0.04]" title="View details">
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
