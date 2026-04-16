'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/hooks/useAuth';
import { Transaction, TransactionItem } from '@/types';
import { ArrowLeft, Plus, Trash2, Save, Sparkles, Loader2, ImagePlus } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useNotificationStore } from '@/store/useNotificationStore';

type InvoiceFormData = {
  partyId: string;
  vendorName?: string;
  vendorPhone?: string;
  vendorAddress?: string;
  number: string;
  date: string;
  items: TransactionItem[];
  amountPaid: number;
};

export default function NewPurchasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPoId = searchParams.get('fromPo');

  const { parties, items: inventoryItems, setBusinessId: setBusinessIdMaster } = useMasterDataStore();
  const { transactions, addTransaction, updateTransaction, setBusinessId: setBusinessIdTx } = useTransactionStore();
  const { businessId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    setBusinessIdMaster(businessId);
    setBusinessIdTx(businessId);
  }, [businessId, setBusinessIdMaster, setBusinessIdTx]);

  // We show vendors for purchases
  const vendors = parties.filter(p => p.type === 'vendor');

  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceFormData>({
    defaultValues: {
      partyId: '',
      vendorName: '',
      vendorPhone: '',
      vendorAddress: '',
      number: `BILL-${Date.now().toString().slice(-6)}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      items: [{ itemId: '', name: '', quantity: 1, rate: 0, discount: 0, taxRate: 18, taxAmount: 0, totalAmount: 0, netAmount: 0 }],
      amountPaid: 0
    }
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'items'
  });

  // Pre-fill if coming from a PO
  useEffect(() => {
    if (fromPoId) {
      const sourcePo = transactions.find(t => t.id === fromPoId);
      if (sourcePo) {
        setValue('partyId', sourcePo.partyId);
        replace(sourcePo.items);
      }
    }
  }, [fromPoId, transactions, setValue, replace]);

  const watchItems = watch('items');
  const watchAmountPaid = watch('amountPaid');
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

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const res = await fetch('/api/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        
        if (res.status === 403) {
          useNotificationStore.getState().addNotification("⚠️ API Permissions Denied! Your Firebase key cannot process AI features. Please get a free key from Google AI Studio, add 'GEMINI_API_KEY=your_key' to your .env file, and restart the server.", 'error');
          setIsScanning(false);
          return;
        }

        if (!res.ok) throw new Error("API Failed");
        const data = await res.json();
        
        if (data.result) {
          const parsed = JSON.parse(data.result);
          if (parsed.vendorName) {
            setValue('partyId', 'walk-in');
            setValue('vendorName', parsed.vendorName);
          }
          if (parsed.date) setValue('date', parsed.date);
          if (parsed.number) setValue('number', parsed.number);
          
          if (parsed.items && parsed.items.length > 0) {
            replace(parsed.items.map((i: any) => ({
              itemId: '',
              name: i.name,
              quantity: i.quantity || 1,
              rate: i.rate || 0,
              discount: 0,
              taxRate: i.taxRate || 0,
              taxAmount: 0,
              totalAmount: 0,
              netAmount: 0
            })));
          }
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (e) {
      console.error(e);
      useNotificationStore.getState().addNotification("Failed to scan receipt intelligently.", 'error');
      setIsScanning(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
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
        type: 'purchase_invoice',
        number: data.number,
        date: new Date(data.date).toISOString(),
        partyId: data.partyId,
        partyName: finalPartyName,
        customerPhone: isWalkIn ? data.vendorPhone : undefined,
        customerAddress: isWalkIn ? data.vendorAddress : undefined,
        items: data.items.filter(i => i.itemId || i.name).map(item => {
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
        amountPaid: data.amountPaid || 0,
        status: 'draft',
        linkedPurchaseBillId: fromPoId || null
      };

      const newBillId = await addTransaction(transactionData);

      // If we converted from a PO, update the original PO status
      if (fromPoId) {
        try {
          await updateTransaction(fromPoId, { status: 'fully_billed', linkedPurchaseBillId: newBillId });
        } catch (e) { console.error("Could not update PO status", e); }
      }

      // OPTIONAL TODO: trigger stock updates here using a Firebase Edge function or batch writes.
      useNotificationStore.getState().addNotification('Purchase Bill saved successfully!', 'success');
      router.push('/purchases');
    } catch (error) {
      console.error("Error saving bill:", error);
      useNotificationStore.getState().addNotification("Failed to save purchase bill.", 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#00FFA3]/10 flex items-center justify-center">
              <span className="w-3 h-3 bg-[#00FFA3] rounded-sm"></span>
            </span>
            Record Purchase Bill
          </h1>
        </div>
        
        <div className="ml-auto flex items-center">
          <label className={`cursor-pointer flex items-center justify-center gap-2 bg-[#00FFA3]/10 border border-[#00FFA3]/30 text-[#00FFA3] hover:bg-[#00FFA3]/20 px-4 py-2.5 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(0,234,119,0.1)] ${isScanning ? 'opacity-50 pointer-events-none' : ''}`}>
            {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isScanning ? 'Scanning Receipt...' : 'AI Auto-Fill'}
            <input type="file" accept="image/*" onChange={handleReceiptScan} className="hidden" />
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FFA3]/5 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Vendor *</label>
              <select
                {...register("partyId", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium"
              >
                <option value="">Select Vendor</option>
                <option value="walk-in">--- Walk-in / Custom Vendor ---</option>
                {vendors.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.gstin ? `(${c.gstin})` : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Bill No *</label>
              <input
                {...register("number", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Bill Date *</label>
              <input
                type="date"
                {...register("date", { required: true })}
                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium [color-scheme:dark]"
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
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600"
                  placeholder="e.g. ABC Suppliers"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Phone Number</label>
                <input
                  {...register("vendorPhone")}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Billing Address</label>
                <textarea
                  {...register("vendorAddress")}
                  rows={1}
                  className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                  placeholder="Street, City, PIN"
                />
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/5">
            <h2 className="font-semibold text-white">Items</h2>
          </div>
          <div className="overflow-x-auto px-5 pb-5 pt-2">
            <table className="w-full text-left font-medium">
              <thead className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                <tr>
                  <th className="py-4 min-w-[180px]">Item</th>
                  <th className="px-3 py-4 w-[110px]">Qty</th>
                  <th className="px-3 py-4 w-[130px]">Purch. Rate (₹)</th>
                  <th className="px-3 py-4 w-[110px]">Disc (₹)</th>
                  <th className="px-3 py-4 w-[110px]">GST (%)</th>
                  <th className="px-3 py-4 w-[120px]">Tax (₹)</th>
                  <th className="px-4 py-4 w-[140px] text-right">Amount (₹)</th>
                  <th className="px-2 py-4 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {fields.map((field, index) => (
                  <tr key={field.id} className="group">
                    <td className="py-3 pr-4">
                      <select
                        {...register(`items.${index}.itemId`, { required: true })}
                        onChange={(e) => {
                          register(`items.${index}.itemId`).onChange(e); // Trigger RHF
                          handleItemSelect(index, e.target.value);
                        }}
                        className="w-full min-w-[80px] px-3 py-2.5 text-[15px] font-semibold tracking-wide bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white transition-colors"
                      >
                        <option value="">Select Item</option>
                        <option value="walk-in">-- Custom Item --</option>
                        {inventoryItems.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                      {watchItems[index]?.itemId === 'walk-in' || watchItems[index]?.itemId === '' ? (
                         <input 
                           {...register(`items.${index}.name`)} 
                           placeholder="Type custom name"
                           className="w-full mt-2 px-3 py-2 text-xs font-medium tracking-wide bg-[#1a1a1a] border border-white/5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 text-slate-300"
                         />
                      ) : (
                         <input type="hidden" {...register(`items.${index}.name`)} />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01" min="1"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full min-w-[80px] px-3 py-2.5 text-[15px] font-semibold tracking-wide bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white transition-colors"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        className="w-full min-w-[80px] px-3 py-2.5 text-[15px] font-semibold tracking-wide bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white transition-colors"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number" step="0.01"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        className="w-full min-w-[80px] px-3 py-2.5 text-[15px] font-semibold tracking-wide bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white transition-colors"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                        className="w-full min-w-[80px] px-3 py-2.5 text-[15px] font-semibold tracking-wide bg-[#0a0a0a] border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00FFA3]/50 focus:border-[#00FFA3]/50 text-white transition-colors"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-full px-3 py-2.5 bg-white/5 line-clamp-1 rounded-lg text-slate-400 border border-transparent font-semibold tracking-wide flex items-center h-[42px]">
                        {(() => {
                          const item = watchItems[index];
                          const lineTotalBeforeTax = ((item?.quantity || 0) * (item?.rate || 0)) - (item?.discount || 0);
                          const taxAmount = (lineTotalBeforeTax * (item?.taxRate || 0)) / 100;
                          return taxAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-white text-lg">
                        {(() => {
                           const item = watchItems[index];
                           const lineTotalBeforeTax = ((item?.quantity || 0) * (item?.rate || 0)) - (item?.discount || 0);
                           const taxAmount = (lineTotalBeforeTax * (item?.taxRate || 0)) / 100;
                           return (lineTotalBeforeTax + taxAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
                        })()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-slate-500 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-500/10"
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
              className="flex items-center gap-2 text-sm font-bold text-[#00FFA3] hover:text-[#00c563] bg-[#00FFA3]/10 px-4 py-2 rounded-lg transition-colors border border-[#00FFA3]/20"
            >
              <Plus className="h-4 w-4" /> Add Line Item
            </button>
          </div>
        </div>

        {/* Footer Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10 space-y-4 h-fit relative">
            <h3 className="font-semibold text-white border-b border-white/5 pb-3 uppercase tracking-wider text-xs">Payment Collection</h3>
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Amount Paid (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input
                  type="number" step="0.01"
                  {...register("amountPaid", { valueAsNumber: true })}
                  className="w-full px-4 py-4 pl-8 bg-[#0a0a0a] border border-[#00FFA3]/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00FFA3] focus:border-[#00FFA3] text-2xl font-bold text-[#00FFA3]"
                />
              </div>
            </div>
            {watchAmountPaid > 0 && (
              <p className="text-xs font-bold text-slate-400 flex justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                <span>To be Paid later</span>
                <span className="text-white"><AnimatedNumber value={Math.max(0, grandTotal - (watchAmountPaid || 0))} format="currency" /></span>
              </p>
            )}
          </div>

          <div className="bg-[#111] p-6 rounded-2xl shadow-sm border border-white/10 relative overflow-hidden">
            <div className="space-y-4 text-sm font-medium relative z-10">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-white"><AnimatedNumber value={subTotal} format="currency" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Discount</span>
                <span className="text-red-400 flex items-center gap-1">- <AnimatedNumber value={discountTotal} format="currency" /></span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Tax (GST)</span>
                <span className="text-yellow-400 flex items-center gap-1">+ <AnimatedNumber value={taxAmountTotal} format="currency" /></span>
              </div>
              <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-xs">Grand Total</span>
                <span className="font-bold text-3xl text-white"><AnimatedNumber value={grandTotal} format="currency" /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-[#0a0a0a] border-t border-white/10 p-4 flex justify-end shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40">
          <div className="flex gap-4 w-full md:w-auto max-w-7xl mx-auto md:mx-0 px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 md:flex-none px-8 py-3 flex items-center justify-center gap-2 text-sm font-bold text-black bg-[#00FFA3] rounded-xl hover:bg-[#00ffa3]/90 disabled:opacity-50 transition-all shadow-[0_0_20px_rgba(0,234,119,0.2)] hover:shadow-[0_0_25px_rgba(0,234,119,0.4)]"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Purchase Bill'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
