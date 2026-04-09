'use client';

import { useState } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Party } from '@/types';
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Parties</h1>
          <p className="text-sm font-semibold text-slate-400">Manage your customers and vendors.</p>
        </div>
        <button
          onClick={() => router.push('/parties/new')}
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
            <button onClick={() => router.push('/parties/new')} className="text-[#00ea77] font-bold hover:text-[#00c563] mt-2 inline-block">
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
                        ₹{Math.abs(party.currentBalance).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5 block">
                        {party.currentBalance > 0 ? 'To Pay' : party.currentBalance < 0 ? 'To Receive' : 'Settled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => router.push(`/parties/${party.id}`)} className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10">
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
    </div>
  );
}
