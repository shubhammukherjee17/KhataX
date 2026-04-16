'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Item } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewInventoryItemPage() {
  const router = useRouter();
  const { addItem } = useMasterDataStore();
  const { addNotification } = useNotificationStore();

  const { register, handleSubmit, watch, formState: { isSubmitting } } = useForm<Omit<Item, 'id' | 'currentStock'>>({
    defaultValues: {
      type: 'product',
      name: '',
      description: '',
      unit: 'PCS',
      purchasePrice: 0,
      salePrice: 0,
      taxRate: 18,
      openingStock: 0,
      lowStockAlertLimit: 5
    }
  });

  const itemType = watch('type', 'product');

  const onSubmit = async (data: Omit<Item, 'id' | 'currentStock'>) => {
    try {
      await addItem(data);
      addNotification('Item created successfully', 'success');
      router.push('/inventory');
    } catch (error) {
      console.error("Error saving item:", error);
      addNotification("Failed to save item.", 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Add New Item</h1>
        </div>
      </div>

      <form id="item-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00FFA3]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Item Type *</label>
              <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-xl">
                <label className={`flex-1 text-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${itemType === 'product' ? 'bg-[#00FFA3]/10 text-[#00FFA3] shadow-sm' : 'text-slate-500 hover:text-white'}`}>
                  <input type="radio" value="product" {...register("type")} className="sr-only" />
                  Product
                </label>
                <label className={`flex-1 text-center py-2 text-sm font-bold rounded-lg cursor-pointer transition-all ${itemType === 'service' ? 'bg-[#00FFA3]/10 text-[#00FFA3] shadow-sm' : 'text-slate-500 hover:text-white'}`}>
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Description</label>
              <textarea
                {...register("description")}
                rows={2}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 resize-none shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Unit</label>
              <select
                {...register("unit")}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium shadow-inner"
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
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium shadow-inner"
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
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
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
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
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Low Stock Alert Limit</label>
                  <input
                    type="number"
                    {...register("lowStockAlertLimit", { valueAsNumber: true })}
                    placeholder="5"
                    className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5 p-4 flex justify-end shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40">
          <div className="flex gap-4 max-w-4xl mx-auto w-full justify-end px-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 flex items-center gap-2 text-sm font-bold text-black bg-[#00FFA3] rounded-xl hover:bg-[#00ffa3]/90 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
