'use client';

import { useState, useRef, useEffect } from 'react';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Sparkles, X, Send, Loader2, MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'model', 
    parts: [{ text: 'Namaste! I am your GononaX AI Assistant. How can I help you check your balances, analyze sales, or generate a payment reminder today?' }]
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  // App Data for Context
  const { parties, items } = useMasterDataStore();
  const { transactions } = useTransactionStore();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add User Message to UI instantly
    const newMessages: ChatMessage[] = [...messages, { role: 'user', parts: [{ text: userMessage }] }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build a lightweight context wrapper
      const context = {
        totalParties: parties.length,
        parties: parties.map(p => ({ name: p.name, type: p.type, currentBalance: p.currentBalance })),
        totalTransactions: transactions.length,
        recentTransactions: transactions.slice(0, 10).map(t => ({ 
           date: t.date, type: t.type, party: t.partyName, amount: t.grandTotal, status: t.status 
        })),
        inventory: items.map(i => ({ name: i.name, stock: i.currentStock, price: i.salePrice }))
      };

      // Exclude the very last user message from history because the backend attaches it with Context
      const historyToSend = newMessages.slice(0, -1);

      // We explicitly pass the businessId to ensure complete data isolation per user session 
      const businessId = useMasterDataStore.getState().businessId;

      const response = await fetch('/api/chat', {
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
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Opps, network issue or API error occurred. Please try again." }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[99999] p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'bg-[#111] text-white rotate-90 scale-0 opacity-0' : 'bg-gradient-to-r from-[#00ea77] to-[#00c563] text-black hover:scale-105 hover:shadow-[#00ea77]/20 rotate-0 scale-100 opacity-100'}`}
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-4 left-4 right-4 sm:bottom-6 sm:right-6 sm:left-auto z-[99999] w-auto sm:w-full max-w-none sm:max-w-[380px] h-[75vh] sm:h-[550px] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#0a0a0a] to-[#111] border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#00ea77]/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00ea77]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">GononaX Assistant</h3>
              <p className="text-[10px] text-[#00ea77] font-semibold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ea77] animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex \${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm \${msg.role === 'user' ? 'bg-[#00ea77] text-black font-medium rounded-tr-sm' : 'bg-[#1a1a1a] text-slate-200 border border-white/5 rounded-tl-sm'}`}
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#00ea77] animate-spin" />
                <span className="text-xs text-slate-400 font-medium tracking-wide">Analyzing data...</span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-[#111] border-t border-white/10">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about dues, insights, or bills..."
              className="w-full bg-[#1a1a1a] text-white text-sm border border-white/5 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:border-[#00ea77]/50 focus:ring-1 focus:ring-[#00ea77]/50 placeholder:text-slate-600 font-medium transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-[#00ea77] hover:bg-[#00c563] text-black rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-[#00ea77]"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
