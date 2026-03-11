'use client';

import { useState } from 'react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, PieChart, TrendingUp, Users, Package } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';

export default function ReportsPage() {
  const { transactions, isLoading: txLoading } = useTransactionStore();
  const { items, parties, isLoading: itemsLoading } = useMasterDataStore();
  const [activeTab, setActiveTab] = useState<'pnl' | 'gst' | 'stock' | 'outstanding' | 'dead_stock' | 'sales_party' | 'sales_item'>('pnl');

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

  // Outstanding Calc
  const totalReceivables = parties.filter(p => p.type === 'customer' && p.currentBalance < 0).reduce((sum, p) => sum + Math.abs(p.currentBalance), 0);
  const totalPayables = parties.filter(p => p.type === 'vendor' && p.currentBalance > 0).reduce((sum, p) => sum + Math.abs(p.currentBalance), 0);

  // Dead Stock Calc (Items not sold in last 30 days but have stock > 0)
  const deadStockItems = items.filter(item => {
    if (item.type !== 'product' || item.currentStock <= 0) return false;

    // Find last sale of this item
    const lastSaleTx = transactions.find(t =>
      t.type === 'sale_invoice' &&
      t.items.some(i => i.itemId === item.id)
    );

    if (!lastSaleTx) return true; // Never sold, but we have stock => dead stock

    const lastSaleDate = new Date(lastSaleTx.date);
    const daysSinceLastSale = differenceInDays(currentDate, lastSaleDate);
    return daysSinceLastSale > 30;
  });

  const deadStockValue = deadStockItems.reduce((sum, i) => sum + (i.currentStock * i.purchasePrice), 0);

  // Sales by Retailer Calc
  const salesByPartyRaw: Record<string, { name: string, total: number, invoices: number }> = {};

  currentMonthTx.filter(t => t.type === 'sale_invoice').forEach(tx => {
    if (tx.partyId) {
      if (!salesByPartyRaw[tx.partyId]) {
        const pName = parties.find(p => p.id === tx.partyId)?.name || 'Unknown Party';
        salesByPartyRaw[tx.partyId] = { name: pName, total: 0, invoices: 0 };
      }
      salesByPartyRaw[tx.partyId].total += tx.grandTotal;
      salesByPartyRaw[tx.partyId].invoices += 1;
    }
  });

  const salesByParty = Object.values(salesByPartyRaw).sort((a, b) => b.total - a.total);

  // Sales by Item Calc
  const salesByItemRaw: Record<string, { name: string, quantity: number, revenue: number }> = {};

  currentMonthTx.filter(t => t.type === 'sale_invoice').forEach(tx => {
    tx.items.forEach(lineItem => {
      if (!salesByItemRaw[lineItem.itemId]) {
        const iName = items.find(i => i.id === lineItem.itemId)?.name || 'Unknown Item';
        salesByItemRaw[lineItem.itemId] = { name: iName, quantity: 0, revenue: 0 };
      }
      salesByItemRaw[lineItem.itemId].quantity += lineItem.quantity;
      salesByItemRaw[lineItem.itemId].revenue += lineItem.totalAmount;
    });
  });

  const salesByItem = Object.values(salesByItemRaw).sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports Center</h1>
          <p className="text-sm font-semibold text-slate-400">View performance, compliance, and stock reports.</p>
        </div>
        <button
          className="flex items-center gap-2 bg-[#111] border border-white/10 text-white font-bold px-4 py-2 rounded-xl hover:bg-white/5 hover:border-[#00ea77]/50 transition shadow-sm"
        >
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="flex bg-[#111] rounded-2xl p-1.5 border border-white/10 w-fit shadow-sm overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'pnl' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <TrendingUp className="h-4 w-4" /> Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'outstanding' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <FileText className="h-4 w-4" /> Outstanding
        </button>
        <button
          onClick={() => setActiveTab('gst')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'gst' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <FileText className="h-4 w-4" /> GST (GSTR-3B)
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'stock' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <PieChart className="h-4 w-4" /> Stock Summary
        </button>
        <button
          onClick={() => setActiveTab('dead_stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'dead_stock' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <TrendingUp className="h-4 w-4" /> Dead Stock
        </button>
        <button
          onClick={() => setActiveTab('sales_party')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'sales_party' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Users className="h-4 w-4" /> Party Sales
        </button>
        <button
          onClick={() => setActiveTab('sales_item')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition whitespace-nowrap ${activeTab === 'sales_item' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Package className="h-4 w-4" /> Item Sales
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-500 bg-[#111] rounded-2xl border border-white/10 font-medium tracking-wide">
          Loading report data...
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === 'pnl' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Income Statement</h2>
                  <p className="text-sm font-semibold text-slate-400">For the month of {format(currentDate, 'MMMM yyyy')}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400 font-bold text-sm">Total Sales Revenue</span>
                    <span className="font-extrabold text-white text-base">₹{sales.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-slate-400 font-bold text-sm">Cost of Goods (Purchases)</span>
                    <span className="font-extrabold text-white text-base">₹{purchases.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t-2 border-white/10">
                    <span className="font-extrabold text-white text-lg tracking-wider uppercase">Gross Profit</span>
                    <span className={`font-extrabold text-lg ${grossProfit >= 0 ? 'text-[#00ea77]' : 'text-red-500'}`}>
                      ₹{grossProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm">
                <h2 className="text-lg font-bold text-white mb-6">P&L Overview</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                      <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontWeight: 'bold'}} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-bold text-white">GSTR-3B Summary Estimate</h2>
                <p className="text-sm font-semibold text-slate-400">For the month of {format(currentDate, 'MMMM yyyy')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Outward Supplies (Sales)</p>
                  <p className="text-2xl font-extrabold text-blue-500 mt-1">₹{sales.toFixed(2)}</p>
                  <p className="text-xs font-bold text-blue-400/80 mt-2">Output Tax: ₹{outputGST.toFixed(2)}</p>
                </div>
                <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Inward Supplies (Purchases)</p>
                  <p className="text-2xl font-extrabold text-orange-500 mt-1">₹{purchases.toFixed(2)}</p>
                  <p className="text-xs font-bold text-orange-400/80 mt-2">Input Tax Credit (ITC): ₹{inputGST.toFixed(2)}</p>
                </div>
              </div>

              <div className={`p-5 rounded-2xl border flex justify-between items-center ${gstLiability > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-[#00ea77]/10 border-[#00ea77]/20'}`}>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${gstLiability > 0 ? 'text-orange-400' : 'text-[#00ea77]'}`}>
                    {gstLiability > 0 ? 'Net GST Payable' : 'Net ITC Available'}
                  </p>
                  <p className={`text-2xl font-extrabold mt-1 ${gstLiability > 0 ? 'text-orange-500' : 'text-[#00ea77]'}`}>
                    ₹{Math.abs(gstLiability).toFixed(2)}
                  </p>
                </div>
                <FileText className={`h-8 w-8 opacity-50 ${gstLiability > 0 ? 'text-orange-500' : 'text-[#00ea77]'}`} />
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Stock Valuation Summary</h2>
                  <p className="text-sm font-semibold text-slate-400">Real-time inventory worth</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Total Valuation</p>
                  <p className="text-2xl font-extrabold text-[#00ea77]">
                    ₹{items.filter(i => i.type === 'product').reduce((sum, i) => sum + (i.currentStock * i.purchasePrice), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-right">In Stock Qty</th>
                      <th className="px-6 py-4 text-right">Avg. Purchase Price</th>
                      <th className="px-6 py-4 text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.filter(i => i.type === 'product').map((item) => (
                      <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4 font-bold text-white text-sm">{item.name}</td>
                        <td className={`px-6 py-4 text-right font-bold text-sm ${item.currentStock <= 0 ? 'text-red-500' : 'text-white'}`}>
                          {item.currentStock} {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-300 font-bold text-sm">₹{item.purchasePrice.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-extrabold text-[#00ea77] text-sm">
                          ₹{(item.currentStock * item.purchasePrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'outstanding' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm space-y-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Outstanding Summary</h2>
                  <p className="text-sm font-semibold text-slate-400">Amount to Receive vs Amount to Pay</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-[10px] text-blue-400 font-bold tracking-wider uppercase">Total Receivables</p>
                  <p className="text-2xl font-extrabold text-blue-500 mt-1">₹{totalReceivables.toFixed(2)}</p>
                  <p className="text-xs font-bold text-blue-400/80 mt-2">Money you will get from Customers</p>
                </div>
                <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <p className="text-[10px] text-orange-400 font-bold tracking-wider uppercase">Total Payables</p>
                  <p className="text-2xl font-extrabold text-orange-500 mt-1">₹{totalPayables.toFixed(2)}</p>
                  <p className="text-xs font-bold text-orange-400/80 mt-2">Money you owe to Suppliers</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div>
                  <h3 className="font-bold text-white mb-3 border-b border-white/5 pb-2">Top Debtors (To Receive)</h3>
                  <div className="space-y-3">
                    {parties.filter(p => p.type === 'customer' && p.currentBalance < 0)
                      .sort((a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance))
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-300">{p.name}</span>
                          <span className="font-extrabold text-blue-500">₹{Math.abs(p.currentBalance).toFixed(2)}</span>
                        </div>
                      ))}
                    {parties.filter(p => p.type === 'customer' && p.currentBalance < 0).length === 0 && (
                      <div className="text-sm font-semibold text-slate-500 italic">No outstanding receivables.</div>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3 border-b border-white/5 pb-2">Top Creditors (To Pay)</h3>
                  <div className="space-y-3">
                    {parties.filter(p => p.type === 'vendor' && p.currentBalance > 0)
                      .sort((a, b) => b.currentBalance - a.currentBalance)
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span className="font-bold text-slate-300">{p.name}</span>
                          <span className="font-extrabold text-orange-500">₹{p.currentBalance.toFixed(2)}</span>
                        </div>
                      ))}
                    {parties.filter(p => p.type === 'vendor' && p.currentBalance > 0).length === 0 && (
                      <div className="text-sm font-semibold text-slate-500 italic">No outstanding payables.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dead_stock' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Dead Stock Report</h2>
                  <p className="text-sm font-semibold text-slate-400">Items with &gt;0 stock but no sales in the last 30 days.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Capital Blocked</p>
                  <p className="text-2xl font-extrabold text-red-500">
                    ₹{deadStockValue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-right">In Stock Qty</th>
                      <th className="px-6 py-4 text-right">Purchase Price</th>
                      <th className="px-6 py-4 text-right">Blocked Capital</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {deadStockItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center font-bold text-slate-500">No dead stock found. Great inventory management!</td>
                      </tr>
                    ) : (
                      deadStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold text-white text-sm">{item.name}</td>
                          <td className="px-6 py-4 text-right text-orange-500 font-extrabold text-sm">
                            {item.currentStock} {item.unit}
                          </td>
                          <td className="px-6 py-4 text-right text-slate-300 font-bold text-sm">₹{item.purchasePrice.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-extrabold text-red-500 text-sm">
                            ₹{(item.currentStock * item.purchasePrice).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sales_party' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Sales by Retailer</h2>
                  <p className="text-sm font-semibold text-slate-400">For the month of {format(currentDate, 'MMMM yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Total B2B Sales</p>
                  <p className="text-2xl font-extrabold text-blue-500">
                    ₹{sales.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Retailer Name</th>
                      <th className="px-6 py-4 text-center">Invoices count</th>
                      <th className="px-6 py-4 text-right">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {salesByParty.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center font-bold text-slate-500">No B2B sales data for this period.</td>
                      </tr>
                    ) : (
                      salesByParty.map((party, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold text-white text-sm">{party.name}</td>
                          <td className="px-6 py-4 text-center text-slate-400 font-bold text-sm">
                            {party.invoices}
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-white text-sm">
                            ₹{party.total.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sales_item' && (
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Sales by Item</h2>
                  <p className="text-sm font-semibold text-slate-400">For the month of {format(currentDate, 'MMMM yyyy')}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4 text-center">Quantity Sold</th>
                      <th className="px-6 py-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {salesByItem.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center font-bold text-slate-500">No item sales data for this period.</td>
                      </tr>
                    ) : (
                      salesByItem.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold text-white text-sm">{item.name}</td>
                          <td className="px-6 py-4 text-center text-slate-400 font-bold text-sm">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 text-right font-extrabold text-white text-sm">
                            ₹{item.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
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
