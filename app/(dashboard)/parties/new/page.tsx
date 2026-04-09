'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Party } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewPartyPage() {
  const router = useRouter();
  const { addParty } = useMasterDataStore();
  const { addNotification } = useNotificationStore();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Omit<Party, 'id' | 'currentBalance'>>({
    defaultValues: {
      type: 'customer',
      name: '',
      gstin: '',
      phone: '',
      email: '',
      billingAddress: '',
      shippingAddress: '',
      openingBalance: 0,
      creditLimit: 0,
      creditDays: 30
    }
  });

  const onSubmit = async (data: Omit<Party, 'id' | 'currentBalance'>) => {
    try {
      await addParty(data);
      addNotification('Party created successfully', 'success');
      router.push('/parties');
    } catch (error) {
      console.error("Error saving party:", error);
      addNotification("Failed to save party.", 'error');
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Add New Party</h1>
        </div>
      </div>

      <form id="party-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ea77]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Party Type *</label>
              <select
                {...register("type", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium shadow-inner"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Party Name *</label>
              <input
                {...register("name", { required: true })}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">GSTIN</label>
              <input
                {...register("gstin")}
                placeholder="e.g. 29ABCDE1234F1Z5"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 uppercase shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Phone Number *</label>
              <input
                {...register("phone", { required: true })}
                placeholder="10-digit mobile"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
              <input
                type="email"
                {...register("email")}
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Opening Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("openingBalance", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
                />
              </div>
              <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-1">+ve for Payable, -ve for Receivable</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Credit Limit (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  step="0.01"
                  {...register("creditLimit", { valueAsNumber: true })}
                  placeholder="10000.00"
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Payment Terms</label>
              <select
                {...register("creditDays", { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium shadow-inner"
              >
                <option value="0">Advance (0 Days)</option>
                <option value="7">7 Days</option>
                <option value="15">15 Days</option>
                <option value="30">30 Days</option>
                <option value="45">45 Days</option>
                <option value="60">60 Days</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <h3 className="font-bold text-white text-sm mb-6 border-b border-white/5 pb-3">Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Billing Address</label>
              <textarea
                {...register("billingAddress")}
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Shipping Address</label>
              <textarea
                {...register("shippingAddress")}
                rows={3}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none shadow-inner"
              />
            </div>
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
              className="px-6 py-2.5 flex items-center gap-2 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Party'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
