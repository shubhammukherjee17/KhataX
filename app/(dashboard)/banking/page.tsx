'use client';

import { useState, useEffect } from 'react';
import { useBankStore } from '@/store/useBankStore';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Building2, Wallet, Edit, Trash2 } from 'lucide-react';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRouter } from 'next/navigation';

export default function BankingPage() {
  const { businessId } = useAuth();
  const { accounts, isLoading, setBusinessId, deleteAccount } = useBankStore();
  const { addNotification } = useNotificationStore();
  const router = useRouter();

  useEffect(() => {
    setBusinessId(businessId);
  }, [businessId, setBusinessId]);



  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account: ${name}?`)) {
      await deleteAccount(id);
      addNotification(`Account ${name} deleted successfully`, 'success');
    }
  };

  const totalBankBalance = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.currentBalance, 0);
  const totalCashBalance = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Banking & Cash</h1>
          <p className="text-sm font-semibold text-slate-400">Manage bank accounts, cash registers, and transaction ledgers.</p>
        </div>
        <button 
          onClick={() => router.push('/banking/new')}
          className="flex items-center gap-2 bg-[#00ea77] text-black font-bold px-4 py-2 rounded-xl hover:bg-[#00c563] transition shadow-[0_0_15px_rgba(0,234,119,0.2)]"
        >
          <Plus className="h-4 w-4 stroke-[3]" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden group hover:border-[#00ea77]/30 transition-all">
          <div className="flex items-center gap-3 mb-4 opacity-80 text-blue-400">
            <Building2 className="h-5 w-5" />
            <h3 className="text-[10px] font-bold tracking-wider uppercase">Total Bank Balance</h3>
          </div>
          <p className="text-3xl font-extrabold">₹{totalBankBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 text-white shadow-sm relative overflow-hidden group hover:border-[#00ea77]/30 transition-all">
          <div className="flex items-center gap-3 mb-4 opacity-80 text-[#00ea77]">
            <Wallet className="h-5 w-5" />
            <h3 className="text-[10px] font-bold tracking-wider uppercase">Cash in Hand</h3>
          </div>
          <p className="text-3xl font-extrabold">₹{totalCashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-[#111] rounded-2xl shadow-sm border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-[#0a0a0a]">
          <h2 className="font-bold text-white text-lg">Your Accounts</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 font-medium">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <p className="font-medium">No accounts found.</p>
            <button onClick={() => router.push('/banking/new')} className="text-[#00ea77] font-bold hover:text-[#00c563] mt-2 inline-block">
              Add your first bank account or cash register
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead className="bg-[#0a0a0a]/50 text-[10px] uppercase font-bold tracking-wider text-slate-500 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4">Account Name</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4 text-right">Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-bold text-white text-sm flex items-center gap-4">
                      {account.type === 'bank' ? (
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Building2 className="h-4 w-4" /></div>
                      ) : (
                        <div className="p-2 bg-[#00ea77]/10 text-[#00ea77] rounded-lg"><Wallet className="h-4 w-4" /></div>
                      )}
                      {account.name}
                    </td>
                    <td className="px-6 py-4">
                      {account.type === 'bank' ? (
                        <div>
                          <p className="text-slate-300 font-bold text-sm">{account.accountNumber || 'N/A'}</p>
                          <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase mt-0.5">{account.ifscCode}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Cash Register</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold text-base ${account.currentBalance < 0 ? 'text-red-500' : 'text-[#00ea77]'}`}>
                        ₹{account.currentBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => router.push(`/banking/${account.id}`)} className="text-slate-500 hover:text-[#00ea77] p-2 transition-colors rounded-lg hover:bg-[#00ea77]/10">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(account.id, account.name)} className="text-slate-500 hover:text-red-500 p-2 ml-1 transition-colors rounded-lg hover:bg-red-500/10">
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
