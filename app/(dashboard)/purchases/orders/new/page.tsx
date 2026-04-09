'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, TransactionItem } from '@/types';
import { ArrowLeft, Plus, Trash2, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useNotificationStore } from '@/store/useNotificationStore';

type POFormData = {
  partyId: string;
  vendorName?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  number: string;
  date: string;
  dueDate: string;
  items: TransactionItem[];
};

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const { parties, items: inventoryItems, setBusinessId: setBusinessIdMaster } = useMasterDataStore();
  const { addTransaction, setBusinessId: setBusinessIdTx } = useTransactionStore();
  const { businessId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBusinessIdMaster(businessId);
    setBusinessIdTx(businessId);
  }, [businessId, setBusinessIdMaster, setBusinessIdTx]);

  // We show vendors for purchase orders
  const vendors = parties.filter(p => p.type === 'vendor');

  const { register, control, handleSubmit, watch, setValue } = useForm<POFormData>({
    defaultValues: {
      partyId: '',
      vendorName: '',
      vendorPhone: '',
      vendorAddress: '',
      number: `PO-${Date.now().toString().slice(-6)}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      items: [{ itemId: '', name: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, taxAmount: 0, totalAmount: 0, netAmount: 0 }],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchPartyId = watch('partyId');

  // Calculations derived directly from form state (avoiding useEffect sync issues)
  const subTotal = watchItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
  const discountTotal = watchItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxAmountTotal = watchItems.reduce((sum, item) => {
    const lineTotalBeforeTax = ((item.quantity || 0) * (item.rate || 0)) - (item.discount || 0);
    return sum + ((lineTotalBeforeTax * (item.taxRate || 0)) / 100);
  }, 0);
  const grandTotal = subTotal - discountTotal + taxAmountTotal;

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = inventoryItems.find(i => i.id === itemId);
    if (selectedItem) {
      setValue(`items.${index}.name`, selectedItem.name);
      setValue(`items.${index}.rate`, selectedItem.purchasePrice);
      setValue(`items.${index}.taxRate`, selectedItem.taxRate);
    }
  };

  const onSubmit = async (data: POFormData) => {
    if (data.items.length === 0 || !data.items[0].itemId) {
      useNotificationStore.getState().addNotification("Please add at least one item", 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedParty = parties.find(p => p.id === data.partyId);

      const isWalkIn = data.partyId === 'walk-in';
      const finalPartyName = isWalkIn ? (data.vendorName || 'Walk-in Vendor') : (selectedParty?.name || 'Unknown Vendor');

      const transactionData: Omit<Transaction, 'id'> = {
        type: 'purchase_order',
        number: data.number,
        date: new Date(data.date).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        partyId: data.partyId,
        partyName: finalPartyName,
        customerPhone: isWalkIn ? data.vendorPhone : undefined,
        customerAddress: isWalkIn ? data.vendorAddress : undefined,
        items: data.items.filter(i => i.itemId).map(item => {
          const qty = item.quantity || 0;
          const rate = item.rate || 0;
          const discount = item.discount || 0;
          const taxRate = item.taxRate || 0;
          const lineTotalBeforeTax = (qty * rate) - discount;
          const taxAmount = (lineTotalBeforeTax * taxRate) / 100;
          const totalAmount = lineTotalBeforeTax + taxAmount;
          return {
            ...item,
            taxAmount,
            totalAmount,
            netAmount: lineTotalBeforeTax
          };
        }),
        subTotal,
        taxAmountTotal,
        discountTotal,
        grandTotal,
        amountPaid: 0, // POs don't involve immediate payment
        status: 'sent' // Creating standardizes it as sent to vendor
      };

      await addTransaction(transactionData);
      useNotificationStore.getState().addNotification("Purchase Order created successfully.", 'success');
      router.push('/purchases/orders');
    } catch (error) {
      console.error("Error saving PO:", error);
      useNotificationStore.getState().addNotification("Failed to save Purchase Order.", 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Purchase Order</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00ea77]/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Vendor *</label>
              <select
                {...register("partyId", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
              >
                <option value="">Select Vendor</option>
                <option value="walk-in">--- Walk-in / Custom Vendor ---</option>
                {vendors.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">PO No *</label>
              <input
                {...register("number", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Issue Date *</label>
              <input
                type="date"
                {...register("date", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium pl-3 [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Walk-in Custom Details */}
          {watchPartyId === 'walk-in' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Vendor Name</label>
                <input
                  {...register("vendorName", { required: true })}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                  placeholder="e.g. ABC Suppliers"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Phone Number</label>
                <input
                  {...register("vendorPhone")}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Billing Address</label>
                <textarea
                  {...register("vendorAddress")}
                  rows={1}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                  placeholder="Street, City, PIN"
                />
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-[#0a0a0a]">
            <h2 className="font-bold text-white text-lg">Order Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#111] text-slate-500 font-bold tracking-wider uppercase text-xs border-b border-white/5">
                <tr>
                  <th className="px-5 py-4 w-[30%]">Item</th>
                  <th className="px-5 py-4 w-24">Qty</th>
                  <th className="px-5 py-4 w-32">Purch. Rate (₹)</th>
                  <th className="px-5 py-4 w-28">Disc (₹)</th>
                  <th className="px-5 py-4 w-28">GST (%)</th>
                  <th className="px-5 py-4 w-32">Tax (₹)</th>
                  <th className="px-5 py-4 text-right">Amount (₹)</th>
                  <th className="px-5 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-3">
                      <select
                        {...register(`items.${index}.itemId`, { required: true })}
                        onChange={(e) => {
                          register(`items.${index}.itemId`).onChange(e); // Trigger RHF
                          handleItemSelect(index, e.target.value);
                        }}
                        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium min-w-[150px]"
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      <input type="hidden" {...register(`items.${index}.name`)} />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number" step="0.01" min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium min-w-[80px]"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium min-w-[100px]"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium min-w-[80px]"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <select
                        {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                        className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium min-w-[80px]"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-xl text-slate-400 font-medium min-w-[100px]">
                        {(() => {
                          const item = watchItems[index];
                          const lineTotalBeforeTax = ((item?.quantity || 0) * (item?.rate || 0)) - (item?.discount || 0);
                          const taxAmount = (lineTotalBeforeTax * (item?.taxRate || 0)) / 100;
                          return taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                        })()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="font-bold text-white pr-2 min-w-[100px]">
                        {(() => {
                           const item = watchItems[index];
                           const lineTotalBeforeTax = ((item?.quantity || 0) * (item?.rate || 0)) - (item?.discount || 0);
                           const taxAmount = (lineTotalBeforeTax * (item?.taxRate || 0)) / 100;
                           return (lineTotalBeforeTax + taxAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
                        })()}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-white/5 bg-[#0a0a0a]">
            <button
              type="button"
              onClick={() => append({ itemId: '', name: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, taxAmount: 0, totalAmount: 0, netAmount: 0 })}
              className="flex items-center gap-2 text-sm font-bold text-[#00ea77] bg-[#00ea77]/10 hover:bg-[#00ea77]/20 px-4 py-2.5 rounded-xl transition-colors border border-[#00ea77]/20"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add Line Item
            </button>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hidden md:block"></div>
          <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ea77]/5 rounded-full blur-[40px] pointer-events-none"></div>

            <div className="space-y-4 text-sm relative z-10">
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Total Value</span>
                <span className="text-white">₹{subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Total Discount</span>
                <span className="text-red-400">- ₹{discountTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-medium">
                <span>Tax Estimated (GST)</span>
                <span className="text-white">+ ₹{taxAmountTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-between font-bold text-xl text-white">
                <span>Order Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#0a0a0a]/80 backdrop-blur-md border-t border-white/5 p-4 flex justify-end shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-40">
          <div className="flex gap-4 max-w-5xl mx-auto w-full justify-end px-4 md:px-6">
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
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Send PO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
