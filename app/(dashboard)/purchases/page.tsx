'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Plus, Search, Eye, Download, ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';

export default function PurchasesPage() {
  const { transactions, isLoading } = useTransactionStore();
  const [searchTerm, setSearchTerm] = useState('');

  const purchaseInvoices = transactions.filter(t => t.type === 'purchase_invoice');
  
  const filteredPurchases = purchaseInvoices.filter(t => 
    t.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Purchase Bills</h1>
          <p className="text-sm text-slate-500">Manage vendor bills and record expenses.</p>
        </div>
        <Link 
          href="/purchases/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Record Purchase
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Purchases</p>
            <p className="text-xl font-bold text-slate-900">
              ₹{purchaseInvoices.reduce((sum, t) => sum + t.grandTotal, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Paid to Vendors</p>
            <p className="text-xl font-bold text-slate-900">
              ₹{purchaseInvoices.reduce((sum, t) => sum + t.amountPaid, 0).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Payables</p>
            <p className="text-xl font-bold text-slate-900">
              ₹{purchaseInvoices.reduce((sum, t) => sum + (t.grandTotal - t.amountPaid), 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by Bill # or Vendor Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading purchases...</div>
        ) : filteredPurchases.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No purchase bills found.</p>
            <Link href="/purchases/new" className="text-blue-600 font-medium hover:underline mt-2 inline-block">
              Record your first purchase
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Bill No</th>
                  <th className="px-6 py-3">Vendor Name</th>
                  <th className="px-6 py-3 text-right">Amount</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPurchases.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      {format(new Date(invoice.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {invoice.number}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {invoice.partyName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-medium text-slate-900">₹{invoice.grandTotal.toFixed(2)}</div>
                      {invoice.amountPaid > 0 && invoice.status !== 'paid' && (
                        <div className="text-xs text-slate-500">Paid: ₹{invoice.amountPaid.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex py-1 px-2 rounded-full text-xs font-medium uppercase tracking-wider
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          invoice.status === 'partially_paid' ? 'bg-orange-100 text-orange-700' : 
                          invoice.status === 'unpaid' ? 'bg-red-100 text-red-700' : 
                          'bg-slate-100 text-slate-700'}
                      `}>
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
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
