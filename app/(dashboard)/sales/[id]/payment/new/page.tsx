'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

type PaymentFormData = {
  amount: number;
};

export default function RecordPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  
  const { transactions, isLoading, updateTransaction } = useTransactionStore();
  const { addNotification } = useNotificationStore();
  const [initLoading, setInitLoading] = useState(true);

  const invoice = transactions.find(t => t.id === invoiceId);
  const balanceDue = invoice ? invoice.grandTotal - invoice.amountPaid : 0;

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<PaymentFormData>({
    defaultValues: { amount: 0 }
  });

  useEffect(() => {
    if (!isLoading) {
      if (!invoice) {
        addNotification("Invoice not found", "error");
        router.push('/sales');
      } else if (balanceDue <= 0) {
        addNotification("Invoice is already fully paid", "info");
        router.push(`/sales/${invoiceId}`);
      } else {
        reset({ amount: balanceDue });
        setInitLoading(false);
      }
    }
  }, [isLoading, invoice, balanceDue, reset, router, invoiceId, addNotification]);

  const onSubmit = async (data: PaymentFormData) => {
    if (!invoice) return;

    if (data.amount <= 0) {
      addNotification('Amount must be greater than zero.', 'error');
      return;
    }

    if (data.amount > balanceDue) {
      addNotification('Amount cannot exceed the balance due.', 'error');
      return;
    }

    const newAmountPaid = invoice.amountPaid + data.amount;
    const newStatus = newAmountPaid >= invoice.grandTotal ? 'paid' : 'partially_paid';

    try {
      await updateTransaction(invoice.id, {
        amountPaid: newAmountPaid,
        status: newStatus
      });
      addNotification('Payment recorded successfully.', 'success');
      router.push(`/sales/${invoiceId}`);
    } catch (e) {
      console.error('Failed to record payment', e);
      addNotification('Failed to record payment.', 'error');
    }
  };

  if (initLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading details...</div>;
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-white">Record Payment</h1>
          <p className="text-sm font-semibold text-slate-400">Invoice {invoice?.number} • {invoice?.partyName}</p>
        </div>
      </div>

      <form id="payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 sm:p-8 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ea77]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="mb-8 p-4 bg-[#0a0a0a] border border-white/5 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Balance Due</p>
              <p className="text-2xl font-bold text-red-400">₹{balanceDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold tracking-wider text-slate-500 uppercase mb-1">Invoice Total</p>
              <p className="text-lg font-bold text-white">₹{invoice?.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            </div>
          </div>

          <div className="max-w-md relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Payment Amount Received <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input 
                  type="number"
                  step="0.01"
                  max={balanceDue}
                  {...register("amount", { required: true, valueAsNumber: true, min: 0.01, max: balanceDue })}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 text-xl bg-[#0a0a0a] border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00ea77]/50 focus:border-transparent text-white font-bold placeholder:text-slate-600 shadow-inner"
                />
              </div>
              <div className="flex justify-between items-center mt-2 px-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Cannot exceed balance due
                </p>
                <button
                  type="button"
                  onClick={() => reset({ amount: balanceDue })}
                  className="text-[10px] font-bold text-[#00ea77] hover:text-white uppercase tracking-wider transition-colors"
                >
                  Set to Max
                </button>
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
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
