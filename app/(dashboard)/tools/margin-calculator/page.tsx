'use client';

import { useState } from 'react';
import { Calculator, Percent, Tag, ShoppingCart, IndianRupee } from 'lucide-react';

export default function MarginCalculatorPage() {
    const [purchasePrice, setPurchasePrice] = useState(100);
    const [gstRate, setGstRate] = useState(18);
    const [expectedMargin, setExpectedMargin] = useState(15); // Percentage

    // Scheme inputs
    const [schemeGiven, setSchemeGiven] = useState(0); // quantity free
    const [schemeBase, setSchemeBase] = useState(10); // quantity paid

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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Margin & Scheme Calculator</h1>
                    <p className="text-sm text-slate-500">Calculate exact pricing and understand the impact of free-item schemes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                        <Calculator className="w-5 h-5 text-blue-600" />
                        <h2 className="font-semibold text-slate-900">Cost & Margin Inputs</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Base Pricing</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-slate-700">Purchase Price (inc. GST)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium tracking-tight">₹</span>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={purchasePrice}
                                            onChange={e => setPurchasePrice(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">GST Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="any"
                                            min="0"
                                            value={gstRate}
                                            onChange={e => setGstRate(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium bg-slate-50"
                                        />
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <label className="text-sm font-medium text-slate-700">Expected Margin (%)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={expectedMargin}
                                        onChange={e => setExpectedMargin(parseInt(e.target.value))}
                                        className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="w-16">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={expectedMargin}
                                                onChange={e => setExpectedMargin(parseFloat(e.target.value) || 0)}
                                                className="w-full px-2 py-1 text-center border border-slate-300 rounded-md font-bold text-blue-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <div className="space-y-4">
                            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Trade Scheme (Buy X Get Y Free)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Paid Qty (Buy)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={schemeBase}
                                        onChange={e => setSchemeBase(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Free Qty (Get)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={schemeGiven}
                                        onChange={e => setSchemeGiven(parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-[#121c17] rounded-xl shadow-xl overflow-hidden text-white flex flex-col border border-[#1a231f]">
                    <div className="p-8 flex-1 flex flex-col justify-center">

                        <div className="text-center mb-10">
                            <p className="text-slate-400 font-medium uppercase tracking-widest text-xs mb-2">Recommended Selling Price (inc. GST)</p>
                            <div className="flex items-center justify-center text-5xl font-extrabold tracking-tight text-[#00ea77]">
                                <span className="text-3xl mr-1 opacity-50">₹</span>{targetSellingPrice.toFixed(2)}
                            </div>
                            <p className="text-emerald-500/80 text-sm mt-3 font-medium">Yields exactly {expectedMargin}% margin per item.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-slate-800/50 pt-8">
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Base Cost (No GST)</p>
                                <p className="font-medium text-lg">₹{costWithoutGst.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Profit per Item</p>
                                <p className="font-bold text-lg text-emerald-400">₹{marginValue.toFixed(2)}</p>
                            </div>
                        </div>

                        {isSchemeActive && (
                            <div className="mt-8 bg-[#0a0f0d] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-violet-500"></div>
                                <div className="flex gap-3 mb-4 items-center">
                                    <Tag className="text-violet-500 w-5 h-5" />
                                    <h3 className="font-bold text-slate-200">Scheme Impact Analysis</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                                        <span className="text-sm text-slate-400">Effective Profit Margin</span>
                                        <span className={`font-bold text-lg ${effectiveMarginWithScheme < 0 ? 'text-red-500' : (effectiveMarginWithScheme < expectedMargin ? 'text-orange-400' : 'text-emerald-400')}`}>
                                            {effectiveMarginWithScheme.toFixed(1)}%
                                        </span>
                                    </div>

                                    {effectiveMarginWithScheme < expectedMargin && (
                                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-lg text-sm">
                                            <p className="font-bold mb-1 border-b border-orange-500/20 pb-1 inline-block">Warning: Low Profitability</p>
                                            <p className="mt-1 leading-snug">
                                                Giving {schemeGiven} free item(s) drops your margin to {effectiveMarginWithScheme.toFixed(1)}%.
                                                To keep your {expectedMargin}% margin with this scheme, price the item at <strong className="text-white">₹{adjustedSellingPriceWithScheme.toFixed(2)}</strong>.
                                            </p>
                                        </div>
                                    )}
                                    {effectiveMarginWithScheme >= expectedMargin && effectiveMarginWithScheme > 0 && (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-sm">
                                            <p className="font-bold">Profitable Scheme</p>
                                            <p className="mt-1">You are still making target margins even with the free items.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                    <div className="bg-[#0a0f0d] p-4 text-center border-t border-[#1a231f]">
                        <p className="text-xs font-medium text-slate-500">
                            *Calculations assume GST is passed equally on cost and sale. Free scheme items absorb cost without generating revenue.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
