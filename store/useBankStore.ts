import { create } from 'zustand';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';

export interface BankAccount {
  id: string;
  name: string;
  type: 'bank' | 'cash';
  accountNumber?: string;
  ifscCode?: string;
  openingBalance: number;
  currentBalance: number;
}

interface BankState {
  accounts: BankAccount[];
  isLoading: boolean;
  businessId: string | null;
  
  setBusinessId: (id: string | null) => void;
  fetchAccounts: () => Promise<void>;
  
  addAccount: (account: Omit<BankAccount, 'id' | 'currentBalance'>) => Promise<string>;
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useBankStore = create<BankState>((set, get) => ({
  accounts: [],
  isLoading: false,
  businessId: null,

  setBusinessId: (id) => {
    set({ businessId: id });
    if (id) {
      get().fetchAccounts();
    } else {
      set({ accounts: [] });
    }
  },

  fetchAccounts: async () => {
    const { businessId } = get();
    if (!businessId) return;

    set({ isLoading: true });
    try {
      const data = await getCollection<BankAccount>(`businesses/${businessId}/bank_accounts`);
      set({ accounts: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
      set({ isLoading: false });
    }
  },

  addAccount: async (data) => {
    const { businessId, accounts } = get();
    if (!businessId) throw new Error("No business selected");
    
    const newData = { ...data, currentBalance: data.openingBalance };
    const docId = await addDocument(`businesses/${businessId}/bank_accounts`, newData);
    
    const newAcct = { id: docId, ...newData } as BankAccount;
    set({ accounts: [...accounts, newAcct] });
    return docId;
  },

  updateAccount: async (id, updates) => {
    const { businessId, accounts } = get();
    if (!businessId) throw new Error("No business selected");

    await updateDocument(`businesses/${businessId}/bank_accounts`, id, updates);
    
    set({
      accounts: accounts.map(a => a.id === id ? { ...a, ...updates } : a)
    });
  },

  deleteAccount: async (id) => {
    const { businessId, accounts } = get();
    if (!businessId) throw new Error("No business selected");

    await deleteDocument(`businesses/${businessId}/bank_accounts`, id);
    
    set({
      accounts: accounts.filter(a => a.id !== id)
    });
  }
}));
