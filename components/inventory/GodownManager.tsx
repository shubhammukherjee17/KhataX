'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { Godown } from '@/types';
import { Plus, Edit, Trash2, X, Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';

export function GodownManager() {
    const { godowns, isLoading, addGodown, updateGodown, deleteGodown } = useMasterDataStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGodown, setEditingGodown] = useState<Godown | null>(null);

    const { register, handleSubmit, reset } = useForm<Omit<Godown, 'id'>>();

    const openAddModal = () => {
        setEditingGodown(null);
        reset({
            name: '',
            location: '',
            isDefault: godowns.length === 0
        });
        setIsModalOpen(true);
    };

    const openEditModal = (godown: Godown) => {
        setEditingGodown(godown);
        reset(godown);
        setIsModalOpen(true);
    };

    const onSubmit = async (data: Omit<Godown, 'id'>) => {
        try {
            if (editingGodown) {
                await updateGodown(editingGodown.id, data);
            } else {
                await addGodown(data);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving godown:", error);
            alert("Failed to save godown.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to delete godown "${name}"?`)) {
            await deleteGodown(id);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-slate-500">Loading godowns...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#111] p-5 rounded-2xl border border-white/10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 text-[#00ea77] rounded-xl">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-white">Godowns</h3>
                        <p className="text-sm font-semibold text-slate-400">{godowns.length} total warehouses</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-bold border border-white/10"
                >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Godown
                </button>
            </div>

            {godowns.length === 0 ? (
                <div className="bg-[#111] border border-white/10 border-dashed rounded-2xl p-10 text-center">
                    <p className="text-slate-400 font-medium mb-2">No godowns configured yet.</p>
                    <p className="text-xs font-bold tracking-wider text-slate-500 uppercase">All stock currently belongs to a default pool.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {godowns.map(godown => (
                        <div key={godown.id} className="bg-[#111] p-5 rounded-2xl border border-white/10 shadow-sm relative group overflow-hidden hover:border-[#00ea77]/30 transition-colors">
                            {godown.isDefault && (
                                <div className="absolute top-0 right-0 bg-[#00ea77] text-black text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                    DEFAULT
                                </div>
                            )}
                            <h4 className="font-bold text-white pr-16 text-lg">{godown.name}</h4>
                            <p className="text-sm font-semibold text-slate-400 mt-1">{godown.location || 'No location specified'}</p>

                            <div className="mt-5 flex justify-end gap-2 border-t border-white/5 pt-4">
                                <button
                                    onClick={() => openEditModal(godown)}
                                    className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(godown.id, godown.name)}
                                    className={`p-2 transition-colors rounded-lg ${godown.isDefault ? 'text-slate-600 cursor-not-allowed' : 'text-slate-500 hover:text-red-500 hover:bg-red-500/10'}`}
                                    disabled={godown.isDefault} // Usually shouldn't delete the default easily
                                    title={godown.isDefault ? "Cannot delete default godown directly" : ""}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
                            <h2 className="text-lg font-bold text-white">{editingGodown ? 'Edit Godown' : 'Add New Godown'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="godown-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Godown Name *</label>
                                    <input
                                        {...register("name", { required: true })}
                                        placeholder="e.g. Main Hub, Sector 12 Warehouse"
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Location Details</label>
                                    <input
                                        {...register("location")}
                                        placeholder="Address or area details"
                                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <label className="relative flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register("isDefault")}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-[#0a0a0a] border border-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00ea77] peer-checked:border-[#00ea77]"></div>
                                    </label>
                                    <span className="text-sm font-bold text-slate-300">
                                        Set as Default Godown
                                    </span>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-5 border-t border-white/5 bg-[#0a0a0a] flex justify-end gap-3 rounded-b-2xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2.5 text-sm font-bold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="godown-form"
                                className="px-6 py-2.5 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
                            >
                                Save Godown
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
