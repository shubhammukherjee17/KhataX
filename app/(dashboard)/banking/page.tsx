'use client';

import { useState, useEffect } from 'react';
import { useBankStore, BankAccount } from '@/store/useBankStore';
import { useAuth } from '@/hooks/useAuth';
import { Plus, Building2, Wallet, Edit, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

export default function BankingPage() {
  const { businessId } = useAuth();
  const { accounts, isLoading, setBusinessId, addAccount, updateAccount, deleteAccount } = useBankStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcct, setEditingAcct] = useState<BankAccount | null>(null);

  const { register, handleSubmit, reset } = useForm<Omit<BankAccount, 'id' | 'currentBalance'>>();

  // Initialize store
  useEffect(() => {
    setBusinessId(businessId);
  }, [businessId, setBusinessId]);

  const openAddModal = () => {
    setEditingAcct(null);
    reset({
      type: 'bank',
      name: '',
      accountNumber: '',
      ifscCode: '',
      openingBalance: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (acct: BankAccount) => {
    setEditingAcct(acct);
    reset(acct);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<BankAccount, 'id' | 'currentBalance'>) => {
    try {
      if (editingAcct) {
        await updateAccount(editingAcct.id, data);
      } else {
        await addAccount(data);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Failed to save account.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete account: ${name}?`)) {
      await deleteAccount(id);
    }
  };

  const totalBankBalance = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.currentBalance, 0);
  const totalCashBalance = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Banking & Cash</h1>
          <p className="text-sm text-slate-500">Manage bank accounts, cash registers, and transaction ledgers.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Building2 className="h-5 w-5" />
            <h3 className="font-medium">Total Bank Balance</h3>
          </div>
          <p className="text-3xl font-bold">₹{totalBankBalance.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center gap-3 mb-4 opacity-80">
            <Wallet className="h-5 w-5" />
            <h3 className="font-medium">Cash in Hand</h3>
          </div>
          <p className="text-3xl font-bold">₹{totalCashBalance.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Your Accounts</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p>No accounts found.</p>
            <button onClick={openAddModal} className="text-blue-600 font-medium hover:underline mt-2">
              Add your first bank account or cash register
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Account Name</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3 text-right">Balance</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                      {account.type === 'bank' ? (
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-md"><Building2 className="h-4 w-4" /></div>
                      ) : (
                        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md"><Wallet className="h-4 w-4" /></div>
                      )}
                      {account.name}
                    </td>
                    <td className="px-6 py-4">
                      {account.type === 'bank' ? (
                        <div>
                          <p className="text-slate-900">{account.accountNumber || 'N/A'}</p>
                          <p className="text-xs text-slate-500 uppercase">{account.ifscCode}</p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs uppercase tracking-wider">Cash Register</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-bold ${account.currentBalance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        ₹{account.currentBalance.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openEditModal(account)} className="text-blue-600 hover:text-blue-800 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(account.id, account.name)} className="text-red-600 hover:text-red-800 p-1 ml-2">
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-semibold">{editingAcct ? 'Edit Account' : 'Add New Account'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form id="acct-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 text-red-600">Account Type *</label>
                  <select 
                    {...register("type", { required: true })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank">Bank Account</option>
                    <option value="cash">Cash Register</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 text-red-600">Account Name *</label>
                  <input 
                    {...register("name", { required: true })}
                    placeholder="e.g. HDFC Current A/C"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Account Number</label>
                  <input 
                    {...register("accountNumber")}
                    placeholder="e.g. 5010023XXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-slate-500">Required only for Banks</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">IFSC Code</label>
                  <input 
                    {...register("ifscCode")}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
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
                form="acct-form"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Save Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
