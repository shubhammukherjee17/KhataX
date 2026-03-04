'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { Item } from '@/types';
import { Plus, Search, Edit, Trash2, X, AlertTriangle, ArrowRightLeft, Database } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { GodownManager } from '@/components/inventory/GodownManager';
import { StockTransferForm } from '@/components/inventory/StockTransferForm';

type InventoryTab = 'items' | 'godowns' | 'transfers';

export default function InventoryPage() {
  const { items, godowns, isLoading, addItem, updateItem, deleteItem, adjustStock } = useMasterDataStore();
  const [activeTab, setActiveTab] = useState<InventoryTab>('items');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
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

  const { register, handleSubmit, reset, watch } = useForm<Omit<Item, 'id' | 'currentStock'>>();

  const itemType = watch('type', 'product');

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    reset({
      type: 'product',
      name: '',
      description: '',
      unit: 'PCS',
      purchasePrice: 0,
      salePrice: 0,
      taxRate: 18,
      openingStock: 0,
      lowStockAlertLimit: 5
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    reset(item);
    setIsModalOpen(true);
  };

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
    } catch (error) {
      console.error(error);
      alert("Failed to adjust stock");
    } finally {
      setIsAdjusting(false);
    }
  };

  const onSubmit = async (data: Omit<Item, 'id' | 'currentStock'>) => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await addItem(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteItem(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Inventory</h1>
          <p className="text-sm font-semibold text-slate-400">Manage your products, services, godowns, and stock levels.</p>
        </div>
        {activeTab === 'items' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#00ea77] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)]"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add Item
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'items' ? 'border-[#00ea77] text-[#00ea77]' : 'border-transparent text-slate-500 hover:text-white hover:border-white/20'
            }`}
        >
          Items & Stock
        </button>
        <button
          onClick={() => setActiveTab('godowns')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'godowns' ? 'border-[#00ea77] text-[#00ea77]' : 'border-transparent text-slate-500 hover:text-white hover:border-white/20'
            }`}
        >
          Godowns
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'transfers' ? 'border-[#00ea77] text-[#00ea77]' : 'border-transparent text-slate-500 hover:text-white hover:border-white/20'
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
        <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by product/service name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 font-medium"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-500 font-medium">Loading inventory...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
              <p className="font-medium">No inventory items found.</p>
              <button onClick={openAddModal} className="text-[#00ea77] font-bold hover:text-[#00c563] mt-2 inline-block">
                Add your first product or service
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-medium">
                <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Sale Price</th>
                    <th className="px-6 py-4 text-right">Purchase Price</th>
                    <th className="px-6 py-4 text-right">Current Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 text-white font-bold text-sm">
                        {item.name}
                        <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-1">GST: {item.taxRate}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold ${item.type === 'product' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'bg-purple-500/10 text-purple-500'}`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300">
                        ₹{item.salePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-300">
                        ₹{item.purchasePrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.type === 'service' ? (
                          <span className="text-slate-600">-</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2" title={item.currentStock <= item.lowStockAlertLimit ? "Low Stock" : ""}>
                              {item.currentStock <= item.lowStockAlertLimit && (
                                <AlertTriangle className="h-4 w-4 text-orange-500" />
                              )}
                              <span className={`font-bold ${item.currentStock <= 0 ? 'text-red-500' : 'text-white'}`}>
                                {item.currentStock} {item.unit}
                              </span>
                            </div>
                            {item.stockByGodown && item.stockByGodown.length > 0 && item.currentStock > 0 && (
                              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1 space-y-0.5 text-right">
                                {item.stockByGodown.map(s => {
                                  const godownName = godowns.find(g => g.id === s.godownId)?.name || 'Unknown';
                                  return s.quantity > 0 ? <div key={s.godownId}>{godownName}: {s.quantity}</div> : null;
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.type === 'product' && (
                          <button onClick={() => openAdjModal(item)} className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10 mr-1" title="Adjust Stock">
                            <ArrowRightLeft className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => openEditModal(item)} className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id, item.name)} className="text-slate-500 hover:text-red-500 p-2 ml-1 transition-colors rounded-lg hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-lg font-bold text-white">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Item Type *</label>
                    <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-xl">
                      <label className={`flex-1 text-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${itemType === 'product' ? 'bg-[#00ea77]/10 text-[#00ea77] shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                        <input type="radio" value="product" {...register("type")} className="sr-only" />
                        Product
                      </label>
                      <label className={`flex-1 text-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${itemType === 'service' ? 'bg-[#00ea77]/10 text-[#00ea77] shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                        <input type="radio" value="service" {...register("type")} className="sr-only" />
                        Service
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Item Name *</label>
                    <input
                      {...register("name", { required: true })}
                      placeholder="e.g. Dell Monitor 24 inch"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Description</label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Unit</label>
                    <select
                      {...register("unit")}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                    >
                      <option value="PCS">Pieces (PCS)</option>
                      <option value="KG">Kilograms (KG)</option>
                      <option value="LTR">Liters (LTR)</option>
                      <option value="BOX">Boxes (BOX)</option>
                      <option value="MTR">Meters (MTR)</option>
                      <option value="HRS">Hours (HRS)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Tax Rate (GST %)</label>
                    <select
                      {...register("taxRate", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                    >
                      <option value={0}>Exempt (0%)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Sale Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("salePrice", { required: true, valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Purchase Price *</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("purchasePrice", { required: true, valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {itemType === 'product' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Opening Stock</label>
                        <input
                          type="number"
                          {...register("openingStock", { valueAsNumber: true })}
                          placeholder="0"
                          disabled={!!editingItem} // typically you don't edit opening stock directly later
                          className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Low Stock Alert Limit</label>
                        <input
                          type="number"
                          {...register("lowStockAlertLimit", { valueAsNumber: true })}
                          placeholder="5"
                          className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                        />
                      </div>
                    </>
                  )}
                </div>

              </form>
            </div>

            <div className="px-6 py-5 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="item-form"
                className="px-6 py-2.5 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-lg font-bold text-white">Adjust Stock</h2>
              <button disabled={isAdjusting} onClick={() => setIsAdjModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 flex gap-3 p-4 bg-[#0a0a0a] rounded-xl border border-white/5 items-center">
                <div className="flex-1">
                  <p className="text-sm font-bold text-white mb-1">{adjustingItem.name}</p>
                  <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Current Stock: <span className="text-[#00ea77]">{adjustingItem.currentStock} {adjustingItem.unit}</span></p>
                </div>
              </div>

              <form id="adj-form" onSubmit={handleAdjustStock} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Type</label>
                  <div className="flex gap-4 p-1 bg-[#0a0a0a] border border-white/5 rounded-xl">
                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg text-sm font-bold transition-colors ${adjType === 'add' ? 'bg-[#00ea77]/10 text-[#00ea77] shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                      <input type="radio" checked={adjType === 'add'} onChange={() => setAdjType('add')} className="sr-only" />
                      <span>Add (+)</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 cursor-pointer rounded-lg text-sm font-bold transition-colors ${adjType === 'reduce' ? 'bg-red-500/10 text-red-500 shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                      <input type="radio" checked={adjType === 'reduce'} onChange={() => setAdjType('reduce')} className="sr-only" />
                      <span>Reduce (-)</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Quantity to Adjust</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={adjQty}
                    onChange={e => setAdjQty(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                  />
                  {adjType === 'reduce' && adjQty > adjustingItem.currentStock && (
                    <p className="text-[10px] font-bold tracking-wider uppercase text-orange-500 mt-2">Warning: This will drop stock below zero globally.</p>
                  )}
                </div>

                {godowns.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Godown</label>
                    <select
                      value={adjGodownId}
                      onChange={e => setAdjGodownId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                    >
                      <option value="">-- Global Pool --</option>
                      {godowns.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Reason</label>
                  <select
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                  >
                    <option value="Stock Check">Stock Check (Audit)</option>
                    <option value="Damage">Damage/Spoilage</option>
                    <option value="Lost">Lost or Stolen</option>
                    <option value="Internal Use">Internal Use</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Notes (Optional)</label>
                  <input
                    type="text"
                    value={adjNotes}
                    onChange={e => setAdjNotes(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                    placeholder="E.g. Found extra box..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-5 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-3 rounded-b-2xl">
              <button
                type="button"
                disabled={isAdjusting}
                onClick={() => setIsAdjModalOpen(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="adj-form"
                disabled={isAdjusting || adjQty <= 0}
                className="px-6 py-2.5 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
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
