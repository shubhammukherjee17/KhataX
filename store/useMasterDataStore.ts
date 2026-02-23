import { create } from 'zustand';
import { Party, Item } from '@/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';

interface MasterDataState {
  parties: Party[];
  items: Item[];
  isLoading: boolean;
  businessId: string | null;
  
  // Actions
  setBusinessId: (id: string | null) => void;
  fetchData: () => Promise<void>;
  
  addParty: (party: Omit<Party, 'id' | 'currentBalance'>) => Promise<string>;
  updateParty: (id: string, updates: Partial<Party>) => Promise<void>;
  deleteParty: (id: string) => Promise<void>;
  
  addItem: (item: Omit<Item, 'id' | 'currentStock'>) => Promise<string>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  parties: [],
  items: [],
  isLoading: false,
  businessId: null,

  setBusinessId: (id) => {
    set({ businessId: id });
    if (id) {
      get().fetchData();
    } else {
      set({ parties: [], items: [] });
    }
  },

  fetchData: async () => {
    const { businessId } = get();
    if (!businessId) return;

    set({ isLoading: true });
    try {
      const [partiesData, itemsData] = await Promise.all([
        getCollection<Party>(`businesses/${businessId}/parties`),
        getCollection<Item>(`businesses/${businessId}/items`)
      ]);
      set({ parties: partiesData, items: itemsData, isLoading: false });
    } catch (error) {
      console.error("Error fetching master data:", error);
      set({ isLoading: false });
    }
  },

  addParty: async (partyData) => {
    const { businessId, parties } = get();
    if (!businessId) throw new Error("No business selected");
    
    // Add computed balance same as opening for new party
    const newPartyData = { ...partyData, currentBalance: partyData.openingBalance };
    const docId = await addDocument(`businesses/${businessId}/parties`, newPartyData);
    
    const newParty = { id: docId, ...newPartyData } as Party;
    set({ parties: [...parties, newParty] });
    return docId;
  },

  updateParty: async (id, updates) => {
    const { businessId, parties } = get();
    if (!businessId) throw new Error("No business selected");

    await updateDocument(`businesses/${businessId}/parties`, id, updates);
    
    set({
      parties: parties.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  },

  deleteParty: async (id) => {
    const { businessId, parties } = get();
    if (!businessId) throw new Error("No business selected");

    await deleteDocument(`businesses/${businessId}/parties`, id);
    
    set({
      parties: parties.filter(p => p.id !== id)
    });
  },

  addItem: async (itemData) => {
    const { businessId, items } = get();
    if (!businessId) throw new Error("No business selected");
    
    // Initial stock
    const newItemData = { ...itemData, currentStock: itemData.openingStock };
    const docId = await addDocument(`businesses/${businessId}/items`, newItemData);
    
    const newItem = { id: docId, ...newItemData } as Item;
    set({ items: [...items, newItem] });
    return docId;
  },

  updateItem: async (id, updates) => {
    const { businessId, items } = get();
    if (!businessId) throw new Error("No business selected");

    await updateDocument(`businesses/${businessId}/items`, id, updates);
    
    set({
      items: items.map(i => i.id === id ? { ...i, ...updates } : i)
    });
  },

  deleteItem: async (id) => {
    const { businessId, items } = get();
    if (!businessId) throw new Error("No business selected");

    await deleteDocument(`businesses/${businessId}/items`, id);
    
    set({
      items: items.filter(i => i.id !== id)
    });
  }
}));
