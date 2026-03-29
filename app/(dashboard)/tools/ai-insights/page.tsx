'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionStore } from '@/store/useTransactionStore';
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

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
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (businessId && transactions.length > 0 && !insights && !isLoading && !error) {
      generateInsights();
    }
  }, [businessId, transactions]);

  const COLORS = ['#00ea77', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const breakdownData = insights?.breakdown 
    ? Object.entries(insights.breakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-[#00ea77]" />
            AI Financial Insights
          </h1>
          <p className="text-slate-400 mt-1">Deep behavioral analysis of your business health.</p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#121c17] border border-[#1a231f] hover:border-[#00ea77]/50 text-white px-4 py-2 rounded-xl transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00ea77]' : 'text-slate-400'}`} />
          {isLoading ? 'Analyzing...' : 'Refresh Insights'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      ) : !insights ? (
        <div className="bg-[#121c17] border border-[#1a231f] rounded-2xl p-12 text-center animate-pulse">
          <Brain className="w-16 h-16 text-[#00ea77]/30 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Analyzing transaction patterns...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Card */}
          <div className="col-span-1 lg:col-span-3 bg-gradient-to-r from-[#121c17] to-[#0a100d] border border-[#1a231f] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1a231f" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="45" fill="none"
                  stroke={insights.health_score > 75 ? "#00ea77" : insights.health_score > 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="10"
                  strokeDasharray={`${insights.health_score * 2.827} 282.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{insights.health_score}</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Financial Health Score</h2>
              <p className="text-slate-300 leading-relaxed">{insights.summary}</p>
            </div>
          </div>

          {/* Breakdown Donut */}
          <div className="bg-[#121c17] border border-[#1a231f] rounded-2xl p-6 flex flex-col">
            <h3 className="font-bold text-white mb-4">Spending Breakdown</h3>
            <div className="flex-1 min-h-[250px] relative">
              {breakdownData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={breakdownData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {breakdownData.map((e, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#0A0F0D', borderColor: '#1a231f' }} />
                   </PieChart>
                 </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500">No data</div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {breakdownData.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></span>
                    <span className="text-slate-400 capitalize">{item.name}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Patterns & Observations */}
          <div className="bg-[#121c17] border border-[#1a231f] rounded-2xl p-6 flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" /> Behavioral Patterns
              </h3>
              <ul className="space-y-3">
                {insights.patterns.map((p, i) => (
                  <li key={i} className="text-sm border-l-2 border-blue-500/50 pl-3 text-slate-300">{p}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-[#1a231f] pt-6">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Key Observations
              </h3>
              <ul className="space-y-3">
                {insights.observations.map((o, i) => (
                  <li key={i} className="text-sm border-l-2 border-orange-500/50 pl-3 text-slate-300">{o}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#121c17] border border-[#1a231f] rounded-2xl p-6">
            <h3 className="font-bold text-white flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#00ea77]" /> Smart Recommendations
            </h3>
            <div className="space-y-4 shadow-inner mt-4">
              {insights.recommendations.map((r, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-[#00ea77]/30 transition-colors">
                  <p className="text-sm text-slate-200">{r}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
