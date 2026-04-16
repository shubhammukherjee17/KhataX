'use client';

import { useState } from 'react';
import { Calculator, Percent, Tag, ShoppingCart, IndianRupee, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import NumberFlow from '@number-flow/react';

export default function MarginCalculatorPage() {
    const { isPremium } = useAuth();
    const [purchasePrice, setPurchasePrice] = useState(100);
    const [gstRate, setGstRate] = useState(18);
    const [expectedMargin, setExpectedMargin] = useState(15); // Percentage

    // Scheme inputs
    const [schemeGiven, setSchemeGiven] = useState(0); // quantity free
    const [schemeBase, setSchemeBase] = useState(10); // quantity paid

    if (!isPremium) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-heading font-semibold text-white mb-2">Premium Feature Locked</h2>
          <p className="text-zinc-500 font-medium max-w-md mb-8">
            The advanced Margin Calculator is available exclusively for Premium subscribers. Upgrade your plan to unlock this and other powerful tools.
          </p>
          <Link href="/#pricing" className="bg-brand-primary text-black px-8 py-3 rounded-full font-heading font-semibold hover:bg-brand-primary/90 transition-all active:scale-[0.98] shadow-sm">
            Upgrade to Professional
          </Link>
        </div>
      );
    }

    // Calculations
    const isSchemeActive = schemeGiven > 0 && schemeBase > 0;

    const costWithoutGst = purchasePrice / (1 + (gstRate / 100));
    const marginValue = costWithoutGst * (expectedMargin / 100);
    const targetBasePrice = costWithoutGst + marginValue;
    const targetSellingPrice = targetBasePrice * (1 + (gstRate / 100));

    // Scheme impact analysis
    // If you sell (schemeBase + schemeGiven) items, you only get paid for schemeBase items.
    // Effective Revenue = (targetSellingPrice * schemeBase)
    // Effective Cost = (purchasePrice * (schemeBase + schemeGiven))
    const totalRevenueWithScheme = targetSellingPrice * schemeBase;
    const totalCostWithScheme = purchasePrice * (schemeBase + schemeGiven);
    const totalProfitWithScheme = totalRevenueWithScheme - totalCostWithScheme;
    const effectiveMarginWithScheme = totalCostWithScheme > 0 ? (totalProfitWithScheme / totalCostWithScheme) * 100 : 0;

    // If they want to maintain the same expected margin even after the scheme
    // Needed Revenue = totalCostWithScheme * (1 + (expectedMargin/100))
    // Needed Selling Price = Needed Revenue / schemeBase
    const targetRevenueWithSchemeToKeepMargin = totalCostWithScheme * (1 + (expectedMargin / 100)); // margin on cost with tax? Actually margin is usually considered on base cost without tax or with tax depending on local norms.
    // Let's stick to simple: if they want 15% return on investment
    const adjustedSellingPriceWithScheme = (targetRevenueWithSchemeToKeepMargin) / schemeBase;

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-semibold text-white flex items-center gap-3"><div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20"><Calculator className="w-6 h-6 text-brand-primary"/></div> Margin & Scheme Calculator</h1>
                    <p className="text-[12px] font-mono tracking-widest uppercase font-semibold text-zinc-500 mt-2">Calculate exact pricing and understand the impact of free-item schemes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Card */}
                <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02] flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-brand-primary" />
                        <h2 className="font-semibold text-sm text-white">Cost & Margin Inputs</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">Base Pricing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase">Purchase Price (inc. GST)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold tracking-tight">₹</span>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={purchasePrice}
                                            onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary font-semibold text-white transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 relative">
                                    <label className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase">GST Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={gstRate}
                                            onChange={e => setGstRate(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-3 pr-8 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary font-semibold text-white transition-all shadow-sm"
                                        />
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase">Expected Margin (%)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={expectedMargin}
                                        onChange={e => setExpectedMargin(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-brand-primary"
                                    />
                                    <div className="w-16">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={expectedMargin}
                                                onChange={e => setExpectedMargin(parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-center bg-brand-primary/10 border border-brand-primary/20 rounded-xl font-semibold text-brand-primary shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-white/[0.04]" />

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase">Trade Scheme (Buy X Get Y Free)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase">Paid Qty (Buy)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={schemeBase}
                                        onChange={e => setSchemeBase(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary font-semibold text-white transition-all shadow-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono tracking-widest font-semibold text-zinc-400 uppercase">Free Qty (Get)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={schemeGiven}
                                        onChange={e => setSchemeGiven(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-primary font-semibold text-white transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                {/* Results Card */}
                <div className="bg-[#0A0A0A] rounded-2xl shadow-sm border border-white/[0.04] overflow-hidden flex flex-col">
                    <div className="p-8 flex-1 flex flex-col justify-center">

                        <div className="text-center mb-10">
                            <p className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase mb-2">Recommended Selling Price (inc. GST)</p>
                            <div className="flex items-center justify-center text-4xl font-heading font-semibold tracking-tight text-brand-primary">
                                <span className="text-2xl mr-1 text-brand-primary/50">₹</span><NumberFlow value={targetSellingPrice} format={{ maximumFractionDigits: 2 }} />
                            </div>
                            <p className="text-zinc-500 text-xs mt-3 font-medium">Yields exactly {expectedMargin}% margin per item.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-white/[0.04] pt-8">
                            <div>
                                <p className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase mb-1">Base Cost (No GST)</p>
                                <p className="font-semibold text-lg text-white flex items-center"><span className="text-zinc-500 text-sm mr-0.5">₹</span><NumberFlow value={costWithoutGst} format={{ maximumFractionDigits: 2 }} /></p>
                            </div>
                            <div>
                                <p className="text-[10px] font-mono tracking-[0.2em] font-semibold text-zinc-500 uppercase mb-1">Profit per Item</p>
                                <p className="font-semibold text-lg text-brand-primary flex items-center"><span className="text-brand-primary/50 text-sm mr-0.5">₹</span><NumberFlow value={marginValue} format={{ maximumFractionDigits: 2 }} /></p>
                            </div>
                        </div>

                        {isSchemeActive && (
                            <div className="mt-8 bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 relative overflow-hidden shadow-sm">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex gap-3 mb-4 items-center">
                                    <Tag className="text-blue-500 w-4 h-4" />
                                    <h3 className="font-semibold text-white text-sm">Scheme Impact Analysis</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/[0.04] pb-3">
                                        <span className="text-[11px] font-mono text-zinc-400 font-semibold uppercase tracking-widest">Effective Profit Margin</span>
                                        <span className={`font-semibold text-lg flex items-center ${effectiveMarginWithScheme < 0 ? 'text-red-500' : (effectiveMarginWithScheme < expectedMargin ? 'text-orange-400' : 'text-brand-primary')}`}>
                                            <NumberFlow value={effectiveMarginWithScheme} format={{ maximumFractionDigits: 1 }} /><span className="text-sm ml-0.5">%</span>
                                        </span>
                                    </div>

                                    {effectiveMarginWithScheme < expectedMargin && (
                                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-4 rounded-xl text-sm shadow-sm">
                                            <p className="font-semibold mb-1 border-b border-orange-500/20 pb-2 inline-block">Warning: Low Profitability</p>
                                            <p className="mt-2 leading-relaxed font-medium">
                                                Giving {schemeGiven} free item(s) drops your margin to {effectiveMarginWithScheme.toFixed(1)}%.
                                                To keep your {expectedMargin}% margin with this scheme, price the item at <strong className="text-white">₹{adjustedSellingPriceWithScheme.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>.
                                            </p>
                                        </div>
                                    )}
                                    {effectiveMarginWithScheme >= expectedMargin && effectiveMarginWithScheme > 0 && (
                                        <div className="bg-brand-primary/10 border border-brand-primary/20 text-brand-primary p-4 rounded-xl text-sm shadow-sm">
                                            <p className="font-semibold mb-1">Profitable Scheme</p>
                                            <p className="mt-1 font-medium text-brand-primary/80">You are still making target margins even with the free items.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="bg-white/[0.02] p-4 text-center border-t border-white/[0.04]">
                        <p className="text-[9px] font-semibold tracking-[0.2em] font-mono text-zinc-500 uppercase leading-relaxed">
                            *Calculations assume GST is passed equally on cost and sale. Free scheme items absorb cost without generating revenue.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
