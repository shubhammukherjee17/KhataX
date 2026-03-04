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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Parties</h1>
          <p className="text-sm text-slate-500">Manage your customers and vendors.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Party
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading parties...</div>
        ) : filteredParties.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No parties found.</p>
            <button onClick={openAddModal} className="text-blue-600 font-medium hover:underline mt-2">
              Add your first party
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Party Name</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Contact</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredParties.map((party) => (
                  <tr key={party.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {party.name}
                      {party.gstin && <span className="block text-xs font-normal text-slate-500 mt-1">GST: {party.gstin}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${party.type === 'customer' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {party.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{party.phone}</div>
                      <div className="text-xs text-slate-500">{party.email}</div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      <span className={party.currentBalance > 0 ? 'text-green-600' : party.currentBalance < 0 ? 'text-red-600' : 'text-slate-600'}>
                        ₹{Math.abs(party.currentBalance).toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-500 ml-1">
                        {party.currentBalance > 0 ? 'To Pay' : party.currentBalance < 0 ? 'To Receive' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(party)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(party.id, party.name)} className="text-red-600 hover:text-red-800 p-1 ml-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold">{editingParty ? 'Edit Party' : 'Add New Party'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="party-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Party Type *</label>
                    <select
                      {...register("type", { required: true })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Party Name *</label>
                    <input
                      {...register("name", { required: true })}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">GSTIN</label>
                    <input
                      {...register("gstin")}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 text-red-600">Phone Number *</label>
                    <input
                      {...register("phone", { required: true })}
                      placeholder="10-digit mobile"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <input
                      type="email"
                      {...register("email")}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Opening Balance</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("openingBalance", { valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500">+ve for Payable, -ve for Receivable</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Credit Limit (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                      <input
                        type="number"
                        step="0.01"
                        {...register("creditLimit", { valueAsNumber: true })}
                        placeholder="10000.00"
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Payment Terms (Days)</label>
                    <select
                      {...register("creditDays", { valueAsNumber: true })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="0">0 Days (Advance)</option>
                      <option value="7">7 Days</option>
                      <option value="15">15 Days</option>
                      <option value="30">30 Days</option>
                      <option value="45">45 Days</option>
                      <option value="60">60 Days</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-slate-800 border-b pb-2">Addresses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Billing Address</label>
                      <textarea
                        {...register("billingAddress")}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Shipping Address</label>
                      <textarea
                        {...register("shippingAddress")}
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
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
                form="party-form"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
