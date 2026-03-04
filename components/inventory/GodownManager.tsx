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
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">Godowns</h3>
                        <p className="text-sm text-slate-500">{godowns.length} total warehouses</p>
                    </div>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Godown
                </button>
            </div>

            {godowns.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 text-center">
                    <p className="text-slate-500 mb-2">No godowns configured yet.</p>
                    <p className="text-xs text-slate-400">All stock currently belongs to a default pool.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {godowns.map(godown => (
                        <div key={godown.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden">
                            {godown.isDefault && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
                                    DEFAULT
                                </div>
                            )}
                            <h4 className="font-semibold text-slate-800 pr-12">{godown.name}</h4>
                            <p className="text-sm text-slate-500 mt-1">{godown.location || 'No location specified'}</p>

                            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                                <button
                                    onClick={() => openEditModal(godown)}
                                    className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(godown.id, godown.name)}
                                    className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                                    disabled={godown.isDefault} // Usually shouldn't delete the default easily
                                    title={godown.isDefault ? "Cannot delete default godown directly" : ""}
                                >
                                    <Trash2 className={`w-4 h-4 ${godown.isDefault ? 'opacity-50' : ''}`} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-semibold">{editingGodown ? 'Edit Godown' : 'Add New Godown'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="godown-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 text-red-600">Godown Name *</label>
                                    <input
                                        {...register("name", { required: true })}
                                        placeholder="e.g. Main Hub, Sector 12 Warehouse"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Location Details</label>
                                    <input
                                        {...register("location")}
                                        placeholder="Address or area details"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id="isDefault"
                                        {...register("isDefault")}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="isDefault" className="text-sm font-medium text-slate-700">
                                        Set as Default Godown
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="godown-form"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
