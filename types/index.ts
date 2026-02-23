import { Timestamp } from 'firebase/firestore';

export interface Business {
  id: string; // Document ID
  ownerId: string; // Auth User ID who created it
  name: string;
  gstin: string;
  address: string;
  phone: string;
  email: string;
  createdAt: Timestamp;
}

export interface UserProfile {
  id: string; // Auth User ID
  name: string;
  email: string;
  currentBusinessId: string;
  businesses: { businessId: string, role: 'owner' | 'admin' | 'staff' }[];
}

export interface Party {
  id: string;
  type: 'customer' | 'vendor';
  name: string;
  gstin?: string;
  phone: string;
  email: string;
  billingAddress: string;
  shippingAddress: string;
  openingBalance: number;
  currentBalance: number; // Computed locally or by triggers
}

export interface Item {
  id: string;
  type: 'product' | 'service';
  name: string;
  description: string;
  unit: string; // 'PCS', 'KG', 'LTR'
  purchasePrice: number;
  salePrice: number;
  taxRate: number; // 0, 5, 12, 18, 28
  openingStock: number;
  currentStock: number; // Computed locally or by triggers
  lowStockAlertLimit: number;
}

export interface StockAdjustment {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'add' | 'reduce';
  quantity: number;
  reason: string;
  notes: string;
}

export interface TransactionItem {
  itemId: string;
  name: string;
  quantity: number;
  rate: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface Transaction {
  id: string;
  type: 'sale_invoice' | 'purchase_invoice' | 'estimate' | 'payment_in' | 'payment_out';
  number: string;
  date: string; // ISO String 
  dueDate?: string;
  partyId: string;
  partyName: string;
  items: TransactionItem[];
  subTotal: number;
  taxAmountTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  status: 'paid' | 'unpaid' | 'partially_paid' | 'draft';
  bankAccountId?: string | null;
}
