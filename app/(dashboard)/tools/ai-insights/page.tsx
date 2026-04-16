'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import NumberFlow from '@number-flow/react';

interface AIInsights {
  breakdown: Record<string, number>;
  patterns: string[];
  observations: string[];
  recommendations: string[];
  health_score: number;
  summary: string;
}

export default function AIInsightsPage() {
  const { businessId } = useAuth();
  const { transactions } = useTransactionStore();
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    if (!businessId) return;
    if (transactions.length === 0) {
      setError("Not enough transactions to analyze.");
      return;
    }

    setIsLoading(true);
    setError('');

    // Only send the last 50 transactions to avoid payload size limits
    const recentTx = transactions.slice(0, 50).map(t => ({
      type: t.type,
      amount: t.grandTotal,
      partyName: t.partyName,
      date: t.date,
      status: t.status,
      tags: t.tags || [],
      category: t.category || '',
      mood: t.mood || ''
    }));

    try {
      const res = await fetch('/api/ai/financial-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, transactions: recentTx }),
      });

      if (!res.ok) throw new Error("Failed to fetch insights");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setInsights(data.insights);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (businessId && transactions.length > 0 && !insights && !isLoading && !error) {
      generateInsights();
    }
  }, [businessId, transactions]);

  const COLORS = ['#00FFA3', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const breakdownData = insights?.breakdown 
    ? Object.entries(insights.breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20">
              <Brain className="w-6 h-6 text-brand-primary" />
            </div>
            AI Financial Insights
          </h1>
          <p className="text-[12px] font-mono tracking-widest uppercase font-semibold text-zinc-500 mt-2">Deep behavioral analysis of your business health</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#0A0A0A] border border-white/[0.04] hover:bg-white/[0.02] text-white px-4 py-2 rounded-xl transition-all shadow-sm font-semibold text-sm active:scale-[0.98]"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : 'text-zinc-400'}`} />
          {isLoading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-semibold text-sm">{error}</p>
        </div>
      ) : !insights ? (
        <div className="bg-[#0A0A0A] border border-white/[0.04] rounded-2xl p-12 text-center shadow-sm">
          <Brain className="w-12 h-12 text-brand-primary/30 mx-auto mb-4 animate-pulse" />
          <p className="text-zinc-500 text-[11px] font-mono uppercase tracking-[0.2em] font-semibold">Analyzing transaction patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className="col-span-1 lg:col-span-3 bg-[#0A0A0A] border border-white/[0.04] shadow-sm rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>
            
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={insights.health_score > 75 ? "#00FFA3" : insights.health_score > 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeDasharray={`${insights.health_score * 2.827} 282.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-white"><NumberFlow value={insights.health_score} /></span>
              </div>
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-heading font-semibold text-white mb-2">Financial Health Score</h2>
              <p className="text-zinc-400 leading-relaxed font-medium">{insights.summary}</p>
            </div>
          </div>

          {/* Breakdown Donut */}
          <div className="bg-[#0A0A0A] border border-white/[0.04] shadow-sm rounded-2xl p-6 flex flex-col">
            <h3 className="font-semibold text-white mb-4 flex items-center border-b border-white/[0.04] pb-3 text-sm">
              Spending Breakdown
            </h3>
            <div className="flex-1 min-h-[250px] relative">
              {breakdownData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={breakdownData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                       {breakdownData.map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', borderColor: 'rgba(255,255,255,0.04)', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#fff', fontWeight: 600 }} />
                   </PieChart>
                 </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono tracking-widest uppercase text-zinc-500 font-semibold">No data available</div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {breakdownData.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full shadow-sm" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span className="text-zinc-300 font-medium capitalize">{item.name}</span>
                  </span>
                  <span className="font-semibold text-white"><NumberFlow value={item.value} format={{ maximumFractionDigits: 0 }} /></span>
                </div>
              ))}
            </div>
          </div>

          {/* Patterns & Observations */}
          <div className="bg-[#0A0A0A] border border-white/[0.04] shadow-sm rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4 text-sm border-b border-white/[0.04] pb-3">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Behavioral Patterns
              </h3>
              <ul className="space-y-4">
                {insights.patterns.map((p, i) => (
                  <li key={i} className="text-sm border-l-2 border-blue-500/30 pl-4 py-1 text-zinc-300 font-medium">{p}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-white/[0.04] pt-6">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4 text-sm border-b border-white/[0.04] pb-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" /> Key Observations
              </h3>
              <ul className="space-y-4">
                {insights.observations.map((o, i) => (
                  <li key={i} className="text-sm border-l-2 border-orange-500/30 pl-4 py-1 text-zinc-300 font-medium">{o}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#0A0A0A] border border-white/[0.04] shadow-sm rounded-2xl p-6">
            <h3 className="font-semibold text-white flex items-center gap-2 mb-4 text-sm border-b border-white/[0.04] pb-3">
              <CheckCircle2 className="w-4 h-4 text-brand-primary" /> Smart Recommendations
            </h3>
            <div className="space-y-3 mt-4">
              {insights.recommendations.map((r, i) => (
                <div key={i} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04] hover:bg-white/[0.04] transition-colors shadow-sm">
                  <p className="text-sm text-zinc-300 font-medium leading-relaxed">{r}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
