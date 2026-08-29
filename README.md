# Resell Dashboard

![Resell Dashboard Mockup](./docs/mockup.png)

A modern, fast, and intuitive web application to track and manage your reselling business across platforms like **eBay**, **Vinted**, **Kleinanzeigen**, **Amazon**, and **private sales**. Easily manage your stock, record purchases, calculate exact profits, and monitor your cashflow in real time.

> 🚀 **Live Demo**: Test the dashboard immediately without creating an account! On the login page, simply click **"Live-Demo ausprobieren / Try Live Demo"** to explore interactive sample data.

---

## Key Features

- **📦 Inventory Management**: Track purchased items, active listings, and statuses (*In Stock*, *In Repair*, *Sold*, *To Ship*).
- **💰 Automatic Profit & Margin Calculation**: Log all purchase prices, selling prices, platform fees, and spare parts to see exact net profits and ROI per item.
- **📈 Real-Time Cashflow & Analytics**: Interactive charts and modular KPI widgets showing monthly revenue, expenses, top-performing categories, and average selling speed (*Days to Sell*).
- **⚡ Instant Search & Filtering**: Lightning-fast in-memory filtering by category, status, type, and keyword with zero delay.
- **🏷️ Custom Categories & Statuses**: Create, color-code, and organize your own custom product categories and workflow statuses.
- **🌐 Bilingual (DE / EN)**: Full German and English language support with one-click switching.
- **💾 One-Click Backup**: Export your complete inventory and transaction history to CSV at any time.

---

## Tech Stack

- **Frontend & Server**: [Next.js](https://nextjs.org/) (React, App Router, Turbopack)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Quickstart (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/jonashuberts/resell_dashboard.git
cd resell_dashboard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

Deploy your own instance to Vercel in minutes:

1. Import your GitHub repository into [Vercel](https://vercel.com/new).
2. Under **Project Settings > Environment Variables**, add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Click **Deploy**.

---

## License

This project is open-source and licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for details.
