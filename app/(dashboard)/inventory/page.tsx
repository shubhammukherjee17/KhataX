'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { Item } from '@/types';
import { Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function InventoryPage() {
  const { items, isLoading, addItem, updateItem, deleteItem } = useMasterDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500">Manage your products, services, and stock levels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search by product/service name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No inventory items found.</p>
            <button onClick={openAddModal} className="text-blue-600 font-medium hover:underline mt-2">
              Add your first product or service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Item Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Sale Price</th>
                  <th className="px-6 py-3 text-right">Purchase Price</th>
                  <th className="px-6 py-3 text-right">Current Stock</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                      <span className="block text-xs font-normal text-slate-500 mt-1">GST: {item.taxRate}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${item.type === 'product' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₹{item.salePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      ₹{item.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.type === 'service' ? (
                        <span className="text-slate-400">-</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2" title={item.currentStock <= item.lowStockAlertLimit ? "Low Stock" : ""}>
                          {item.currentStock <= item.lowStockAlertLimit && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className={`font-medium ${item.currentStock <= 0 ? 'text-red-600' : 'text-slate-900'}`}>
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(item)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:text-red-800 p-1 ml-2">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Item Type *</label>
                    <div className="flex bg-slate-100 p-1 rounded-md">
                      <label className={`flex-1 text-center py-2 text-sm font-medium rounded cursor-pointer transition ${itemType === 'product' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <input type="radio" value="product" {...register("type")} className="sr-only" />
                        Product
                      </label>
                      <label className={`flex-1 text-center py-2 text-sm font-medium rounded cursor-pointer transition ${itemType === 'service' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
                        <input type="radio" value="service" {...register("type")} className="sr-only" />
                        Service
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Item Name *</label>
                    <input 
                      {...register("name", { required: true })}
                      placeholder="e.g. Dell Monitor 24 inch"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Description</label>
                    <textarea 
                      {...register("description")}
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Unit</label>
                    <select 
                      {...register("unit")}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="text-sm font-medium text-slate-700">Tax Rate (GST %)</label>
                    <select 
                      {...register("taxRate", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={0}>Exempt (0%)</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Sale Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input 
                        type="number"
                        step="0.01"
                        {...register("salePrice", { required: true, valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Purchase Price *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input 
                        type="number"
                        step="0.01"
                        {...register("purchasePrice", { required: true, valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {itemType === 'product' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Opening Stock</label>
                        <input 
                          type="number"
                          {...register("openingStock", { valueAsNumber: true })}
                          placeholder="0"
                          disabled={!!editingItem} // typically you don't edit opening stock directly later
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Low Stock Alert Limit</label>
                        <input 
                          type="number"
                          {...register("lowStockAlertLimit", { valueAsNumber: true })}
                          placeholder="5"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="item-form"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
