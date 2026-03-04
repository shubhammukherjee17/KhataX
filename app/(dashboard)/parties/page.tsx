'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { Party } from '@/types';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function PartiesPage() {
  const { parties, isLoading, addParty, updateParty, deleteParty } = useMasterDataStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset } = useForm<Omit<Party, 'id' | 'currentBalance'>>();

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const openAddModal = () => {
    setEditingParty(null);
    reset({
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
    });
    setIsModalOpen(true);
  };

  const openEditModal = (party: Party) => {
    setEditingParty(party);
    reset(party);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<Party, 'id' | 'currentBalance'>) => {
    try {
      if (editingParty) {
        await updateParty(editingParty.id, data);
      } else {
        await addParty(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving party:", error);
      alert("Failed to save party.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteParty(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Parties</h1>
          <p className="text-sm font-semibold text-slate-400">Manage your customers and vendors.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#00ea77] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Add Party
        </button>
      </div>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-[#0a0a0a] border border-white/5 rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 font-medium"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading parties...</div>
        ) : filteredParties.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <p className="font-medium">No parties found.</p>
            <button onClick={openAddModal} className="text-[#00ea77] font-bold hover:text-[#00c563] mt-2 inline-block">
              Add your first party
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Party Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredParties.map((party) => (
                  <tr key={party.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 text-white font-bold text-sm">
                      {party.name}
                      {party.gstin && <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-1">GST: {party.gstin}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-bold ${party.type === 'customer' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 'bg-orange-500/10 text-orange-500'}`}>
                        {party.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      <div className="font-bold">{party.phone}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{party.email}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-bold text-base ${party.currentBalance > 0 ? 'text-[#00ea77]' : party.currentBalance < 0 ? 'text-red-500' : 'text-slate-400'}`}>
                        ₹{Math.abs(party.currentBalance).toFixed(2)}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5 block">
                        {party.currentBalance > 0 ? 'To Pay' : party.currentBalance < 0 ? 'To Receive' : 'Settled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(party)} className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(party.id, party.name)} className="text-slate-500 hover:text-red-500 p-2 ml-1 transition-colors rounded-lg hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-[#0a0a0a]">
              <h2 className="text-lg font-bold text-white">{editingParty ? 'Edit Party' : 'Add New Party'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors bg-white/5 p-1.5 rounded-lg hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="party-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Party Type *</label>
                    <select
                      {...register("type", { required: true })}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
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
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">GSTIN</label>
                    <input
                      {...register("gstin")}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Phone Number *</label>
                    <input
                      {...register("phone", { required: true })}
                      placeholder="10-digit mobile"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="email@example.com"
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
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
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
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
                        className="w-full pl-10 pr-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Payment Terms</label>
                    <select
                      {...register("creditDays", { valueAsNumber: true })}
                      className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium"
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

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <h3 className="font-bold text-white text-sm">Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Billing Address</label>
                      <textarea
                        {...register("billingAddress")}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Shipping Address</label>
                      <textarea
                        {...register("shippingAddress")}
                        rows={3}
                        className="w-full px-4 py-3 bg-[#0a0a0a] border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00ea77]/50 focus:border-[#00ea77]/50 text-white font-medium placeholder:text-slate-600 resize-none"
                      />
                    </div>
                  </div>
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
                form="party-form"
                className="px-6 py-2.5 text-sm font-bold text-black bg-[#00ea77] rounded-xl hover:bg-[#00c563] transition-colors shadow-[0_0_15px_rgba(0,234,119,0.2)]"
              >
                Save Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
