'use client';

import { useState, useEffect } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useAuth } from '@/hooks/useAuth';
import { Item } from '@/types';
import NumberFlow from '@number-flow/react';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, ArrowRightLeft, Database } from 'lucide-react';
import { GodownManager } from '@/components/inventory/GodownManager';
import { StockTransferForm } from '@/components/inventory/StockTransferForm';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

type InventoryTab = 'items' | 'godowns' | 'transfers';

export default function InventoryPage() {
  const { items, godowns, isLoading, deleteItem, adjustStock, setBusinessId } = useMasterDataStore();
  const { businessId } = useAuth();
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    setBusinessId(businessId);
  }, [businessId, setBusinessId]);
  
  const [activeTab, setActiveTab] = useState<InventoryTab>('items');
  const [searchTerm, setSearchTerm] = useState('');

  // Adjustment Modal State
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);
  const [adjType, setAdjType] = useState<'add' | 'reduce'>('add');
  const [adjQty, setAdjQty] = useState(1);
  const [adjReason, setAdjReason] = useState('Stock Check');
  const [adjNotes, setAdjNotes] = useState('');
  const [adjGodownId, setAdjGodownId] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAdjModal = (item: Item) => {
    setAdjustingItem(item);
    setAdjType('add');
    setAdjQty(1);
    setAdjReason('Stock Check');
    setAdjNotes('');
    setAdjGodownId(godowns.length > 0 ? godowns[godowns.findIndex(g => g.isDefault)]?.id || godowns[0].id : '');
    setIsAdjModalOpen(true);
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || adjQty <= 0) return;

    setIsAdjusting(true);
    try {
      await adjustStock(adjustingItem.id, adjType, adjQty, adjReason, adjNotes, adjGodownId || undefined);
      setIsAdjModalOpen(false);
      addNotification('Stock adjusted successfully', 'success');
    } catch (error) {
      console.error(error);
      addNotification("Failed to adjust stock", 'error');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteItem(id);
      addNotification(`Item ${name} deleted successfully`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Inventory</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Manage your products, services, godowns, and stock levels.</p>
        </div>
        {activeTab === 'items' && (
          <button
            onClick={() => router.push('/inventory/new')}
            className="flex items-center gap-2 bg-brand-primary text-black font-heading font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/[0.04]">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'items' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-zinc-500 hover:text-white hover:border-white/[0.04]'
            }`}
        >
          Items & Stock
        </button>
        <button
          onClick={() => setActiveTab('godowns')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'godowns' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-zinc-500 hover:text-white hover:border-white/[0.04]'
            }`}
        >
          Godowns
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'transfers' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-zinc-500 hover:text-white hover:border-white/[0.04]'
            }`}
        >
          Stock Transfers
        </button>
      </div>

      {activeTab === 'godowns' && <GodownManager />}

      {activeTab === 'transfers' && (
        <div className="flex justify-center pt-8">
          <StockTransferForm />
        </div>
      )}

      {activeTab === 'items' && (
        <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
          <div className="p-5 border-b border-white/[0.04] flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by product/service name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all font-medium placeholder:text-zinc-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-zinc-500 font-medium">Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center text-zinc-500">
              <p className="font-medium mb-3">No inventory items found.</p>
              <button onClick={() => router.push('/inventory/new')} className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors inline-block text-sm">
                Add your first product or service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-medium">
                <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Sale Price</th>
                    <th className="px-6 py-4 text-right">Purchase Price</th>
                    <th className="px-6 py-4 text-right">Current Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4 text-white font-semibold text-sm">
                        {item.name}
                        <span className="block text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase mt-1">GST: <NumberFlow value={item.taxRate} />%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[9px] uppercase tracking-[0.2em] font-mono font-semibold ${item.type === 'product' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-purple-500/10 border-purple-500/20 text-purple-500'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-300 font-semibold text-sm">
                        ₹<NumberFlow value={item.salePrice} format={{ maximumFractionDigits: 2 }} />
                      </td>
                      <td className="px-6 py-4 text-right text-zinc-300 font-semibold text-sm">
                        ₹<NumberFlow value={item.purchasePrice} format={{ maximumFractionDigits: 2 }} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.type === 'service' ? (
                          <span className="text-zinc-600">-</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2" title={item.currentStock <= item.lowStockAlertLimit ? "Low Stock" : ""}>
                              {item.currentStock <= item.lowStockAlertLimit && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                              <span className={`font-semibold text-sm ${item.currentStock <= 0 ? 'text-red-500' : 'text-white'}`}>
                                <NumberFlow value={item.currentStock} /> {item.unit}
                              </span>
                            </div>
                            {item.stockByGodown && item.stockByGodown.length > 0 && item.currentStock > 0 && (
                              <div className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1 space-y-0.5 text-right">
                                {item.stockByGodown.map(s => {
                                  const godownName = godowns.find(g => g.id === s.godownId)?.name || 'Unknown';
                                  return s.quantity > 0 ? <div key={s.godownId}>{godownName}: <NumberFlow value={s.quantity} /></div> : null;
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {item.type === 'product' && (
                            <button onClick={() => openAdjModal(item)} className="text-zinc-500 hover:text-brand-primary p-2 transition-colors rounded-lg hover:bg-white/[0.04]" title="Adjust Stock">
                              <ArrowRightLeft className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => router.push(`/inventory/${item.id}`)} className="text-zinc-500 hover:text-brand-primary p-2 transition-colors rounded-lg hover:bg-white/[0.04]">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(item.id, item.name)} className="text-zinc-500 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-white/[0.04]">
                            <Trash2 className="h-4 w-4" />
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
      )}



      {/* Stock Adjustment Modal */}
      {isAdjModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-white/[0.04] flex justify-between items-center bg-[#0A0A0A]">
              <h2 className="text-lg font-heading font-semibold text-white">Adjust Stock</h2>
              <button disabled={isAdjusting} onClick={() => setIsAdjModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.02]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex gap-3 p-4 bg-white/[0.02] rounded-xl border border-white/[0.04] items-center">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-1.5">{adjustingItem.name}</p>
                  <p className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-1">Current Stock: <span className="text-brand-primary"><NumberFlow value={adjustingItem.currentStock} /> {adjustingItem.unit}</span></p>
                </div>
              </div>

              <form id="adj-form" onSubmit={handleAdjustStock} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Type</label>
                  <div className="flex gap-2 p-1 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg text-[11px] font-mono font-semibold transition-colors uppercase tracking-widest ${adjType === 'add' ? 'bg-brand-primary/10 text-brand-primary shadow-sm border border-brand-primary/20' : 'text-zinc-500 hover:text-white border border-transparent'}`}>
                      <input type="radio" checked={adjType === 'add'} onChange={() => setAdjType('add')} className="sr-only" />
                      <span>Add (+)</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg text-[11px] font-mono font-semibold transition-colors uppercase tracking-widest ${adjType === 'reduce' ? 'bg-red-500/10 text-red-500 shadow-sm border border-red-500/20' : 'text-zinc-500 hover:text-white border border-transparent'}`}>
                      <input type="radio" checked={adjType === 'reduce'} onChange={() => setAdjType('reduce')} className="sr-only" />
                      <span>Reduce (-)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Quantity to Adjust</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={adjQty}
                    onChange={e => setAdjQty(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all text-white font-medium"
                  />
                  {adjType === 'reduce' && adjQty > adjustingItem.currentStock && (
                    <p className="text-[9px] font-mono font-semibold tracking-[0.2em] uppercase text-orange-500 mt-2">Warning: Drops stock below zero.</p>
                  )}
                </div>

                {godowns.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Godown</label>
                    <select
                      value={adjGodownId}
                      onChange={e => setAdjGodownId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-white font-medium"
                    >
                      <option value="">-- Global Pool --</option>
                      {godowns.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Reason</label>
                  <select
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-white font-medium"
                  >
                    <option value="Stock Check">Stock Check (Audit)</option>
                    <option value="Damage">Damage/Spoilage</option>
                    <option value="Lost">Lost or Stolen</option>
                    <option value="Internal Use">Internal Use</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase">Notes (Optional)</label>
                  <input
                    type="text"
                    value={adjNotes}
                    onChange={e => setAdjNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-white font-medium placeholder:text-zinc-600"
                    placeholder="E.g. Found extra box..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-5 border-t border-white/[0.04] bg-[#0A0A0A] flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => setIsAdjModalOpen(false)}
                className="px-6 py-2.5 text-sm font-semibold text-zinc-300 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adj-form"
                disabled={isAdjusting || adjQty <= 0}
                className="px-6 py-2.5 text-sm font-semibold text-black bg-brand-primary rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isAdjusting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
