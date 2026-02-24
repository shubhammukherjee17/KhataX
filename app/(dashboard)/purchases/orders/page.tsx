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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Orders (PO)</h1>
          <p className="text-sm text-slate-500">Track and manage orders placed with vendors.</p>
        </div>
        <Link 
          href="/purchases/orders/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Create PO
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by PO # or Vendor Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No purchase orders found.</p>
            <Link href="/purchases/orders/new" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
              Create your first PO
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">PO No</th>
                  <th className="px-6 py-3">Vendor Name</th>
                  <th className="px-6 py-3 text-right">Value Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      {format(new Date(order.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {order.number}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-slate-900">₹{order.grandTotal.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1 px-2 rounded-full text-xs font-medium uppercase tracking-wider
                        ${order.status === 'fully_billed' ? 'bg-green-100 text-green-700' : 
                          order.status === 'partially_billed' ? 'bg-orange-100 text-orange-700' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'}
                      `}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {order.status !== 'fully_billed' && order.status !== 'cancelled' && (
                        <Link 
                           href={`/purchases/new?fromPo=${order.id}`} 
                           className="text-[#00ea77] hover:text-[#00c563] p-1 inline-flex items-center gap-1 border border-[#00ea77]/20 bg-[#00ea77]/5 px-2 py-0.5 rounded mr-2 uppercase text-[10px] font-bold tracking-wider" 
                           title="Convert to Bill"
                        >
                           <FileDiff className="h-3 w-3" /> Convert
                        </Link>
                      )}
                      <button className="text-blue-600 hover:text-blue-800 p-1" title="View details">
                        <Eye className="h-4 w-4" />
                      </button>
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
