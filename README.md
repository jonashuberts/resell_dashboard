# Resell Dashboard

![Dashboard Mockup](./docs/mockup.png)

A sleek and modern Next.js web application designed to help you track your reselling business. Easily manage your inventory, record sales and repaires, and monitor your cashflow with dynamic charts.

## Features

- **Inventory Management**: Keep track of purchased items, their status (e.g., In Stock, In Repair, Sold), and platforms.
- **Transaction Tracking**: Log all expenses and income, including spare parts, shipping fees, to automatically calculate your exact profit margins.
- **Dynamic Dashboard**: Beautiful KPI cards and Recharts integration to visualize your spending and revenue over time.
- **Localization**: Full bilingual support (English and German) with language persistence.
- **Customizable Settings**: Add custom colored categories and custom status labels directly from the UI.
- **Built-in Backups**: Export your entire database to CSV with a single click.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, React Server Components)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Supabase](https://supabase.com/) for PostgreSQL database and backend API
- [Recharts](https://recharts.org/) for data visualization
- [Lucide React](https://lucide.dev/) for iconography

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/resell_dashboard.git
cd resell_dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/).
2. Navigate to the SQL Editor in your Supabase dashboard and run the setup scripts (which you can find inside the Settings menu of this app, or define your own `items`, `transactions`, `category_settings`, and `status_settings` tables).
3. Copy your project URL and target `anon` key from the Supabase API settings.

### 4. Environment Variables

Create a new file named `.env.local` in the root of the project:

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License**. 
This means you are free to use, modify, and distribute the code for **personal or educational purposes**, provided you give appropriate **credit** (attribution). However, you **may not use the material for commercial purposes**.

See the [LICENSE](LICENSE) file for more details.
