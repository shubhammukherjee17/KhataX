'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMasterDataStore } from '@/store/useMasterDataStore';
import { useTransactionStore } from '@/store/useTransactionStore';
import { ArrowLeft, Download, FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';

type LedgerEntry = {
  id: string;
  date: Date;
  type: string;
  ref: string;
  amount: number; // raw amount of the event
  isPayableIncrease: boolean; // if true, it adds to payable (or reduces receivable)
  balanceAfter: number; // Computed running balance
};

export default function PartyLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const partyId = params.id as string;

  const { parties, isLoading } = useMasterDataStore();
  const { transactions } = useTransactionStore();

  const party = parties.find(p => p.id === partyId);

  useEffect(() => {
    if (!isLoading && parties.length > 0 && !party) {
      router.push('/parties');
    }
  }, [isLoading, parties, party, router]);

  const ledgerEntries = useMemo(() => {
    if (!party) return [];

    const partyTxs = transactions.filter(t => t.partyId === partyId);

    // Sort ascending by date for running calculation
    partyTxs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const entries: LedgerEntry[] = [];
    let runningBalance = party.openingBalance || 0; // +ve is Payable, -ve is Receivable

    partyTxs.forEach((tx) => {
      const txDate = new Date(tx.date);

      if (tx.type === 'sale_invoice') {
        // Sale increases receivable (moves balance towards -ve)
        runningBalance -= tx.grandTotal;
        entries.push({
          id: `${tx.id}-sale`,
          date: txDate,
          type: 'Sale Invoice',
          ref: tx.number,
          amount: tx.grandTotal,
          isPayableIncrease: false,
          balanceAfter: runningBalance
        });

        // If there was an immediate payment on this sale
        if (tx.amountPaid > 0) {
          runningBalance += tx.amountPaid; // Payment reduces receivable (moves balance towards +ve)
          entries.push({
            id: `${tx.id}-payin`,
            date: txDate,
            type: 'Payment In',
            ref: tx.number,
            amount: tx.amountPaid,
            isPayableIncrease: true,
            balanceAfter: runningBalance
          });
        }
      }
      else if (tx.type === 'purchase_invoice') {
        // Purchase increases payable (moves balance towards +ve)
        runningBalance += tx.grandTotal;
        entries.push({
          id: `${tx.id}-purch`,
          date: txDate,
          type: 'Purchase Bill',
          ref: tx.number,
          amount: tx.grandTotal,
          isPayableIncrease: true,
          balanceAfter: runningBalance
        });

        if (tx.amountPaid > 0) {
          runningBalance -= tx.amountPaid; // Payment out reduces payable
          entries.push({
            id: `${tx.id}-payout`,
            date: txDate,
            type: 'Payment Out',
            ref: tx.number,
            amount: tx.amountPaid,
            isPayableIncrease: false,
            balanceAfter: runningBalance
          });
        }
      }
    });

    // Ensure sorted descending for display (newest first)
    return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [party, partyId, transactions]);

  const { overdueAmount, riskTag } = useMemo(() => {
    if (!party) return { overdueAmount: 0, riskTag: 'Green' };

    let overdue = 0;
    const today = new Date();

    // Only calculate overdue for customers (receivables) with a current balance to receive
    if (party.type === 'customer' && party.currentBalance < 0) {
      const partyTxs = transactions.filter(t => t.partyId === partyId && t.type === 'sale_invoice');

      // We look at unpaid/partially paid invoices
      partyTxs.forEach((tx) => {
        const remaining = tx.grandTotal - (tx.amountPaid || 0);
        if (remaining > 0) {
          const invoiceDate = new Date(tx.date);
          const daysSinceInvoice = differenceInDays(today, invoiceDate);

          // Use party's creditDays or default to 30
          const creditDays = party.creditDays !== undefined ? party.creditDays : 30;

          if (daysSinceInvoice > creditDays) {
            overdue += remaining;
          }
        }
      });
    }

    let tag = 'Green';
    if (overdue > 0) {
      tag = 'Red'; // Has overdue money
    } else if (party.creditLimit && Math.abs(party.currentBalance) >= party.creditLimit * 0.9) {
      tag = 'Yellow'; // Approaching credit limit
    }

    return { overdueAmount: overdue, riskTag: tag };
  }, [party, partyId, transactions]);

  if (!party) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/parties"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Parties
        </Link>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            className="flex items-center justify-center gap-2 bg-[#121c17] hover:bg-[#1a231f] text-white border border-[#1a231f] px-4 py-2.5 rounded-lg transition-colors text-sm font-bold"
          >
            <Download className="w-4 h-4" /> Download Statement
          </button>
          <Link
            href={party.type === 'customer' ? "/sales/new" : "/purchases"}
            className="flex items-center justify-center gap-2 bg-[#00ea77] hover:bg-[#00c563] text-black px-4 py-2.5 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(0,234,119,0.2)]"
          >
            <Plus className="w-4 h-4" /> New {party.type === 'customer' ? 'Invoice' : 'Bill'}
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-[#121c17] rounded-xl border border-[#1a231f] p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-black text-white">{party.name}</h1>
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${party.type === 'customer' ? 'bg-[#00ea77]/20 text-[#00ea77]' : 'bg-blue-500/20 text-blue-400'}`}>
              {party.type}
            </span>
          </div>
          <div className="text-slate-400 text-sm space-y-1">
            {party.phone && <p>📞 {party.phone}</p>}
            {party.email && <p>✉️ {party.email}</p>}
            {party.gstin && <p className="font-mono text-xs mt-2">GSTIN: {party.gstin}</p>}
            <p className="text-xs mt-2">
              Credit Limit: <span className="font-medium text-slate-200">₹{party.creditLimit || 'No Limit'}</span> •
              Terms: <span className="font-medium text-slate-200">{party.creditDays || 30} Days</span>
            </p>
          </div>
        </div>

        <div className="bg-[#0A0F0D] rounded-xl border border-[#1a231f] p-6 text-center md:text-right min-w-[200px]">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Current Balance</p>
          <p className={`text-3xl font-black ${party.currentBalance > 0 ? 'text-blue-400' : party.currentBalance < 0 ? 'text-[#00ea77]' : 'text-slate-300'}`}>
            ₹{Math.abs(party.currentBalance).toFixed(2)}
          </p>
          <p className="text-sm font-semibold mt-1 text-slate-400 mb-4">
            {party.currentBalance > 0 ? 'To Pay' : party.currentBalance < 0 ? 'To Receive' : 'Settled'}
          </p>

          <div className="flex flex-col gap-2">
            {party.type === 'customer' && overdueAmount > 0 && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 rounded p-2 text-xs font-bold text-left">
                ⚠️ OVERDUE: ₹{overdueAmount.toFixed(2)}
              </div>
            )}

            <div className={`px-2 py-1.5 rounded text-xs font-bold text-center border ${riskTag === 'Green' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
              riskTag === 'Yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
              Risk Status: {riskTag}
            </div>

            {party.type === 'customer' && party.phone && (
              <a
                href={`https://wa.me/91${party.phone}?text=Hello ${party.name}, this is a gentle reminder for your outstanding balance of ₹${Math.abs(party.currentBalance).toFixed(2)}${overdueAmount > 0 ? ` (Overdue: ₹${overdueAmount.toFixed(2)})` : ''}. Please process the payment at your earliest convenience.`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20b858] text-white px-3 py-2 rounded-md transition-colors text-xs font-bold"
              >
                📱 Send Reminder
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#121c17] rounded-xl border border-[#1a231f] overflow-hidden">
        <div className="p-6 border-b border-[#1a231f]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00ea77]" /> Statement of Account
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0A0F0D] border-b border-[#1a231f] text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Ref No.</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a231f]">
              {ledgerEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-slate-300 font-medium whitespace-nowrap">
                    {format(entry.date, 'dd MMM yyyy')}
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                    {entry.ref}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${entry.type.includes('Payment') ? 'bg-blue-500/10 text-blue-400' : 'bg-[#00ea77]/10 text-[#00ea77]'
                      }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${entry.isPayableIncrease ? 'text-slate-200' : 'text-slate-200'}`}>
                    {/* We can color code based on +ve/-ve impact if desired, but neutral is fine for a professional ledger. We'll use prefix */}
                    <span className={entry.isPayableIncrease ? 'text-red-400' : 'text-green-400'}>
                      {entry.isPayableIncrease ? '+' : '-'} ₹{entry.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    ₹{Math.abs(entry.balanceAfter).toFixed(2)}
                    <span className="text-[10px] font-medium text-slate-500 ml-1.5 uppercase tracking-wide">
                      {entry.balanceAfter > 0 ? 'Dr' : entry.balanceAfter < 0 ? 'Cr' : ''}
                    </span>
                  </td>
                </tr>
              ))}
              {/* Opening Balance Row */}
              <tr className="bg-[#0A0F0D]">
                <td className="px-6 py-4 text-slate-400 font-medium" colSpan={3}>
                  Opening Balance
                </td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right font-bold text-white border-t-2 border-[#1a231f]">
                  ₹{Math.abs(party.openingBalance).toFixed(2)}
                  <span className="text-[10px] font-medium text-slate-500 ml-1.5 uppercase tracking-wide">
                    {party.openingBalance > 0 ? 'Dr' : party.openingBalance < 0 ? 'Cr' : ''}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          {ledgerEntries.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">No transactions recorded for this party yet.</p>
              <Link
                href={party.type === 'customer' ? "/sales/new" : "/purchases"}
                className="text-[#00ea77] font-bold hover:underline"
              >
                Create the first transaction
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
