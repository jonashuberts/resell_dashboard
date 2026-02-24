import { createClient } from "@/lib/supabase-server";
import { ArrowUpRight, ArrowDownRight, DollarSign, Percent, PackageOpen, TrendingUp, Wallet, Truck, Clock, Trophy, Activity } from "lucide-react";
import { DashboardChart } from "@/components/DashboardChart";
import { TimeFilter } from "@/components/TimeFilter";
import { CategoryFilter } from "@/components/CategoryFilter";
import { Translate } from "@/components/Translate";
import Link from "next/link";

export const revalidate = 0; // Disable caching to always show live data

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const currentRange = (params.range as string) || "all";
  const categoryFilter = (params.category as string) || "all";

  // --- Fetch categories for the filter dropdown ---
  const { data: catSettings } = await supabase.from("category_settings").select("name").order("sort_order", { ascending: true });
  const { data: catData } = await supabase.from("items").select("category");
  
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  const hasUncategorized = catData?.some(c => c.category === 'Keine Kategorie' || !c.category);
  if (hasUncategorized) {
    categoryNames.add('Keine Kategorie');
  }
  const categories = Array.from(categoryNames).sort();

  // --- Base Queries ---
  let transactionsQuery = supabase.from("transactions").select("id, date, type, item_id, amount, platform, items!inner(category, name)");
  let itemsQuery = supabase.from("items").select("id, status, category, created_at");

  if (categoryFilter !== "all") {
    transactionsQuery = transactionsQuery.eq("items.category", categoryFilter);
    itemsQuery = itemsQuery.eq("category", categoryFilter);
  }
  
  const now = new Date();
  if (currentRange === "year") {
    transactionsQuery = transactionsQuery.gte("date", `${now.getFullYear()}-01-01`);
  } else if (currentRange === "last_year") {
    transactionsQuery = transactionsQuery.gte("date", `${now.getFullYear() - 1}-01-01`).lte("date", `${now.getFullYear() - 1}-12-31`);
  } else if (currentRange === "month") {
    const month = String(now.getMonth() + 1).padStart(2, '0');
    transactionsQuery = transactionsQuery.gte("date", `${now.getFullYear()}-${month}-01`);
  }

  const { data: transactions } = await transactionsQuery;
    
  let totalExpenses = 0;
  let totalRevenue = 0;
  let periodSolds = 0;
  const categoryStats: Record<string, { revenue: number, expense: number, count: number }> = {};

  if (transactions) {
    transactions.forEach(t => {
      // Gather category stats
      const itemData = t.items as any;
      const cat = itemData?.category || "Keine Kategorie";
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, expense: 0, count: 0 };

      if (t.type === "Einkauf" || t.type === "Reparaturkosten" || t.type === "Werkzeuge/Sonstiges") {
        totalExpenses += Number(t.amount);
        categoryStats[cat].expense += Number(t.amount);
      } else if (t.type === "Verkauf") {
        totalRevenue += Number(t.amount);
        periodSolds++;
        categoryStats[cat].revenue += Number(t.amount);
        categoryStats[cat].count++;
      }
    });
  }

  const netProfit = totalRevenue - totalExpenses;
  const marginPercentage = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const avgProfitPerItem = periodSolds > 0 ? netProfit / periodSolds : 0;
  const roiPercentage = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

  // Process top categories
  const topCategories = Object.entries(categoryStats)
    .map(([name, stats]) => ({
      name,
      profit: stats.revenue - stats.expense,
      margin: stats.revenue > 0 ? ((stats.revenue - stats.expense) / stats.revenue) * 100 : 0,
      solds: stats.count
    }))
    .filter(c => c.profit > 0 || c.solds > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 4);

  // Inventory numbers stay absolute within the active category filter
  const { data: allItems } = await itemsQuery;
  
  // Calculate specific stats
  const itemsCount = allItems?.length || 0;
  
  // Calculate average days to sell
  let totalDaysToSell = 0;
  let itemsSoldWithDates = 0;
  
  const soldItems = allItems?.filter(i => i.status.includes('Verkauft') || i.status.includes('Versendet') || i.status.includes('Angekommen') || i.status.includes('Reklamation')) || [];
  const soldCount = soldItems.length;
  
  soldItems.forEach(item => {
    // Find matching Verkauft transaction to get the exact sale date
    const saleTx = transactions?.find(t => t.item_id === item.id && t.type === "Verkauf");
    // Find matching Einkauf transaction to get exact purchase date (ignoring database created_at which might be from historical imports)
    const buyTx = transactions?.find(t => t.item_id === item.id && t.type === "Einkauf");

    if (saleTx && buyTx) {
      const createdDate = new Date(buyTx.date);
      const saleDate = new Date(saleTx.date);
      const diffTime = Math.abs(saleDate.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDaysToSell += diffDays;
      itemsSoldWithDates++;
    }
  });
  
  const avgDaysToSell = itemsSoldWithDates > 0 ? Math.round(totalDaysToSell / itemsSoldWithDates) : 0;

  const toShipCount = allItems?.filter(i => i.status === 'Verkauft (Muss versendet werden)').length || 0;
  const inStockItems = allItems?.filter(i => i.status === 'Auf Lager' || i.status === 'In Reparatur') || [];
  
  // Calculate stock value (Lagerwert) by summing "Einkauf" transactions for items currently in stock
  let stockValue = 0;
  if (inStockItems.length > 0) {
    const inStockIds = inStockItems.map(i => i.id);
    const { data: stockTxs } = await supabase
      .from("transactions")
      .select("amount")
      .eq("type", "Einkauf")
      .in("item_id", inStockIds);
      
      if (stockTxs) {
        stockTxs.forEach(tx => stockValue += Number(tx.amount));
      }
    }
  
    // Derive recent activity from the already filtered transactions
    // This ensures that the activity feed matches the Category & Time filters
    const recentTxs = transactions
      ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
      : [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white"><Translate tKey="dashboard.title" /></h2>
        <div className="flex items-center gap-4">
          <CategoryFilter categories={categories} />
          <TimeFilter />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          title={<Translate tKey="dashboard.revenue.title" />}
          value={`€${totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
          trend={<Translate tKey="dashboard.revenue.trend" />}
        />
        <Card
          title={<Translate tKey="dashboard.expenses.title" />}
          value={`€${totalExpenses.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowDownRight className="h-4 w-4 text-rose-500" />}
          trend={<Translate tKey="dashboard.expenses.trend" />}
        />
        <Card
          title={<Translate tKey="dashboard.profit.title" />}
          value={`€${netProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowUpRight className="h-4 w-4 text-blue-500" />}
          trend={<Translate tKey="dashboard.profit.trend" />}
          highlight={netProfit >= 0}
        />
        <Card
          title={<Translate tKey="dashboard.roi.title" />}
          value={`${roiPercentage.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          trend={<Translate tKey="dashboard.roi.trend" amount={avgProfitPerItem.toFixed(2)} />}
        />
      </div>

      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col shadow-sm">
        <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-zinc-400" />
          <Translate tKey="dashboard.cashflow.title" />
        </h3>
        <DashboardChart transactions={transactions || []} />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Categories & Days to Sell */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-zinc-400" />
            <Translate tKey="dashboard.categories.title" />
          </h3>
          
          <div className="space-y-4 mb-6 flex-1">
            {topCategories.length > 0 ? topCategories.map((cat, idx) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500 font-medium w-4">{idx + 1}.</span>
                  <span className="text-zinc-300 font-medium">{cat.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">€{cat.profit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-zinc-500"><Translate tKey="dashboard.categories.sales" count={cat.solds} /> • <Translate tKey="dashboard.categories.margin" margin={cat.margin.toFixed(1)} /></div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-zinc-500 text-center py-4"><Translate tKey="dashboard.categories.empty" /></div>
            )}
          </div>
          
          <div className="mt-auto pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-zinc-400"><Translate tKey="dashboard.days.title" /></div>
                  <div className="text-xs text-zinc-500"><Translate tKey="dashboard.days.desc" /></div>
                </div>
              </div>
              <div className="text-xl font-bold text-white">
                {avgDaysToSell} <span className="text-sm font-medium text-zinc-500"><Translate tKey="dashboard.days.unit" /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-zinc-400" />
              <Translate tKey="dashboard.activity.title" />
            </span>
            <Link href="/transactions" className="text-sm text-blue-400 hover:text-blue-300"><Translate tKey="dashboard.activity.viewAll" /></Link>
          </h3>
          
          <div className="space-y-4">
            {recentTxs && recentTxs.length > 0 ? recentTxs.map((tx) => (
              <div key={tx.id} className="flex gap-4">
                <div className="relative mt-1">
                  <div className={`w-2 h-2 rounded-full absolute top-1.5 left-1/2 -translate-x-1/2 ${
                    tx.type === 'Verkauf' ? 'bg-emerald-500' : 
                    tx.type === 'Einkauf' ? 'bg-rose-500' : 'bg-amber-500'
                  }`} />
                  <div className="w-px h-full bg-zinc-800 absolute top-4 left-1/2 -translate-x-1/2" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-200 line-clamp-1">
                        {tx.type === 'Werkzeuge/Sonstiges' ? <Translate tKey="dashboard.activity.expense" /> : ((tx.items as any)?.name || <Translate tKey="dashboard.activity.unknown" />)}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        {tx.type === 'Verkauf' ? <Translate tKey="dashboard.tx.sell" /> :
                         tx.type === 'Einkauf' ? <Translate tKey="dashboard.tx.buy" /> :
                         tx.type === 'Reparaturkosten' ? <Translate tKey="dashboard.tx.repair" /> :
                         <Translate tKey="dashboard.tx.other" />} • {new Date(tx.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <span className={`text-sm font-medium shrink-0 ml-2 ${
                      tx.type === 'Verkauf' ? 'text-emerald-400' : 'text-zinc-300'
                    }`}>
                      {tx.type === 'Verkauf' ? '+' : '-'}€{Number(tx.amount).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-zinc-500 text-center py-4"><Translate tKey="dashboard.activity.empty" /></div>
            )}
          </div>
        </div>

        {/* Logistics & Stock */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-medium text-white mb-6 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-zinc-400" />
              <Translate tKey="dashboard.logistics.title" />
            </span>
            <Link href="/inventory" className="text-sm text-blue-400 hover:text-blue-300"><Translate tKey="dashboard.logistics.open" /></Link>
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1"><Wallet className="h-3 w-3" /> <Translate tKey="dashboard.logistics.value" /></span>
              <span className="text-2xl font-bold text-blue-400">€{stockValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-medium text-zinc-400 mb-1 flex items-center gap-1"><Truck className="h-3 w-3" /> <Translate tKey="dashboard.logistics.ship" /></span>
              <span className={`text-2xl font-bold ${toShipCount > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>{toShipCount}</span>
            </div>
          </div>

          <div className="space-y-3 mt-auto">
            <div className="flex justify-between items-center bg-zinc-950/50 px-4 py-3 rounded-lg border border-zinc-800/50">
              <span className="text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.total" /></span>
              <span className="text-lg font-bold text-white">{itemsCount}</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950/50 px-4 py-3 rounded-lg border border-zinc-800/50">
              <span className="text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.sold" /></span>
              <span className="text-lg font-bold text-emerald-400">{soldCount}</span>
            </div>
            <div className="flex justify-between items-center bg-zinc-950/50 px-4 py-3 rounded-lg border border-zinc-800/50">
              <span className="text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.stock" /></span>
              <span className="text-lg font-bold text-blue-400">{itemsCount - soldCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, icon, trend, highlight }: { title: React.ReactNode, value: React.ReactNode, icon: React.ReactNode, trend?: React.ReactNode, highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-sm relative overflow-hidden group hover:border-zinc-700 transition-colors">
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {icon}
      </div>
      <div>
        <div className={`text-3xl font-bold tracking-tight ${highlight === true ? 'text-emerald-500' : 'text-zinc-100'}`}>
          {value}
        </div>
        {trend && (
          <p className="text-xs text-zinc-500 mt-2 font-medium">{trend}</p>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-zinc-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
