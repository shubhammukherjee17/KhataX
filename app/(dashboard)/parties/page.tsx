'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Party } from '@/types';
import NumberFlow from '@number-flow/react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PartiesPage() {
  const { parties, isLoading, deleteParty } = useMasterDataStore();
  const { addNotification } = useNotificationStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParties = parties.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteParty(id);
      addNotification(`Party ${name} deleted successfully`, 'success');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 w-full pt-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-white leading-tight">Parties</h1>
          <p className="text-sm font-medium text-zinc-400 mt-1">Manage your customers and vendors.</p>
        </div>
        <button
          onClick={() => router.push('/parties/new')}
          className="flex items-center gap-2 bg-brand-primary text-black font-heading font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" /> Add Party
        </button>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
        <div className="p-5 border-b border-white/[0.04] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-full text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all font-medium placeholder:text-zinc-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-zinc-500 font-medium">Loading parties...</div>
        ) : filteredParties.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <p className="font-medium mb-3">No parties found.</p>
            <button onClick={() => router.push('/parties/new')} className="text-brand-primary font-semibold hover:text-brand-primary/80 transition-colors inline-block text-sm">
              Add your first party
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead className="bg-transparent text-[9px] uppercase font-mono font-semibold tracking-[0.2em] text-zinc-500 border-b border-white/[0.04]">
                <tr>
                  <th className="px-6 py-4">Party Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredParties.map((party) => (
                  <tr key={party.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-white font-semibold text-sm">
                      {party.name}
                      {party.gstin && <span className="block text-[9px] font-mono font-semibold tracking-[0.2em] text-zinc-500 uppercase mt-1">GST: {party.gstin}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded border text-[9px] uppercase tracking-[0.2em] font-mono font-semibold ${party.type === 'customer' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-orange-500/10 border-orange-500/20 text-orange-500'}`}>
                        {party.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-300">
                      <div className="font-semibold">{party.phone}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{party.email}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold text-sm flex items-center justify-end ${party.currentBalance > 0 ? 'text-brand-primary' : party.currentBalance < 0 ? 'text-red-500' : 'text-zinc-400'}`}>
                        <span>₹</span><NumberFlow value={Math.abs(party.currentBalance)} format={{ maximumFractionDigits: 2 }} />
                      </div>
                      <span className="text-[9px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500 mt-1 block">
                        {party.currentBalance > 0 ? 'To Pay' : party.currentBalance < 0 ? 'To Receive' : 'Settled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => router.push(`/parties/${party.id}`)} className="text-zinc-500 hover:text-brand-primary p-2 transition-colors rounded-lg hover:bg-white/[0.04]">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(party.id, party.name)} className="text-zinc-500 hover:text-red-500 p-2 ml-1 transition-colors rounded-lg hover:bg-white/[0.04]">
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
    </div>
  );
}
