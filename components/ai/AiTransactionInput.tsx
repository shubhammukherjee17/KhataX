'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';

export function AiTransactionInput() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { businessId } = useAuth();
  const { addTransaction } = useTransactionStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !businessId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/extract-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, businessId }),
      });

      if (!res.ok) throw new Error('Failed to parse transaction');
      
      const { result } = await res.json();
      
      // Determine Party Name from people or merchant fallback
      let partyName = "Unknown";
      if (result.people && result.people.length > 0) partyName = result.people[0];
      else if (result.merchant_or_source) partyName = result.merchant_or_source;

      // Map to KhataX transaction format
      const ttype = result.type === 'expense' ? 'payment_out' : 'payment_in';
      
      await addTransaction({
        type: ttype,
        number: `AI-${Date.now()}`,
        date: new Date().toISOString(),
        partyId: `ai-party-${Date.now()}`, // Temporary ID for AI generated party
        partyName: partyName,
        items: [],
        subTotal: result.amount || 0,
        taxAmountTotal: 0,
        discountTotal: 0,
        grandTotal: result.amount || 0,
        amountPaid: result.amount || 0,
        status: 'paid',
        tags: result.tags || [],
        category: result.category || 'General',
        mood: result.mood || 'neutral',
      });
      
      setText('');
      // In a real app we might show a success toast here
    } catch (error) {
      console.error(error);
      alert("Failed to process natural language transaction.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Sparkles className="h-5 w-5 text-[#00ea77]" />
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
        className="block w-full pl-10 pr-12 py-4 bg-[#121c17] border border-[#1a231f] rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00ea77]/50 focus:border-transparent transition-all shadow-sm focus:shadow-[0_0_15px_rgba(0,234,119,0.1)] font-medium"
        placeholder="Type a transaction: 'Paid ₹500 to Swiggy for lunch via UPI'..."
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="p-2 bg-[#00ea77] hover:bg-[#00ea77]/80 text-[#0b110e] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
}
