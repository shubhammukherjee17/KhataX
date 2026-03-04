import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Transaction } from '@/types';
import { format } from 'date-fns';

export async function generateInvoicePDF(invoice: Transaction, businessProfile: { name?: string; gstin?: string; address?: string } | undefined | null) {
    // Initialize A4 PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Define Colors
    const primaryColor: [number, number, number] = [0, 234, 119]; // Neon Green Theme #00ea77
    const textColor: [number, number, number] = [40, 40, 40];

    // Helper function for text
    const addText = (text: string, x: number, y: number, size: number = 10, align: 'left' | 'center' | 'right' = 'left', isBold: boolean = false) => {
        doc.setFontSize(size);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as jsPDF & { text: (text: string, x: number, y: number, options?: any) => void }).text(text, x, y, { align });
    };

    // --- HEADER ---
    // Business Info (Left)
    addText(businessProfile?.name || 'My Business', 14, 20, 16, 'left', true);
    if (businessProfile?.gstin) {
        addText(`GSTIN: ${businessProfile.gstin}`, 14, 28, 10);
    }
    if (businessProfile?.address) {
        addText(businessProfile.address, 14, 34, 10);
    }

    // Invoice Title (Right)
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    addText('TAX INVOICE', pageWidth - 14, 20, 22, 'right', true);

    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    addText(`Invoice #: ${invoice.number}`, pageWidth - 14, 30, 10, 'right', true);
    addText(`Date: ${format(new Date(invoice.date), 'dd MMM yyyy')}`, pageWidth - 14, 36, 10, 'right');
    if (invoice.dueDate) {
        addText(`Due Date: ${format(new Date(invoice.dueDate), 'dd MMM yyyy')}`, pageWidth - 14, 42, 10, 'right');
    }

    // --- BILL TO SECTION ---
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 50, pageWidth - 14, 50);

    addText('Bill To:', 14, 60, 11, 'left', true);
    addText(invoice.partyName, 14, 66, 12, 'left', true);
    // Optional party details would go here if we populated them in transaction

    // --- ITEM TABLE ---
    const tableHead = [['Item', 'Qty', 'Rate', 'Discount', 'Tax %', 'Amount']];
    const tableBody = invoice.items.map(item => [
        item.name,
        item.quantity.toString(),
        `Rs. ${item.rate.toFixed(2)}`,
        item.discount ? `${item.discount}%` : '-',
        `${item.taxRate || 0}%`,
        `Rs. ${item.totalAmount.toFixed(2)}`
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as jsPDF & { autoTable: (options: any) => void }).autoTable({
        startY: 80,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [0, 0, 0],
            fontStyle: 'bold'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
        },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Item Name
            1: { halign: 'center' }, // Qty
            2: { halign: 'right' }, // Rate
            3: { halign: 'center' }, // Discount
            4: { halign: 'center' }, // Tax %
            5: { halign: 'right', fontStyle: 'bold' } // Amount
        }
    });

    // --- TOTALS SECTION ---
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    const rightColX = pageWidth - 60;
    const amountsX = pageWidth - 14;

    // Subtotal
    addText('Subtotal:', rightColX, finalY, 10, 'left');
    addText(`Rs. ${invoice.subTotal.toFixed(2)}`, amountsX, finalY, 10, 'right');

    // Tax Total
    addText('Total Tax:', rightColX, finalY + 8, 10, 'left');
    addText(`Rs. ${invoice.taxAmountTotal.toFixed(2)}`, amountsX, finalY + 8, 10, 'right');

    // Ground Total Line
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(rightColX, finalY + 12, amountsX, finalY + 12);

    // Grand Total
    addText('Grand Total:', rightColX, finalY + 20, 12, 'left', true);
    addText(`Rs. ${invoice.grandTotal.toFixed(2)}`, amountsX, finalY + 20, 12, 'right', true);

    // Status Stamp
    if (invoice.status === 'paid') {
        doc.setTextColor(0, 200, 0);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (doc as jsPDF & { text: (text: string, x: number, y: number, options?: any) => void }).text('PAID', 14, finalY + 20, { angle: 45, renderingMode: 'fill' });
    }

    // --- FOOTER ---
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text('This is a computer-generated invoice and requires no signature.', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    doc.save(`${invoice.number}_${invoice.partyName.replace(/\s+/g, '_')}.pdf`);
}
