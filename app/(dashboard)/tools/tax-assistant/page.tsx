'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Landmark, Sparkles, Send, Loader2, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

function MetricCard({ title, val, subtext, icon, positive }: { title: string, val: React.ReactNode, subtext: string, icon: React.ReactNode, positive?: boolean }) {
  return (
    <div className="rounded-2xl bg-[#121c17] border border-[#1a231f] p-6 shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#00ea77]/30 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</h3>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-[#00ea77]/10 group-hover:border-[#00ea77]/20 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <div className={`text-3xl font-bold tracking-tight ${positive ? 'text-[#00ea77]' : 'text-white'}`}>{val}</div>
        <p className="text-xs text-slate-500 mt-2 font-medium">{subtext}</p>
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Landmark className="w-8 h-8 text-[#00ea77]" />
            AI Tax Assistant
          </h1>
          <p className="text-sm text-slate-400 mt-1">Smart GST analysis and automated liability calculations</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard 
          title="Total Output GST" 
          val={<AnimatedNumber value={outputTax} format="currency" />} 
          subtext="Total Tax Collected from Sales (GSTR-1)" 
          icon={<Calculator className="w-5 h-5 text-blue-400" />} 
        />
        <MetricCard 
          title="Input Tax Credit (ITC)" 
          val={<AnimatedNumber value={inputTax} format="currency" />} 
          subtext="Total Tax Paid on Purchases" 
          icon={<ShieldCheck className="w-5 h-5 text-purple-400" />} 
        />
        <MetricCard 
          title="Estimated Net Liability" 
          val={<AnimatedNumber value={netLiability} format="currency" />} 
          subtext="Output GST minus ITC. Base payable to Gov." 
          icon={<Sparkles className="w-5 h-5 text-[#00ea77]" />} 
          positive={netLiability === 0}
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#121c17] border border-[#1a231f] rounded-2xl overflow-hidden shadow-sm shadow-[#0a0f0d]">
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar for Model */}
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-[#00ea77]/20 border border-[#00ea77]/40 flex items-center justify-center mr-3 mt-1 shrink-0 shadow-[0_0_10px_rgba(0,234,119,0.1)]">
                  <Landmark className="w-4 h-4 text-[#00ea77]" />
                </div>
              )}

              <div 
                className={`max-w-[75%] rounded-2xl px-5 py-4 text-[13px] leading-relaxed \${msg.role === 'user' ? 'bg-[#00ea77] text-black font-semibold rounded-tr-sm shadow-md' : 'bg-[#1a231f] text-slate-200 border border-white/5 rounded-tl-sm shadow-inner'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-[#00ea77]/20 border border-[#00ea77]/40 flex items-center justify-center mr-3 mt-1 shrink-0">
                  <Landmark className="w-4 h-4 text-[#00ea77]" />
               </div>
              <div className="bg-[#1a231f] border border-white/5 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-3">
                <Loader2 className="w-4 h-4 text-[#00ea77] animate-spin" />
                <span className="text-xs text-[#00ea77] font-semibold tracking-wide">Analyzing tax Ledgers...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0a0f0d] border-t border-[#1a231f]">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about GSTR-1, outstanding ITC, or your total tax liability..."
              className="w-full bg-[#121c17] text-white text-sm border border-white/5 rounded-xl pl-5 pr-14 py-4 focus:outline-none focus:border-[#00ea77]/50 focus:ring-1 focus:ring-[#00ea77]/50 placeholder:text-slate-500 font-medium transition-all shadow-inner"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 p-2.5 bg-[#00ea77] hover:bg-[#00c563] text-black rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-[#00ea77] flex items-center justify-center shadow-lg"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-3 text-center">
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
              Powered by KhataX Tax Intelligence Model. Always consult a CA before filing returns.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
