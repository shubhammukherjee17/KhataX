# KhataX
**Financial SaaS MVP for Business Management, Credit Ledgers, and AI Intelligence**

KhataX Pro is a full-featured Minimum Viable Product (MVP) tailored specifically for Indian distributors, wholesalers, and small businesses to manage complicated credit ledgers, multi-godown stock, and smart margin pricing. It eliminates the friction of traditional ERPs by providing a simplified, action-driven, modern, and beautiful interface. 

---

## 🌟 Key Features Demonstrated

### 1. Smart Credit Ledger & Collections
- Track outstanding balances for 50-300+ retailers securely.
- Set credit limits, payment terms, and automate risk tags (Safe, Warning, Overdue).
- Dynamic system blocks for new invoices if a retailer exceeds their credit limit.
- 1-Click WhatsApp payment reminders embedded in actionable dashboards.

### 2. Beautiful Data-Driven Dashboards 
- **Cash Flow Area Charts**: View live 7-day trailing revenue vs expense timelines (dynamically scaling visual sparklines if zeroed out).
- **Cash Distribution Donuts**: Instant breakdown of total money-in vs money-out.
- **Top Performers Bar Charts**: Visually rank the highest-volume vendors/customers in your ecosystem.
- Stunning "Premium Dark Mode" visualization driven by `recharts`.

### 3. Ultra-Fast Sales & Invoicing
- High-performance invoice builder natively linked to the master Godown stock file.
- Automatically computes dynamic GST tax rates (5%, 12%, 18%, 28%).
- Generates polished, print-ready instant PDF export invoices utilizing `jspdf` and `jspdf-autotable`.

### 4. Advanced AI Suite (Powered by Gemini 2.5 Flash) 🧠
KhataX Pro comes supercharged with the latest **Gemini 2.5** intelligence models deeply embedded in a secure, server-side Next.js `/api` architecture:
- **General AI Chatbot:** A floating AI widget that reads live dynamic `Zustand` states. Ask it "Who owes me money?" or "What were my sales today?", and it answers dynamically in Hinglish.
- **Natural Language Parsing**: Speak or type e.g., *"Paid ₹500 to Swiggy for lunch"*, and the AI engine cleanly maps it to a ledger transaction struct.
- **Tax Assistant AI**: A dedicated chat gateway to understand GST Liabilities, Input Tax Credit (ITC), and HSN mechanisms intuitively matching your recent transaction volumes.
- **Financial Intelligence Room**: Generates actionable metrics—Health Scores, Spending Behavioral Patterns, Recommendations, and visual pie charts—analyzing the trajectory of your business history.
- **Smart Receipt Scanner (Vision OCR)**: Built-in Vision AI integration to scan blurry vendor receipts and computationally extract vendor details, dates, and strict line items to reduce manual form entry.

---

## 🛠️ Technology Stack
- **Core**: Next.js 14/15 App Router
- **Database / Auth**: Firebase SDK (Authentication & Firestore cloud sync)
- **State Management**: Zustand
- **Language**: TypeScript
- **Styling**: Tailwind CSS & `lucide-react` for beautiful iconography
- **Charts / UI**: Recharts, Framer Motion
- **AI Integration**: Google Generative AI REST API (`generativelanguage.googleapis.com`)

---

## ⚙️ Quick Start Setup

1. **Install Dependencies**
   Navigate into the project directory and install everything:
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file at the root of your project. Next.js accesses these strictly on the server:
   ```env
   # Firebase Web Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_firebase_auth_domain"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_firebase_storage_bucket"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"

   # Server-side Secure External Secrets
   GEMINI_API_KEY="your_gemini_2.5_flash_key"
   ```

3. **Start the Development Server**
   Spin up the application locally:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view KhataX. Ensure you restart the server anytime `.env.local` is modified!

---

## 🎨 Design Philosophy
KhataX follows a premium, glass-morphic, highly aesthetic modern web design philosophy. We moved away from generic white layouts typically found in generic B2B software accounting systems, and instead introduced curated harmonious dark-theme palettes with striking `#00ea77` neon accents that captivate and delight users on a day-to-day basis.
