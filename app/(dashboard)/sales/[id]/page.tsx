'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTransactionStore } from '@/store/useTransactionStore';
import { useAuth } from '@/hooks/useAuth';
import { getDocument } from '@/lib/firebase/firestore';
import { generateInvoicePDF } from '@/lib/pdf/generateInvoice';
import { ArrowLeft, Download, Printer, QrCode, Share2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { Business } from '@/types';
import { useNotificationStore } from '@/store/useNotificationStore';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { transactions, isLoading, updateTransaction } = useTransactionStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const invoiceId = params.id as string;
  const invoice = transactions.find(t => t.id === invoiceId);
  const balanceDue = invoice ? invoice.grandTotal - invoice.amountPaid : 0;
  
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    if (!isLoading && !invoice) {
      router.push('/sales');
    }
    
    async function fetchBusiness() {
      if (profile?.currentBusinessId) {
        try {
          const b = await getDocument<Business>('businesses', profile.currentBusinessId);
          setBusiness(b);
        } catch (e) {
          console.error("Failed to load business profile", e);
        }
      }
    }
    fetchBusiness();
  }, [isLoading, invoice, router, profile]);

  if (isLoading || !invoice) {
    return <div className="p-8 text-center text-slate-500">Loading invoice...</div>;
  }

  const handleRecordPayment = () => {
    if (balanceDue <= 0) {
      useNotificationStore.getState().addNotification('Invoice is already fully paid.', 'info');
      return;
    }
    
    router.push(`/sales/${invoiceId}/payment/new`);
  };

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      await generateInvoicePDF(invoice, business || { name: profile?.name || 'My Business' });
    } catch (error) {
      console.error('Failed to generate PDF', error);
      useNotificationStore.getState().addNotification('Failed to generate PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const blob = await generateInvoicePDF(invoice, business || { name: profile?.name || 'My Business' }, 'blob') as Blob;
      
      const safePartyName = (invoice.partyName || 'Party').replace(/\s+/g, '_');
      const file = new File([blob], `${invoice.number}_${safePartyName}.pdf`, { type: 'application/pdf' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Invoice ${invoice.number}`,
          text: `Here is the invoice ${invoice.number} from ${business?.name || profile?.name || 'our business'}.`,
          files: [file]
        });
      } else {
        useNotificationStore.getState().addNotification('Sharing files is not supported on this device/browser. Please download the PDF and share manually.', 'warning');
      }
    } catch (error) {
      console.error('Failed to share PDF', error);
      useNotificationStore.getState().addNotification('Failed to share PDF', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link 
          href="/sales"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => window.print()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#121c17] hover:bg-[#1a231f] text-white border border-[#1a231f] px-4 py-2.5 rounded-lg transition-colors text-sm font-bold"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#121c17] hover:bg-[#1a231f] text-white border border-[#1a231f] px-4 py-2.5 rounded-lg transition-colors text-sm font-bold disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#00ea77] hover:bg-[#00c563] text-black px-4 py-2.5 rounded-lg transition-colors text-sm font-bold shadow-[0_0_15px_rgba(0,234,119,0.2)] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin flex-shrink-0"></span>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Invoice Preview Document */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          <div className="p-8 md:p-12 text-slate-900 bg-white">
            
            {/* Document Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
                  {profile?.businesses?.[0] ? 'KhataX Business' : 'My Business'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">GSTIN: 29XXXXX0000X1Z5</p>
                <p className="text-slate-500 text-sm font-medium">123 Business Avenue, Tech Park</p>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-black text-[#00ea77] tracking-tighter uppercase mb-4">Invoice</h1>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-right">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Invoice No</span>
                  <span className="font-bold">{invoice.number}</span>
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Date</span>
                  <span className="font-medium">{format(new Date(invoice.date), 'dd MMM yyyy')}</span>
                  {invoice.dueDate && (
                    <>
                       <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Due Date</span>
                       <span className="font-medium">{format(new Date(invoice.dueDate), 'dd MMM yyyy')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-10">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</h3>
              <p className="text-lg font-bold text-slate-900">{invoice.partyName}</p>
              {/* If we had party details populated, we would show them here */}
            </div>

            {/* Items Table */}
            <div className="mb-10 border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-bold text-slate-700">Item Description</th>
                      <th className="px-4 py-3 font-bold text-slate-700 text-center">Qty</th>
                      <th className="px-4 py-3 font-bold text-slate-700 text-right">Rate</th>
                      <th className="px-4 py-3 font-bold text-slate-700 text-center">Tax</th>
                      <th className="px-4 py-3 font-bold text-slate-700 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3 font-medium text-slate-600 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 font-medium text-slate-600 text-right">₹{item.rate.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 font-medium text-slate-600 text-center">{item.taxRate || 0}%</td>
                        <td className="px-4 py-3 font-bold text-slate-900 text-right">₹{item.totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-16">
              <div className="w-full max-w-xs space-y-3">
                <div className="flex justify-between text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{invoice.subTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                {invoice.discountTotal > 0 && (
                   <div className="flex justify-between text-sm font-medium text-slate-600">
                    <span>Discount</span>
                    <span className="text-red-500">-₹{invoice.discountTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-medium text-slate-600 pb-3 border-b border-slate-200">
                  <span>Total Tax</span>
                  <span>₹{invoice.taxAmountTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-slate-900 pt-1">
                  <span>Total Due</span>
                  <span>₹{invoice.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="text-center pt-8 border-t border-slate-200 text-slate-400 text-xs font-medium">
              This is a computer-generated document and requires no signature.
            </div>
            
          </div>
        </div>

        {/* Right: Actions & Details Panel (Hidden on Print) */}
        <div className="lg:col-span-1 space-y-4 print:hidden">
          
          <div className="bg-[#121c17] border border-[#1a231f] rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-4">Invoice Status</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wider
              ${invoice.status === 'paid' ? 'bg-[#00ea77]/10 text-[#00ea77]' : 
                invoice.status === 'partially_paid' ? 'bg-yellow-500/10 text-yellow-500' : 
                'bg-red-500/10 text-red-500'}
            `}>
              <div className={`w-2 h-2 rounded-full 
                ${invoice.status === 'paid' ? 'bg-[#00ea77]' : 
                  invoice.status === 'partially_paid' ? 'bg-yellow-500' : 
                  'bg-red-500'}
              `}></div>
              {invoice.status.replace('_', ' ')}
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-[#1a231f]">
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Total Amount</span>
                <span className="text-sm font-bold text-white">₹{invoice.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Amount Paid</span>
                <span className="text-sm font-bold text-[#00ea77]">₹{invoice.amountPaid.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-400">Balance Due</span>
                <span className="text-sm font-bold text-red-400">₹{balanceDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button 
              onClick={handleRecordPayment}
              disabled={balanceDue <= 0}
              className="w-full mt-6 bg-[#0b2217] text-[#00ea77] border border-[#00ea77]/20 hover:bg-[#00ea77]/10 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {balanceDue <= 0 ? 'Fully Paid' : 'Record Payment'}
            </button>
          </div>
          
          {/* UPI Payment Gateway / QR Code */}
          {business?.upiId && balanceDue > 0 && (
            <div className="bg-[#121c17] border border-[#1a231f] rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-sm font-bold text-white mb-1 w-full text-left flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#00ea77]" /> Scan to Pay
              </h3>
              <p className="text-xs text-slate-400 font-medium mb-6 w-full text-left">
                Pay instantly via any UPI App
              </p>
              
              <div className="bg-white p-3 rounded-xl shadow-[0_0_20px_rgba(0,234,119,0.1)] inline-block">
                <QRCodeSVG 
                  value={`upi://pay?pa=${business.upiId}&pn=${encodeURIComponent(business.name)}&am=${Number(balanceDue.toFixed(2))}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.number}`)}`} 
                  size={160} 
                  level="H"
                  includeMargin={false}
                />
              </div>
              
              <p className="text-xs font-bold text-slate-300 mt-4 tracking-wider uppercase">₹{balanceDue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
              <div className="flex flex-wrap gap-2 items-center justify-center mt-3">
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">GPay</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">PhonePe</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">Paytm</span>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-slate-400">Amazon Pay</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
