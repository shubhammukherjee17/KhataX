# KhataX
Fintech SaaS MVP for Business Management & Credit Ledger

KhataX is a full-featured Minimum Viable Product (MVP) tailored specifically for distributors and wholesalers to manage complicated credit ledgers, multi-godown stock, and smart margin pricing. It eliminates the friction of traditional ERPs by providing a simplified, action-driven, modern, and beautiful interface.

## 🚀 Key Features Demonstrated

1. **Smart Credit Ledger**
   - Track outstanding balances for 50-300+ retailers.
   - Set credit limits and payment terms. 
   - Real-time ledger view with overdue alerts and automated risk tags (Safe, Warning, Overdue).
   - Dynamic system block for new invoices if a retailer exceeds their credit limit.
   - 1-Click WhatsApp payment reminders embedded in actionable dashboards.

2. **Multi-Godown Inventory Management**
   - True multi-location entity management. Add unlimited godowns.
   - Comprehensive Stock Transfers to seamlessly track inventory movement from Warehouse A to Warehouse B.
   - Built-in "Dead Stock" analyzer tracking item non-movement over 30/60/90 days.

3. **Ultra-Fast Sales & Invoicing**
   - High-performance invoice builder natively linked to the master Godown stock file.
   - Creates a transaction, immediately triggers stock reduction, computes GST dynamically, and generates an instant PDF export using `jspdf`.
   - Optimized for manual fast-entry with prefilled Vendor histories.

4. **Collections Dashboard**
   - Visual snapshot outlining total receivables vs. payables. 
   - Quick rundown of "Upcoming Dues" over the next 7 Days.
   - Dedicated table to handle top risky, high-exposure retailers.
   - Aesthetically stunning "Premium Dark Mode" visualizations.

5. **Margin & Trade Scheme Calculator Tools**
   - Actionable math tool specifically designed for distributors adjusting supply rates.
   - Input your purchase price and target margin; instantly receive your selling targets inclusive of GST load.
   - Scheme analyzer determines realistic net profitability when running "Buy 10 Get 1 Free" promos.

6. **Actionable BI Reports**
   - Pre-packaged reports evaluating your Profit & Loss.
   - Easy GSTR-3B summaries to keep you tax-ready.
   - Dead Stock capital reports and item vs. retailer sales velocities.

## 🛠️ Technology Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Directory)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & `lucide-react` for beautiful iconography.
- **State Management**: Zustand
- **Charts**: Recharts
- **Forms**: React Hook Form
- **PDF Generation**: jsPDF & jspdf-autotable

## ⚙️ Quick Start

First, navigate into the project directory and install the required dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application!


## 🎨 Design Philosophy
KhataX follows a premium, glass-morphic, highly aesthetic modern web design philosophy. We moved away from generic white layouts typically found in accounting, introducing curated harmonious dark-theme palettes with striking `#00ea77` neon accents that engage users.
