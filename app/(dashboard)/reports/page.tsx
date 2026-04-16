'use client';

import { useState } from 'react';
import NumberFlow from '@number-flow/react';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText, PieChart, TrendingUp, Users, Package, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, differenceInDays } from 'date-fns';

export default function ReportsPage() {
  const { isPremium } = useAuth();
  const { transactions, isLoading: txLoading } = useTransactionStore();
  const { items, parties, isLoading: itemsLoading } = useMasterDataStore();
  const [activeTab, setActiveTab] = useState<'pnl' | 'gst' | 'stock' | 'outstanding' | 'dead_stock' | 'sales_party' | 'sales_item'>('pnl');

  if (!isPremium) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-2xl font-heading font-semibold text-white mb-2">Premium Feature Locked</h2>
        <p className="text-zinc-500 font-medium max-w-md mb-8">
          Detailed business reporting, GST reconciliation, and stock analytics are available exclusively for Premium subscribers.
        </p>
        <Link href="/#pricing" className="bg-brand-primary text-black px-8 py-3 rounded-full font-heading font-semibold hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm">
          Upgrade to Professional
        </Link>
      </div>
    );
  }

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
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Reports Center</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">View performance, compliance, and stock reports.</p>
        </div>
        <button
          className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] text-white font-heading font-semibold px-4 py-2.5 rounded-xl hover:bg-white/[0.04] transition-all shadow-sm active:scale-[0.98]"
        >
          <Download className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <div className="flex bg-[#0A0A0A] rounded-2xl p-1.5 border border-white/[0.04] w-fit shadow-sm overflow-x-auto max-w-full gap-1">
        <button
          onClick={() => setActiveTab('pnl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'pnl' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <TrendingUp className="h-4 w-4" /> Profit & Loss
        </button>
        <button
          onClick={() => setActiveTab('outstanding')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'outstanding' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <FileText className="h-4 w-4" /> Outstanding
        </button>
        <button
          onClick={() => setActiveTab('gst')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'gst' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <FileText className="h-4 w-4" /> GST (GSTR-3B)
        </button>
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'stock' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <PieChart className="h-4 w-4" /> Stock Summary
        </button>
        <button
          onClick={() => setActiveTab('dead_stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'dead_stock' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <TrendingUp className="h-4 w-4" /> Dead Stock
        </button>
        <button
          onClick={() => setActiveTab('sales_party')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'sales_party' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
        >
          <Users className="h-4 w-4" /> Party Sales
        </button>
        <button
          onClick={() => setActiveTab('sales_item')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] tracking-widest font-bold transition-all whitespace-nowrap uppercase ${activeTab === 'sales_item' ? 'bg-[#00FFA3]/10 text-brand-primary' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
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
              <div className="bg-[#0A0A0A] p-8 rounded-2xl border border-white/[0.04] shadow-sm space-y-8">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Income Statement</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">For {format(currentDate, 'MMMM yyyy')}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-medium text-sm">Total Sales Revenue</span>
                    <span className="font-semibold text-white text-base flex items-center"><span>₹</span><NumberFlow value={sales} format={{ maximumFractionDigits: 2 }} /></span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.04]">
                    <span className="text-zinc-400 font-medium text-sm">Cost of Goods (Purchases)</span>
                    <span className="font-semibold text-white text-base flex items-center"><span>₹</span><NumberFlow value={purchases} format={{ maximumFractionDigits: 2 }} /></span>
                  </div>
                  <div className="flex justify-between items-center py-5 border-t border-white/[0.08]">
                    <span className="font-semibold text-white text-sm tracking-wider uppercase font-mono">Gross Profit</span>
                    <span className={`font-semibold text-xl flex items-center ${grossProfit >= 0 ? 'text-brand-primary' : 'text-red-500'}`}>
                      <span>₹</span><NumberFlow value={grossProfit} format={{ maximumFractionDigits: 2 }} />
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
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`} cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px', fontWeight: 'bold'}} />
                      <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm space-y-6 max-w-3xl">
              <div>
                <h2 className="text-xl font-heading font-semibold text-white">GSTR-3B Summary Estimate</h2>
                <p className="text-[10px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 mt-1">For {format(currentDate, 'MMMM yyyy')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-[9px] text-blue-400 font-mono font-semibold uppercase tracking-[0.2em]">Outward Supplies (Sales)</p>
                  <p className="text-2xl font-semibold text-blue-500 mt-2 flex items-center"><span>₹</span><NumberFlow value={sales} format={{ maximumFractionDigits: 2 }} /></p>
                  <p className="text-[11px] font-semibold text-blue-400/80 mt-3 flex gap-1">Output Tax: <span>₹</span><NumberFlow value={outputGST} format={{ maximumFractionDigits: 2 }}/></p>
                </div>
                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <p className="text-[9px] text-orange-400 font-mono font-semibold uppercase tracking-[0.2em]">Inward Supplies (Purchases)</p>
                  <p className="text-2xl font-semibold text-orange-500 mt-2 flex items-center"><span>₹</span><NumberFlow value={purchases} format={{ maximumFractionDigits: 2 }} /></p>
                  <p className="text-[11px] font-semibold text-orange-400/80 mt-3 flex gap-1">ITC Base: <span>₹</span><NumberFlow value={inputGST} format={{ maximumFractionDigits: 2 }}/></p>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border flex justify-between items-center ${gstLiability > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-brand-primary/10 border-brand-primary/20'}`}>
                <div>
                  <p className={`text-[9px] font-mono font-semibold uppercase tracking-[0.2em] ${gstLiability > 0 ? 'text-orange-400' : 'text-brand-primary'}`}>
                    {gstLiability > 0 ? 'Net GST Payable' : 'Net ITC Available'}
                  </p>
                  <p className={`text-2xl font-semibold mt-2 flex items-center ${gstLiability > 0 ? 'text-orange-500' : 'text-brand-primary'}`}>
                    <span>₹</span><NumberFlow value={Math.abs(gstLiability)} format={{ maximumFractionDigits: 2 }} />
                  </p>
                </div>
                <FileText className={`h-8 w-8 opacity-50 ${gstLiability > 0 ? 'text-orange-500' : 'text-brand-primary'}`} />
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm">
              <div className="flex justify-between items-end mb-6 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Stock Valuation Summary</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">Real-time inventory worth</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-[9px] uppercase tracking-[0.2em] font-mono font-semibold text-zinc-500">Total Valuation</p>
                  <p className="text-2xl font-semibold text-brand-primary flex items-center justify-end mt-1">
                    <span>₹</span><NumberFlow value={items.filter(i => i.type === 'product').reduce((sum, i) => sum + (i.currentStock * i.purchasePrice), 0)} format={{ maximumFractionDigits: 2 }} />
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-right">In Stock Qty</th>
                      <th className="px-6 py-4 text-right">Avg. Purchase Price</th>
                      <th className="px-6 py-4 text-right">Stock Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {items.filter(i => i.type === 'product').map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-semibold text-white text-sm">{item.name}</td>
                        <td className={`px-6 py-4 text-right font-semibold text-sm ${item.currentStock <= 0 ? 'text-red-500' : 'text-white'}`}>
                          <NumberFlow value={item.currentStock} /> {item.unit}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-300 font-semibold text-sm flex justify-end items-center"><span>₹</span><NumberFlow value={item.purchasePrice} format={{ maximumFractionDigits: 2 }} /></td>
                        <td className="px-6 py-4 text-right font-semibold text-brand-primary text-sm">
                          <div className="flex justify-end items-center"><span>₹</span><NumberFlow value={(item.currentStock * item.purchasePrice)} format={{ maximumFractionDigits: 2 }} /></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'outstanding' && (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm space-y-8">
              <div className="flex justify-between items-end mb-2 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Outstanding Summary</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">Amount to Receive vs Amount to Pay</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-[9px] text-blue-400 font-mono font-semibold tracking-[0.2em] uppercase">Total Receivables</p>
                  <p className="text-2xl font-semibold text-blue-500 mt-2 flex items-center"><span>₹</span><NumberFlow value={totalReceivables} format={{ maximumFractionDigits: 2 }} /></p>
                  <p className="text-[11px] font-semibold text-blue-400/80 mt-3">Money you will get from Customers</p>
                </div>
                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl">
                  <p className="text-[9px] text-orange-400 font-mono font-semibold tracking-[0.2em] uppercase">Total Payables</p>
                  <p className="text-2xl font-semibold text-orange-500 mt-2 flex items-center"><span>₹</span><NumberFlow value={totalPayables} format={{ maximumFractionDigits: 2 }} /></p>
                  <p className="text-[11px] font-semibold text-orange-400/80 mt-3">Money you owe to Suppliers</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pt-4">
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04]">
                  <h3 className="font-semibold text-white mb-4 border-b border-white/[0.04] pb-3 text-sm">Top Debtors (To Receive)</h3>
                  <div className="space-y-4">
                    {parties.filter(p => p.type === 'customer' && p.currentBalance < 0)
                      .sort((a, b) => Math.abs(b.currentBalance) - Math.abs(a.currentBalance))
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-zinc-300">{p.name}</span>
                          <span className="font-semibold text-blue-500 flex items-center"><span>₹</span><NumberFlow value={Math.abs(p.currentBalance)} format={{ maximumFractionDigits: 2 }} /></span>
                        </div>
                      ))}
                    {parties.filter(p => p.type === 'customer' && p.currentBalance < 0).length === 0 && (
                      <div className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-500 italic">No outstanding receivables.</div>
                    )}
                  </div>
                </div>
                <div className="bg-white/[0.02] p-5 rounded-2xl border border-white/[0.04]">
                  <h3 className="font-semibold text-white mb-4 border-b border-white/[0.04] pb-3 text-sm">Top Creditors (To Pay)</h3>
                  <div className="space-y-4">
                    {parties.filter(p => p.type === 'vendor' && p.currentBalance > 0)
                      .sort((a, b) => b.currentBalance - a.currentBalance)
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-zinc-300">{p.name}</span>
                          <span className="font-semibold text-orange-500 flex items-center"><span>₹</span><NumberFlow value={p.currentBalance} format={{ maximumFractionDigits: 2 }} /></span>
                        </div>
                      ))}
                    {parties.filter(p => p.type === 'vendor' && p.currentBalance > 0).length === 0 && (
                      <div className="text-[11px] font-mono font-semibold tracking-widest uppercase text-zinc-500 italic">No outstanding payables.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dead_stock' && (
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm">
              <div className="flex justify-between items-end mb-6 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Dead Stock Report</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">Items with &gt;0 stock but no sales in the last 30 days.</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500">Capital Blocked</p>
                  <p className="text-2xl font-semibold text-red-500 flex items-center justify-end mt-1">
                    <span>₹</span><NumberFlow value={deadStockValue} format={{ maximumFractionDigits: 2 }} />
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Product Name</th>
                      <th className="px-6 py-4 text-right">In Stock Qty</th>
                      <th className="px-6 py-4 text-right">Purchase Price</th>
                      <th className="px-6 py-4 text-right">Blocked Capital</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {deadStockItems.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center font-semibold text-[11px] font-mono tracking-widest uppercase text-zinc-500">No dead stock found. Great inventory management!</td>
                      </tr>
                    ) : (
                      deadStockItems.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-semibold text-white text-sm">{item.name}</td>
                          <td className="px-6 py-4 text-right text-orange-500 font-semibold text-sm">
                            <NumberFlow value={item.currentStock} /> {item.unit}
                          </td>
                          <td className="px-6 py-4 text-right text-zinc-400 font-semibold text-sm flex items-center justify-end"><span>₹</span><NumberFlow value={item.purchasePrice} format={{ maximumFractionDigits: 2 }} /></td>
                          <td className="px-6 py-4 text-right font-semibold text-red-500 text-sm">
                            <div className="flex items-center justify-end"><span>₹</span><NumberFlow value={(item.currentStock * item.purchasePrice)} format={{ maximumFractionDigits: 2 }} /></div>
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
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm">
              <div className="flex justify-between items-end mb-6 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Sales by Retailer</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">For {format(currentDate, 'MMMM yyyy')}</p>
                </div>
                <div className="text-right flex flex-col justify-end">
                  <p className="text-[9px] text-zinc-500 font-mono uppercase font-semibold tracking-[0.2em]">Total B2B Sales</p>
                  <p className="text-2xl font-semibold text-blue-500 flex items-center justify-end mt-1">
                    <span>₹</span><NumberFlow value={sales} format={{ maximumFractionDigits: 2 }} />
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Retailer Name</th>
                      <th className="px-6 py-4 text-center">Invoices count</th>
                      <th className="px-6 py-4 text-right">Total Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {salesByParty.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-[11px] font-mono tracking-widest font-semibold uppercase text-zinc-500">No B2B sales data for this period.</td>
                      </tr>
                    ) : (
                      salesByParty.map((party, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-semibold text-white text-sm">{party.name}</td>
                          <td className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">
                            <NumberFlow value={party.invoices} />
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-white text-sm">
                            <div className="flex items-center justify-end"><span>₹</span><NumberFlow value={party.total} format={{ maximumFractionDigits: 2 }} /></div>
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
            <div className="bg-[#0A0A0A] p-6 rounded-2xl border border-white/[0.04] shadow-sm">
              <div className="flex justify-between items-end mb-6 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-white">Sales by Item</h2>
                  <p className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1">For {format(currentDate, 'MMMM yyyy')}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-medium">
                  <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                    <tr>
                      <th className="px-6 py-4">Item Name</th>
                      <th className="px-6 py-4 text-center">Quantity Sold</th>
                      <th className="px-6 py-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {salesByItem.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-[11px] font-mono tracking-widest font-semibold uppercase text-zinc-500">No item sales data for this period.</td>
                      </tr>
                    ) : (
                      salesByItem.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4 font-semibold text-white text-sm">{item.name}</td>
                          <td className="px-6 py-4 text-center text-zinc-400 font-semibold text-sm">
                            <NumberFlow value={item.quantity} />
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-white text-sm">
                            <div className="flex items-center justify-end"><span>₹</span><NumberFlow value={item.revenue} format={{ maximumFractionDigits: 2 }} /></div>
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
