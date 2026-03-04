'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Transaction, TransactionItem } from '@/types';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { format } from 'date-fns';

type InvoiceFormData = {
  partyId: string;
  number: string;
  date: string;
  dueDate: string;
  items: TransactionItem[];
  amountPaid: number;
};

export default function NewSalePage() {
  const router = useRouter();
  const { parties, items: inventoryItems } = useMasterDataStore();
  const { addTransaction } = useTransactionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customers = parties.filter(p => p.type === 'customer');

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormData>({
    defaultValues: {
      partyId: '',
      number: `INV-${Date.now().toString().slice(-6)}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(), 'yyyy-MM-dd'),
      items: [{ itemId: '', name: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, taxAmount: 0, totalAmount: 0, netAmount: 0 }],
      amountPaid: 0
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchItems = watch('items');
  const watchAmountPaid = watch('amountPaid');

  // Calculations
  const subTotal = watchItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.rate || 0)), 0);
  const discountTotal = watchItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxAmountTotal = watchItems.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const grandTotal = subTotal - discountTotal + taxAmountTotal;

  // Auto-calculate line items when dependencies change
  useEffect(() => {
    watchItems.forEach((item, index) => {
      const qty = item.quantity || 0;
      const rate = item.rate || 0;
      const discount = item.discount || 0;
      const taxRate = item.taxRate || 0;

      const lineTotalBeforeTax = (qty * rate) - discount;
      const taxAmount = (lineTotalBeforeTax * taxRate) / 100;
      const totalAmount = lineTotalBeforeTax + taxAmount;

      if (item.taxAmount !== taxAmount || item.totalAmount !== totalAmount) {
        setValue(`items.${index}.taxAmount`, taxAmount);
        setValue(`items.${index}.totalAmount`, totalAmount);
      }
    });
  }, [watchItems, setValue]);

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = inventoryItems.find(i => i.id === itemId);
    if (selectedItem) {
      setValue(`items.${index}.name`, selectedItem.name);
      setValue(`items.${index}.rate`, selectedItem.salePrice);
      setValue(`items.${index}.taxRate`, selectedItem.taxRate);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    if (data.items.length === 0 || !data.items[0].itemId) {
      alert("Please add at least one item");
      return;
    }

    const selectedParty = parties.find(p => p.id === data.partyId);

    // Credit Limit Check
    if (selectedParty && selectedParty.type === 'customer' && selectedParty.creditLimit && selectedParty.creditLimit > 0) {
      // Balance is positive when they owe us money (our receivable)
      // Since currentBalance is from their perspective, negative is our receivable
      const currentReceivable = Math.abs(selectedParty.currentBalance < 0 ? selectedParty.currentBalance : 0);
      const newReceivable = currentReceivable + grandTotal - (data.amountPaid || 0);

      if (newReceivable > selectedParty.creditLimit) {
        alert(`Cannot create invoice. Credit limit of ₹${selectedParty.creditLimit} will be exceeded.\nCurrent Owed: ₹${currentReceivable.toFixed(2)}\nNew Invoice: ₹${grandTotal.toFixed(2)}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const transactionData: Omit<Transaction, 'id'> = {
        type: 'sale_invoice',
        number: data.number,
        date: new Date(data.date).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        partyId: data.partyId,
        partyName: selectedParty?.name || 'Unknown Party',
        items: data.items.filter(i => i.itemId), // Remove empty rows
        subTotal,
        taxAmountTotal,
        discountTotal,
        grandTotal,
        amountPaid: data.amountPaid || 0,
        status: 'draft' // Handled in store
      };

      await addTransaction(transactionData);
      router.push('/sales');
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-200 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">New Sale Invoice</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header Details */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 text-red-600">Customer *</label>
              <select
                {...register("partyId", { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 text-red-600">Invoice No *</label>
              <input
                {...register("number", { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 text-red-600">Invoice Date *</label>
              <input
                type="date"
                {...register("date", { required: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/50 text-slate-600 font-medium">
                <tr>
                  <th className="px-4 py-3 w-1/3">Item</th>
                  <th className="px-4 py-3 w-24">Qty</th>
                  <th className="px-4 py-3 w-32">Rate (₹)</th>
                  <th className="px-4 py-3 w-28">Disc (₹)</th>
                  <th className="px-4 py-3 w-28">GST (%)</th>
                  <th className="px-4 py-3 w-32">Tax (₹)</th>
                  <th className="px-4 py-3 text-right">Amount (₹)</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((field, index) => (
                  <tr key={field.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <select
                        {...register(`items.${index}.itemId`, { required: true })}
                        onChange={(e) => {
                          register(`items.${index}.itemId`).onChange(e); // Trigger RHF
                          handleItemSelect(index, e.target.value);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">Select Item</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      <input type="hidden" {...register(`items.${index}.name`)} />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01" min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                        className="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={18}>18%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full px-2 py-1.5 bg-slate-100 rounded text-slate-500 text-sm">
                        {watchItems[index]?.taxAmount?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-medium text-slate-800">
                        {watchItems[index]?.totalAmount?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => append({ itemId: '', name: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, taxAmount: 0, totalAmount: 0, netAmount: 0 })}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" /> Add Row
            </button>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4 h-fit">
            <h3 className="font-semibold text-slate-800 border-b pb-2">Payment Received Setup</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Amount Received (₹)</label>
              <input
                type="number" step="0.01"
                {...register("amountPaid", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
            </div>
            {watchAmountPaid > 0 && (
              <p className="text-xs text-slate-500">
                Remaining Balance: ₹{Math.max(0, grandTotal - (watchAmountPaid || 0)).toFixed(2)}
              </p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Discount</span>
                <span>- ₹{discountTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Tax (GST)</span>
                <span>+ ₹{taxAmountTotal.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-900">
                <span>Grand Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 md:pl-64 bg-white border-t border-slate-200 p-4 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
