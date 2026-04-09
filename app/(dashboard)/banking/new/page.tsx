'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useBankStore, BankAccount } from '@/store/useBankStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewBankAccountPage() {
  const router = useRouter();
  const { addAccount } = useBankStore();
  const { addNotification } = useNotificationStore();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Omit<BankAccount, 'id' | 'currentBalance'>>({
    defaultValues: {
      type: 'bank',
      name: '',
      accountNumber: '',
      ifscCode: '',
      openingBalance: 0
    }
  });

  const onSubmit = async (data: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    try {
      await addAccount(data);
      addNotification('Account created successfully', 'success');
      router.push('/banking');
    } catch (error) {
      console.error("Error saving account:", error);
      addNotification("Failed to save account.", 'error');
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
          <h1 className="text-2xl font-bold tracking-tight text-white">Add New Account</h1>
        </div>
      </div>

      <form id="acct-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ea77]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Account Type <span className="text-red-500">*</span></label>
              <select 
                {...register("type", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium shadow-inner"
              >
                <option value="bank">Bank Account</option>
                <option value="cash">Cash Register</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Account Name <span className="text-red-500">*</span></label>
              <input 
                {...register("name", { required: true })}
                placeholder="e.g. HDFC Current A/C"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Account Number</label>
              <input 
                {...register("accountNumber")}
                placeholder="e.g. 5010023XXXX"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 shadow-inner"
              />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">Required only for Banks</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">IFSC Code</label>
              <input 
                {...register("ifscCode")}
                placeholder="e.g. HDFC0001234"
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 uppercase shadow-inner"
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
              {isSubmitting ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
