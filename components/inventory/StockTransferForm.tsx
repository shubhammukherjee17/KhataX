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
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                    <h4 className="font-semibold">Multiple Godowns Required</h4>
                    <p className="text-sm mt-1">You need at least 2 godowns configured to perform a stock transfer. Please add them in the Godown Manager.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-blue-600" />
                    Transfer Stock
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-slate-400 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>

            <div className="p-6">
                {errorStr && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm border border-red-200">
                        {errorStr}
                    </div>
                )}

                <form id="transfer-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 text-red-600">Select Item *</label>
                        <select
                            {...register("itemId", { required: true })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">-- Choose Item --</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-slate-700 text-red-600">From Godown *</label>
                            <select
                                {...register("fromGodownId", { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Source --</option>
                                {godowns.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            {selectedItem && selectedFromGodownId && (
                                <p className="text-xs text-slate-500 absolute -bottom-5 left-0">
                                    Available: <strong className={maxAvailable > 0 ? "text-green-600" : "text-red-500"}>{maxAvailable}</strong>
                                </p>
                            )}
                        </div>

                        <div className="space-y-2 relative">
                            <label className="text-sm font-medium text-slate-700 text-red-600">To Godown *</label>
                            <select
                                {...register("toGodownId", { required: true })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Choose Destination --</option>
                                {godowns.map(g => (
                                    <option key={g.id} value={g.id} disabled={g.id === selectedFromGodownId}>{g.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 text-red-600">Quantity *</label>
                            <input
                                type="number"
                                step="any"
                                {...register("quantity", { required: true, valueAsNumber: true, min: 0.01 })}
                                placeholder="0"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Reason (Optional)</label>
                            <input
                                {...register("reason")}
                                placeholder="e.g. Regular restock"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 mt-auto">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    form="transfer-form"
                    disabled={isSubmitting || maxAvailable <= 0}
                    className="px-4 py-2 flex items-center gap-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Transferring...' : 'Transfer Stock'}
                </button>
            </div>
        </div>
    );
}
