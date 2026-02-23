import { create } from 'zustand';
import { Transaction } from '@/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  businessId: string | null;
  
  setBusinessId: (id: string | null) => void;
  fetchTransactions: () => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<string>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  businessId: null,

  setBusinessId: (id) => {
    set({ businessId: id });
    if (id) {
      get().fetchTransactions();
    } else {
      set({ transactions: [] });
    }
  },

  fetchTransactions: async () => {
    const { businessId } = get();
    if (!businessId) return;

    set({ isLoading: true });
    try {
      // Sorting desc by date by getting them all and sorting locally if index is missing, 
      // or rely on firestore orderBy if indexes are correct
      const data = await getCollection<Transaction>(`businesses/${businessId}/transactions`);
      data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      set({ transactions: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching transactions:", error);
      set({ isLoading: false });
    }
  },

  addTransaction: async (data) => {
    const { businessId, transactions } = get();
    if (!businessId) throw new Error("No business selected");
    
    // Determine status from amount paid
    let status: Transaction['status'] = 'draft';
    if (data.amountPaid >= data.grandTotal && data.grandTotal > 0) status = 'paid';
    else if (data.amountPaid > 0) status = 'partially_paid';
    else status = 'unpaid';

    const newTxData = { ...data, status };
    const docId = await addDocument(`businesses/${businessId}/transactions`, newTxData);
    
    const newTx = { id: docId, ...newTxData } as Transaction;
    set({ transactions: [newTx, ...transactions] });
    return docId;
  },

  updateTransaction: async (id, updates) => {
    const { businessId, transactions } = get();
    if (!businessId) throw new Error("No business selected");

    await updateDocument(`businesses/${businessId}/transactions`, id, updates);
    
    set({
      transactions: transactions.map(t => t.id === id ? { ...t, ...updates } : t)
    });
  },

  deleteTransaction: async (id) => {
    const { businessId, transactions } = get();
    if (!businessId) throw new Error("No business selected");

    await deleteDocument(`businesses/${businessId}/transactions`, id);
    
    set({
      transactions: transactions.filter(t => t.id !== id)
    });
  }
}));
