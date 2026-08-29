import { createClient } from "@/lib/supabase-server";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Percent, 
  PackageOpen, 
  TrendingUp, 
  Wallet, 
  Truck, 
  Clock, 
  Trophy, 
  Activity,
  Layers
} from "lucide-react";
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
    const saleTx = transactions?.find(t => t.item_id === item.id && t.type === "Verkauf");
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
  
  // Calculate stock value (Lagerwert)
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

  const recentTxs = transactions
    ? [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6)
    : [];

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header bar with Apple typography & Segmented controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Translate tKey="dashboard.title" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
            Financial analytics & inventory performance overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CategoryFilter categories={categories} />
          <TimeFilter />
        </div>
      </div>

      {/* KPI Cards (Apple Health / Stocks style modular widgets) */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AppleKpiCard
          title={<Translate tKey="dashboard.revenue.title" />}
          value={`€${totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4.5 w-4.5 text-emerald-400" />}
          iconBg="bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          accentGlow="from-emerald-500/10 via-transparent to-transparent"
          trend={<Translate tKey="dashboard.revenue.trend" />}
          trendColor="text-emerald-400"
        />
        <AppleKpiCard
          title={<Translate tKey="dashboard.expenses.title" />}
          value={`€${totalExpenses.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowDownRight className="h-4.5 w-4.5 text-rose-400" />}
          iconBg="bg-rose-500/15 border-rose-500/30 text-rose-400"
          accentGlow="from-rose-500/10 via-transparent to-transparent"
          trend={<Translate tKey="dashboard.expenses.trend" />}
          trendColor="text-rose-400"
        />
        <AppleKpiCard
          title={<Translate tKey="dashboard.profit.title" />}
          value={`€${netProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowUpRight className="h-4.5 w-4.5 text-blue-400" />}
          iconBg="bg-blue-500/15 border-blue-500/30 text-blue-400"
          accentGlow="from-blue-500/10 via-transparent to-transparent"
          trend={<Translate tKey="dashboard.profit.trend" />}
          trendColor={netProfit >= 0 ? "text-blue-400" : "text-rose-400"}
          highlight={netProfit >= 0}
        />
        <AppleKpiCard
          title={<Translate tKey="dashboard.roi.title" />}
          value={`${roiPercentage.toFixed(1)}%`}
          icon={<TrendingUp className="h-4.5 w-4.5 text-amber-400" />}
          iconBg="bg-amber-500/15 border-amber-500/30 text-amber-400"
          accentGlow="from-amber-500/10 via-transparent to-transparent"
          trend={<Translate tKey="dashboard.roi.trend" amount={avgProfitPerItem.toFixed(2)} />}
          trendColor="text-amber-400"
        />
      </div>

      {/* Cashflow Chart (Apple Stocks style) */}
      <div className="apple-card p-6 sm:p-7 relative overflow-hidden">
        <div className="apple-card-glow" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                <Translate tKey="dashboard.cashflow.title" />
              </h3>
              <p className="text-xs text-zinc-400 font-normal">Income vs. Expenses over time</p>
            </div>
          </div>
        </div>
        <DashboardChart transactions={transactions || []} />
      </div>

      {/* 3-Column Apple Inset Grouped Section */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Categories */}
        <div className="apple-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="apple-card-glow" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Trophy className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  <Translate tKey="dashboard.categories.title" />
                </h3>
              </div>
            </div>
            
            <div className="space-y-3.5 mb-6">
              {topCategories.length > 0 ? topCategories.map((cat, idx) => (
                <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-zinc-800/80 text-[11px] font-bold text-zinc-400 font-mono">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-medium text-zinc-200">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-white font-mono tabular-nums">
                      €{cat.profit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      <Translate tKey="dashboard.categories.sales" count={cat.solds} /> • <Translate tKey="dashboard.categories.margin" margin={cat.margin.toFixed(1)} />
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-xs text-zinc-500 text-center py-6">
                  <Translate tKey="dashboard.categories.empty" />
                </div>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/[0.06]">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-zinc-300"><Translate tKey="dashboard.days.title" /></div>
                  <div className="text-[11px] text-zinc-500"><Translate tKey="dashboard.days.desc" /></div>
                </div>
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {avgDaysToSell} <span className="text-xs font-normal text-zinc-400"><Translate tKey="dashboard.days.unit" /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="apple-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="apple-card-glow" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  <Translate tKey="dashboard.activity.title" />
                </h3>
              </div>
              <Link href="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                <Translate tKey="dashboard.activity.viewAll" /> →
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentTxs && recentTxs.length > 0 ? recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px] ${
                      tx.type === 'Verkauf' ? 'bg-emerald-400 shadow-emerald-400/50' : 
                      tx.type === 'Einkauf' ? 'bg-rose-400 shadow-rose-400/50' : 'bg-amber-400 shadow-amber-400/50'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {tx.type === 'Werkzeuge/Sonstiges' ? <Translate tKey="dashboard.activity.expense" /> : ((tx.items as any)?.name || <Translate tKey="dashboard.activity.unknown" />)}
                      </p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {tx.type === 'Verkauf' ? <Translate tKey="dashboard.tx.sell" /> :
                         tx.type === 'Einkauf' ? <Translate tKey="dashboard.tx.buy" /> :
                         tx.type === 'Reparaturkosten' ? <Translate tKey="dashboard.tx.repair" /> :
                         <Translate tKey="dashboard.tx.other" />} • {new Date(tx.date).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold shrink-0 ml-3 font-mono tabular-nums ${
                    tx.type === 'Verkauf' ? 'text-emerald-400' : 'text-zinc-300'
                  }`}>
                    {tx.type === 'Verkauf' ? '+' : '-'}€{Number(tx.amount).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )) : (
                <div className="text-xs text-zinc-500 text-center py-6"><Translate tKey="dashboard.activity.empty" /></div>
              )}
            </div>
          </div>
        </div>

        {/* Logistics & Stock */}
        <div className="apple-card p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="apple-card-glow" />
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <PackageOpen className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  <Translate tKey="dashboard.logistics.title" />
                </h3>
              </div>
              <Link href="/inventory" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                <Translate tKey="dashboard.logistics.open" /> →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-blue-400" /> <Translate tKey="dashboard.logistics.value" />
                </span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  €{stockValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-amber-400" /> <Translate tKey="dashboard.logistics.ship" />
                </span>
                <span className={`text-lg font-bold font-mono tabular-nums ${toShipCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {toShipCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.total" /></span>
                <span className="text-xs font-bold text-white font-mono">{itemsCount}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.sold" /></span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{soldCount}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium"><Translate tKey="dashboard.logistics.stock" /></span>
                <span className="text-xs font-bold text-blue-400 font-mono">{itemsCount - soldCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppleKpiCard({ 
  title, 
  value, 
  icon, 
  iconBg,
  accentGlow,
  trend, 
  trendColor = "text-zinc-400",
  highlight 
}: { 
  title: React.ReactNode; 
  value: React.ReactNode; 
  icon: React.ReactNode; 
  iconBg: string;
  accentGlow: string;
  trend?: React.ReactNode; 
  trendColor?: string;
  highlight?: boolean;
}) {
  return (
    <div className="apple-card p-6 relative overflow-hidden group cursor-default">
      <div className="apple-card-glow" />
      {/* Subtle ambient corner glow */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${accentGlow} pointer-events-none blur-2xl`} />

      <div className="flex items-center justify-between pb-3">
        <h3 className="text-xs font-medium tracking-tight text-zinc-400">{title}</h3>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl border shadow-sm ${iconBg}`}>
          {icon}
        </div>
      </div>

      <div className="mt-1">
        <div className={`text-2xl sm:text-3xl font-bold tracking-tight font-mono tabular-nums ${
          highlight === true ? 'text-white' : 'text-zinc-100'
        }`}>
          {value}
        </div>
        {trend && (
          <p className={`text-xs mt-2 font-medium tracking-tight flex items-center gap-1 ${trendColor}`}>
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}
