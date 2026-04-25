'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Landmark, Sparkles, Send, Loader2, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';
import NumberFlow from '@number-flow/react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

function MetricCard({ title, val, subtext, icon, positive }: { title: string, val: React.ReactNode, subtext: string, icon: React.ReactNode, positive?: boolean }) {
  return (
    <div className="rounded-2xl bg-[#0A0A0A] border border-white/[0.04] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:bg-white/[0.02] transition-all group">
      <div className="flex items-center justify-between mb-4 border-b border-white/[0.04] pb-4">
        <h3 className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-zinc-500">{title}</h3>
        <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04] group-hover:bg-brand-primary/10 group-hover:border-brand-primary/20 transition-colors shadow-sm">
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-4xl font-heading font-semibold tracking-tight ${positive ? 'text-brand-primary' : 'text-white'}`}>{val}</div>
        <p className="text-xs text-zinc-500 mt-3 font-medium">{subtext}</p>
      </div>
    </div>
  );
}

export default function TaxAssistantPage() {
  const { profile } = useAuth();
  const { parties, items } = useMasterDataStore();
  const { transactions, businessId } = useTransactionStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model', 
    parts: [{ text: 'Namaste! Main aapka AI Tax Assistant hoon. Mujhe aapke sales aur purchases ki detail mil gayi hai. Aap apna GST summary ya tax liability ke baare mein sawaal pooch sakte hain.' }]
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Calculate high-level GST Metrics
  const { outputTax, inputTax, netLiability } = useMemo(() => {
    let salesGST = 0;
    let purchaseGST = 0;

    transactions.forEach(tx => {
      if (tx.type === 'sale_invoice') {
        salesGST += (tx.taxAmountTotal || 0);
      } else if (tx.type === 'purchase_invoice') {
        purchaseGST += (tx.taxAmountTotal || 0);
      }
    });

    return {
      outputTax: salesGST,
      inputTax: purchaseGST,
      netLiability: Math.max(0, salesGST - purchaseGST)
    };
  }, [transactions]);

  // Scroll logic
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages: ChatMessage[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const context = {
        totalSalesTaxCollected: outputTax,
        totalPurchaseTaxPaid: inputTax,
        netTaxLiability: netLiability,
        totalSalesCount: transactions.filter(t => t.type === 'sale_invoice').length,
        totalPurchasesCount: transactions.filter(t => t.type === 'purchase_invoice').length,
        itemsWithTaxSlabs: items.map(i => ({ name: i.name, rate: i.taxRate }))
      };

      const historyToSend = newMessages.slice(0, -1);

      const response = await fetch('/api/tax-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          history: historyToSend,
          businessId
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: data.reply }] }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Opps, tax calculation mein error aayi. Please try again." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <Landmark className="w-6 h-6 text-brand-primary" />
            </div>
            AI Tax Assistant
          </h1>
          <p className="text-[12px] font-mono tracking-widest uppercase font-semibold text-zinc-500 mt-2">Smart GST analysis and automated liability calculations</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Total Output GST" 
          val={<div className="flex items-center"><span className="text-zinc-500 text-2xl mr-1 font-semibold">₹</span><NumberFlow value={outputTax} format={{ maximumFractionDigits: 2 }} /></div>} 
          subtext="Total Tax Collected from Sales (GSTR-1)" 
          icon={<Calculator className="w-4 h-4 text-blue-500" />} 
        />
        <MetricCard 
          title="Input Tax Credit (ITC)" 
          val={<div className="flex items-center"><span className="text-zinc-500 text-2xl mr-1 font-semibold">₹</span><NumberFlow value={inputTax} format={{ maximumFractionDigits: 2 }} /></div>}  
          subtext="Total Tax Paid on Purchases" 
          icon={<ShieldCheck className="w-4 h-4 text-purple-500" />} 
        />
        <MetricCard 
          title="Estimated Net Liability" 
          val={<div className="flex items-center"><span className={`${netLiability === 0 ? 'text-brand-primary/50' : 'text-zinc-500'} text-2xl mr-1 font-semibold`}>₹</span><NumberFlow value={netLiability} format={{ maximumFractionDigits: 2 }} /></div>}  
          subtext="Output GST minus ITC. Base payable to Gov." 
          icon={<Sparkles className="w-4 h-4 text-brand-primary" />} 
          positive={netLiability === 0}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0A0A0A] border border-white/[0.04] rounded-2xl overflow-hidden shadow-sm">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar for Model */}
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                </div>
              )}

              <div 
                className={`max-w-[75%] px-5 py-4 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-white/[0.04] text-white border border-white/[0.04] font-medium rounded-2xl rounded-tr-sm shadow-sm' : 'bg-transparent border border-white/[0.04] text-zinc-300 font-medium rounded-2xl rounded-tl-sm shadow-sm'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
               </div>
              <div className="bg-transparent border border-white/[0.04] rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-brand-primary animate-spin" />
                <span className="text-xs text-brand-primary font-semibold tracking-wide">Analyzing tax Ledgers...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-transparent border-t border-white/[0.04]">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GSTR-1, outstanding ITC, or your total tax liability..."
              className="w-full bg-[#0A0A0A] text-white text-sm border border-white/[0.04] rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:border-brand-primary/30 focus:ring-1 focus:ring-brand-primary/30 placeholder:text-zinc-600 font-medium transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 p-2.5 bg-brand-primary hover:bg-brand-primary/90 text-black rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-brand-primary flex items-center justify-center shadow-lg active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[9px] text-zinc-600 font-mono font-semibold uppercase tracking-[0.2em]">
              Powered by GononaX Tax Intelligence Model. Always consult a CA before filing returns.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
