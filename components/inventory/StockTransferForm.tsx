'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { StockTransfer } from '@/types';
import { ArrowLeftRight, X, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function StockTransferForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
    const { items, godowns, transferStock } = useMasterDataStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorStr, setErrorStr] = useState<string | null>(null);

    const { register, handleSubmit, watch, reset } = useForm<Omit<StockTransfer, 'id' | 'date' | 'itemName'>>({
        defaultValues: {
            itemId: '',
            fromGodownId: '',
            toGodownId: '',
            quantity: 1,
            reason: ''
        }
    });

    const selectedItemId = watch('itemId');
    const selectedFromGodownId = watch('fromGodownId');

    const selectedItem = items.find(i => i.id === selectedItemId);

    // Find max available stock for the selected From Godown
    let maxAvailable = 0;
    if (selectedItem && selectedFromGodownId) {
        const stockRecord = selectedItem.stockByGodown?.find(s => s.godownId === selectedFromGodownId);
        if (stockRecord) {
            maxAvailable = stockRecord.quantity;
        }
    }

    const onSubmit = async (data: Omit<StockTransfer, 'id' | 'date' | 'itemName'>) => {
        setErrorStr(null);
        if (data.fromGodownId === data.toGodownId) {
            setErrorStr("Source and destination godowns cannot be the same.");
            return;
        }

        if (data.quantity <= 0) {
            setErrorStr("Quantity must be greater than 0.");
            return;
        }

        if (data.quantity > maxAvailable) {
            setErrorStr(`Not enough stock in source godown. Maximum available is ${maxAvailable}.`);
            return;
        }

        setIsSubmitting(true);
        try {
            const parentItem = items.find(i => i.id === data.itemId);
            if (!parentItem) throw new Error("Item not found");

            await transferStock({
                ...data,
                itemName: parentItem.name
            });

            reset();
            if (onSuccess) onSuccess();
            else alert("Transfer successful");
        } catch (error: unknown) {
            console.error("Error transferring stock:", error);
            setErrorStr(error instanceof Error ? error.message : "Failed to transfer stock.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (godowns.length < 2) {
        return (
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-5 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                <div>
                    <h4 className="font-bold text-white">Multiple Godowns Required</h4>
                    <p className="text-sm mt-1 font-semibold">You need at least 2 godowns configured to perform a stock transfer. Please add them in the Godown Manager.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden flex flex-col w-full max-w-lg">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                <h2 className="text-lg font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-white/5 rounded-lg text-[#00ea77]">
                        <ArrowLeftRight className="w-5 h-5" />
                    </div>
                    Transfer Stock
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="p-6">
                {errorStr && (
                    <div className="mb-6 bg-red-500/10 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-500/20">
                        {errorStr}
                    </div>
                )}

                <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Select Item *</label>
                        <select
                            {...register("itemId", { required: true })}
                            className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium break-words whitespace-normal break-all"
                            style={{ maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                            <option value="">-- Choose Item --</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 relative pb-6">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">From Godown *</label>
                            <select
                                {...register("fromGodownId", { required: true })}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                            >
                                <option value="">-- Choose Source --</option>
                                {godowns.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            {selectedItem && selectedFromGodownId && (
                                <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase absolute bottom-0 left-0">
                                    Available: <strong className={maxAvailable > 0 ? "text-[#00ea77]" : "text-red-500"}>{maxAvailable}</strong>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">To Godown *</label>
                            <select
                                {...register("toGodownId", { required: true })}
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                            >
                                <option value="">-- Choose Destination --</option>
                                {godowns.map(g => (
                                    <option key={g.id} value={g.id} disabled={g.id === selectedFromGodownId}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2 relative">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Quantity *</label>
                            <input
                                type="number"
                                step="any"
                                {...register("quantity", { required: true, valueAsNumber: true, min: 0.01 })}
                                placeholder="0"
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Reason (Optional)</label>
                            <input
                                {...register("reason")}
                                placeholder="e.g. Regular restock"
                                className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                </form>
            </div>

            <div className="px-6 py-5 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-3 rounded-b-2xl mt-auto">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    form="transfer-form"
                    disabled={isSubmitting || maxAvailable <= 0}
                    className="px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)] disabled:opacity-50"
                >
                    {isSubmitting ? 'Transferring...' : 'Transfer Stock'}
                </button>
            </div>
        </div>
    );
}
