import { create } from 'zustand';
import { Party, Item, Godown, StockTransfer } from '@/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';

interface MasterDataState {
  parties: Party[];
  items: Item[];
  godowns: Godown[];
  stockTransfers: StockTransfer[];
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

  adjustStock: (itemId: string, type: 'add' | 'reduce', quantity: number, reason: string, notes?: string, godownId?: string) => Promise<void>;

  addGodown: (godown: Omit<Godown, 'id'>) => Promise<string>;
  updateGodown: (id: string, updates: Partial<Godown>) => Promise<void>;
  deleteGodown: (id: string) => Promise<void>;

  transferStock: (transfer: Omit<StockTransfer, 'id' | 'date'>) => Promise<void>;
}

export const useMasterDataStore = create<MasterDataState>((set, get) => ({
  parties: [],
  items: [],
  godowns: [],
  stockTransfers: [],
  isLoading: false,
  businessId: null,

  setBusinessId: (id) => {
    set({ businessId: id });
    if (id) {
      get().fetchData();
    } else {
      set({ parties: [], items: [], godowns: [], stockTransfers: [] });
    }
  },

  fetchData: async () => {
    const { businessId } = get();
    if (!businessId) return;

    set({ isLoading: true });
    try {
      const [partiesData, itemsData, godownsData, transfersData] = await Promise.all([
        getCollection<Party>(`businesses/${businessId}/parties`),
        getCollection<Item>(`businesses/${businessId}/items`),
        getCollection<Godown>(`businesses/${businessId}/godowns`),
        getCollection<StockTransfer>(`businesses/${businessId}/stock_transfers`)
      ]);
      set({
        parties: partiesData,
        items: itemsData,
        godowns: godownsData,
        stockTransfers: transfersData,
        isLoading: false
      });
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
  },

  adjustStock: async (itemId, type, quantity, reason, notes, godownId) => {
    const { businessId, items } = get();
    if (!businessId) throw new Error("No business selected");

    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found");

    const newStock = type === 'add' ? item.currentStock + quantity : item.currentStock - quantity;

    // Manage stock by godown if a godownId is provided
    const newStockByGodown = [...(item.stockByGodown || [])];
    if (godownId) {
      const existingGodownStockIndex = newStockByGodown.findIndex(s => s.godownId === godownId);
      if (existingGodownStockIndex >= 0) {
        const currentGodownStock = newStockByGodown[existingGodownStockIndex].quantity;
        newStockByGodown[existingGodownStockIndex].quantity = type === 'add' ? currentGodownStock + quantity : currentGodownStock - quantity;
      } else {
        newStockByGodown.push({ godownId, quantity: type === 'add' ? quantity : -quantity });
      }
    }

    // 1. Update the item stock
    await updateDocument(`businesses/${businessId}/items`, itemId, {
      currentStock: newStock,
      stockByGodown: newStockByGodown
    });

    // 2. Add the adjustment record
    const adjRecord = {
      date: new Date().toISOString(),
      itemId,
      itemName: item.name,
      type,
      quantity,
      reason,
      notes: notes || '',
      godownId: godownId || null
    };
    await addDocument(`businesses/${businessId}/stock_adjustments`, adjRecord);

    // 3. Update local state
    set({
      items: items.map(i => i.id === itemId ? { ...i, currentStock: newStock, stockByGodown: newStockByGodown } : i)
    });
  },

  addGodown: async (godownData) => {
    const { businessId, godowns } = get();
    if (!businessId) throw new Error("No business selected");

    // If it's the first godown, or marked as default, make sure we only have one default
    const isDefault = godownData.isDefault || godowns.length === 0;

    if (isDefault && godowns.length > 0) {
      // Find current default and unset it (requires iterating, simplest approach for MVP is just UI enforcement, but we can do a quick map)
      const currentDefault = godowns.find(g => g.isDefault);
      if (currentDefault) {
        await updateDocument(`businesses/${businessId}/godowns`, currentDefault.id, { isDefault: false });
      }
    }

    const docId = await addDocument(`businesses/${businessId}/godowns`, { ...godownData, isDefault });
    const newGodown = { id: docId, ...godownData, isDefault } as Godown;

    // Refresh to get clean state if requested default changed things
    if (isDefault && godowns.length > 0) {
      get().fetchData();
    } else {
      set({ godowns: [...godowns, newGodown] });
    }

    return docId;
  },

  updateGodown: async (id, updates) => {
    const { businessId, godowns } = get();
    if (!businessId) throw new Error("No business selected");

    if (updates.isDefault) {
      const currentDefault = godowns.find(g => g.isDefault && g.id !== id);
      if (currentDefault) {
        await updateDocument(`businesses/${businessId}/godowns`, currentDefault.id, { isDefault: false });
      }
    }

    await updateDocument(`businesses/${businessId}/godowns`, id, updates);
    get().fetchData(); // Simplest to refetch to ensure default states sync
  },

  deleteGodown: async (id) => {
    const { businessId, godowns } = get();
    if (!businessId) throw new Error("No business selected");

    await deleteDocument(`businesses/${businessId}/godowns`, id);
    set({ godowns: godowns.filter(g => g.id !== id) });
  },

  transferStock: async (transfer) => {
    const { businessId, items, stockTransfers } = get();
    if (!businessId) throw new Error("No business selected");

    const item = items.find(i => i.id === transfer.itemId);
    if (!item) throw new Error("Item not found");

    const stockByGodown = [...(item.stockByGodown || [])];

    // Decrease from source
    const fromIndex = stockByGodown.findIndex(s => s.godownId === transfer.fromGodownId);
    if (fromIndex >= 0) {
      stockByGodown[fromIndex].quantity -= transfer.quantity;
    } else {
      throw new Error("Source godown does not have stock");
    }

    // Increase in destination
    const toIndex = stockByGodown.findIndex(s => s.godownId === transfer.toGodownId);
    if (toIndex >= 0) {
      stockByGodown[toIndex].quantity += transfer.quantity;
    } else {
      stockByGodown.push({ godownId: transfer.toGodownId, quantity: transfer.quantity });
    }

    // 1. Update item stock distribution
    await updateDocument(`businesses/${businessId}/items`, transfer.itemId, { stockByGodown });

    // 2. Log transfer
    const txRecord = {
      ...transfer,
      date: new Date().toISOString(),
    };
    const docId = await addDocument(`businesses/${businessId}/stock_transfers`, txRecord);

    // 3. Update local state
    set({
      items: items.map(i => i.id === transfer.itemId ? { ...i, stockByGodown } : i),
      stockTransfers: [{ id: docId, ...txRecord } as StockTransfer, ...stockTransfers]
    });
  }
}));
