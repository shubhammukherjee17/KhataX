'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, FileText, PieChart, TrendingUp } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function ReportsPage() {
  const { transactions, isLoading: txLoading } = useTransactionStore();
  const { items, isLoading: itemsLoading } = useMasterDataStore();
  const [activeTab, setActiveTab] = useState<'pnl' | 'gst' | 'stock'>('pnl');

  const isLoading = txLoading || itemsLoading;

  // Filter Data (Assuming current month for demo)
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const currentMonthTx = transactions.filter(t => {
    try {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    } catch {
      return false;
    }
  });

  // Profit & Loss Calc
  const sales = currentMonthTx.filter(t => t.type === 'sale_invoice').reduce((sum, t) => sum + t.subTotal, 0);
  const purchases = currentMonthTx.filter(t => t.type === 'purchase_invoice').reduce((sum, t) => sum + t.subTotal, 0);
  const grossProfit = sales - purchases;

  // Chart Data preparation
  const chartData = [
    { name: 'Sales', amount: sales, fill: '#3b82f6' },
    { name: 'Purchases', amount: purchases, fill: '#ef4444' },
    { name: 'Gross Profit', amount: grossProfit, fill: grossProfit >= 0 ? '#22c55e' : '#f97316' }
  ];

  // GST Calc (GSTR-3B rough estimate)
  const outputGST = currentMonthTx.filter(t => t.type === 'sale_invoice').reduce((sum, t) => sum + t.taxAmountTotal, 0);
  const inputGST = currentMonthTx.filter(t => t.type === 'purchase_invoice').reduce((sum, t) => sum + t.taxAmountTotal, 0);
  const gstLiability = outputGST - inputGST;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports Center</h1>
          <p className="text-sm text-slate-500">View performance, compliance, and stock reports.</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-50 transition"
        >
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="flex bg-white rounded-lg p-1 border border-slate-200 w-fit">
        <button 
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'pnl' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <TrendingUp className="h-4 w-4" /> Profit & Loss
        </button>
        <button 
          onClick={() => setActiveTab('gst')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'gst' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileText className="h-4 w-4" /> GST (GSTR-3B)
        </button>
        <button 
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'stock' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <PieChart className="h-4 w-4" /> Stock Summary
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading report data...
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === 'pnl' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Income Statement</h2>
                  <p className="text-sm text-slate-500">For the month of {format(currentDate, 'MMMM yyyy')}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Total Sales Revenue</span>
                    <span className="font-semibold text-slate-900">₹{sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Cost of Goods (Purchases)</span>
                    <span className="font-semibold text-slate-900">₹{purchases.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t-2 border-slate-800">
                    <span className="font-bold text-slate-900 text-lg">Gross Profit</span>
                    <span className={`font-bold text-lg ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{grossProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">P&L Overview</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">GSTR-3B Summary Estimate</h2>
                <p className="text-sm text-slate-500">For the month of {format(currentDate, 'MMMM yyyy')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-500 font-medium">Outward Supplies (Sales)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">₹{sales.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-2">Output Tax: ₹{outputGST.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-500 font-medium">Inward Supplies (Purchases)</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">₹{purchases.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-2">Input Tax Credit (ITC): ₹{inputGST.toFixed(2)}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg border flex justify-between items-center ${gstLiability > 0 ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'}`}>
                <div>
                  <p className={`text-sm font-medium ${gstLiability > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                    {gstLiability > 0 ? 'Net GST Payable' : 'Net ITC Available'}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${gstLiability > 0 ? 'text-orange-900' : 'text-green-900'}`}>
                    ₹{Math.abs(gstLiability).toFixed(2)}
                  </p>
                </div>
                <FileText className={`h-8 w-8 opacity-50 ${gstLiability > 0 ? 'text-orange-600' : 'text-green-600'}`} />
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Stock Valuation Summary</h2>
                  <p className="text-sm text-slate-500">Real-time inventory worth</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total Valuation</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{items.filter(i => i.type === 'product').reduce((sum, i) => sum + (i.currentStock * i.purchasePrice), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Product Name</th>
                      <th className="px-4 py-3 text-right">In Stock Qty</th>
                      <th className="px-4 py-3 text-right">Avg. Purchase Price</th>
                      <th className="px-4 py-3 text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.filter(i => i.type === 'product').map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className={`px-4 py-3 text-right ${item.currentStock <= 0 ? 'text-red-600' : ''}`}>
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-4 py-3 text-right">₹{item.purchasePrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                          ₹{(item.currentStock * item.purchasePrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
