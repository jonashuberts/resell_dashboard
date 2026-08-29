"use client";

import { useState, useMemo } from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Truck, 
  Clock, 
  Trophy, 
  Activity,
  PackageOpen,
  Tag,
  ChevronDown
} from "lucide-react";
import { DashboardChart } from "@/components/DashboardChart";
import { motion } from "motion/react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

type Transaction = {
  id: string;
  date: string;
  type: string;
  item_id: string | null;
  amount: number;
  platform: string | null;
  items?: any;
};

type Item = {
  id: string;
  status: string;
  category: string;
  created_at: string;
};

function getItemData(tItem: Transaction) {
  if (!tItem.items) return null;
  return Array.isArray(tItem.items) ? tItem.items[0] : tItem.items;
}

export function DashboardClientView({
  transactions,
  items,
  categories,
  stockTxs,
}: {
  transactions: Transaction[];
  items: Item[];
  categories: string[];
  stockTxs: { item_id: string | null; amount: number }[];
}) {
  const { t } = useLanguage();
  const [timeRange, setTimeRange] = useState("all");
  const [category, setCategory] = useState("all");

  const timeOptions = [
    { value: "all", label: t("filter.time.all") },
    { value: "year", label: t("filter.time.year") },
    { value: "last_year", label: t("filter.time.last_year") },
    { value: "month", label: t("filter.time.month") },
  ];

  // 1. Filter transactions by Category & Time Range in memory instantly
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

    return transactions.filter((tItem) => {
      // Category filter
      if (category !== "all") {
        const itemCat = getItemData(tItem)?.category || "Keine Kategorie";
        if (itemCat !== category) return false;
      }

      // Time range filter
      if (timeRange === "year") {
        if (!tItem.date || tItem.date < `${currentYear}-01-01`) return false;
      } else if (timeRange === "last_year") {
        if (
          !tItem.date ||
          tItem.date < `${currentYear - 1}-01-01` ||
          tItem.date > `${currentYear - 1}-12-31`
        )
          return false;
      } else if (timeRange === "month") {
        if (!tItem.date || tItem.date < `${currentYear}-${currentMonth}-01`) return false;
      }

      return true;
    });
  }, [transactions, category, timeRange]);

  // 2. Filter items by Category
  const filteredItems = useMemo(() => {
    if (category === "all") return items;
    return items.filter((i) => i.category === category);
  }, [items, category]);

  // 3. Compute Financial KPIs
  const stats = useMemo(() => {
    let totalExpenses = 0;
    let totalRevenue = 0;
    let periodSolds = 0;
    const categoryStats: Record<string, { revenue: number; expense: number; count: number }> = {};

    filteredTransactions.forEach((tx) => {
      const cat = getItemData(tx)?.category || "Keine Kategorie";
      if (!categoryStats[cat]) categoryStats[cat] = { revenue: 0, expense: 0, count: 0 };

      const amt = Number(tx.amount);
      if (tx.type === "Einkauf" || tx.type === "Reparaturkosten" || tx.type === "Werkzeuge/Sonstiges") {
        totalExpenses += amt;
        categoryStats[cat].expense += amt;
      } else if (tx.type === "Verkauf") {
        totalRevenue += amt;
        periodSolds++;
        categoryStats[cat].revenue += amt;
        categoryStats[cat].count++;
      }
    });

    const netProfit = totalRevenue - totalExpenses;
    const avgProfitPerItem = periodSolds > 0 ? netProfit / periodSolds : 0;
    const roiPercentage = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;

    const topCategories = Object.entries(categoryStats)
      .map(([name, s]) => ({
        name,
        profit: s.revenue - s.expense,
        margin: s.revenue > 0 ? ((s.revenue - s.expense) / s.revenue) * 100 : 0,
        solds: s.count,
      }))
      .filter((c) => c.profit > 0 || c.solds > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 4);

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      avgProfitPerItem,
      roiPercentage,
      topCategories,
    };
  }, [filteredTransactions]);

  // 4. Compute Inventory Metrics & Days to Sell
  const inventoryStats = useMemo(() => {
    const itemsCount = filteredItems.length;
    const soldItems = filteredItems.filter(
      (i) =>
        i.status.includes("Verkauft") ||
        i.status.includes("Versendet") ||
        i.status.includes("Angekommen") ||
        i.status.includes("Reklamation")
    );
    const soldCount = soldItems.length;
    const toShipCount = filteredItems.filter((i) => i.status === "Verkauft (Muss versendet werden)").length;
    const inStockItems = filteredItems.filter((i) => i.status === "Auf Lager" || i.status === "In Reparatur");

    // Average days to sell
    let totalDaysToSell = 0;
    let itemsSoldWithDates = 0;

    soldItems.forEach((item) => {
      const saleTx = transactions.find((t) => t.item_id === item.id && t.type === "Verkauf");
      const buyTx = transactions.find((t) => t.item_id === item.id && t.type === "Einkauf");

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

    // Stock value
    const inStockIds = new Set(inStockItems.map((i) => i.id));
    let stockValue = 0;
    stockTxs.forEach((tx) => {
      if (tx.item_id && inStockIds.has(tx.item_id)) {
        stockValue += Number(tx.amount);
      }
    });

    return {
      itemsCount,
      soldCount,
      toShipCount,
      inStockCount: itemsCount - soldCount,
      avgDaysToSell,
      stockValue,
    };
  }, [filteredItems, transactions, stockTxs]);

  // 5. Recent Transactions
  const recentTxs = useMemo(() => {
    return [...filteredTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [filteredTransactions]);

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header bar with Apple typography & Instant Segmented controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
            {t("dashboard.desc")}
          </p>
        </div>
        
        {/* Instant Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <div className="relative inline-flex items-center">
            <Tag className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.15] rounded-xl pl-8.5 pr-8 py-1.5 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
            >
              <option value="all">{t("filter.category.all")}</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none transition-transform" />
          </div>

          {/* Time Segmented Control */}
          <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900/80 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-md">
            {timeOptions.map((opt) => {
              const isActive = timeRange === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTimeRange(opt.value)}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none ${
                    isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTimeSegmentClient"
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className="absolute inset-0 rounded-lg bg-zinc-800/90 border border-white/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
                    />
                  )}
                  <span className="relative z-10">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <AppleKpiCard
          title={t("dashboard.revenue.title")}
          value={`€${stats.totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4.5 w-4.5 text-emerald-400" />}
          iconBg="bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
          accentGlow="from-emerald-500/10 via-transparent to-transparent"
          trend={t("dashboard.revenue.trend")}
          trendColor="text-emerald-400"
        />
        <AppleKpiCard
          title={t("dashboard.expenses.title")}
          value={`€${stats.totalExpenses.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowDownRight className="h-4.5 w-4.5 text-rose-400" />}
          iconBg="bg-rose-500/15 border-rose-500/30 text-rose-400"
          accentGlow="from-rose-500/10 via-transparent to-transparent"
          trend={t("dashboard.expenses.trend")}
          trendColor="text-rose-400"
        />
        <AppleKpiCard
          title={t("dashboard.profit.title")}
          value={`€${stats.netProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}`}
          icon={<ArrowUpRight className="h-4.5 w-4.5 text-blue-400" />}
          iconBg="bg-blue-500/15 border-blue-500/30 text-blue-400"
          accentGlow="from-blue-500/10 via-transparent to-transparent"
          trend={t("dashboard.profit.trend")}
          trendColor={stats.netProfit >= 0 ? "text-blue-400" : "text-rose-400"}
          highlight={stats.netProfit >= 0}
        />
        <AppleKpiCard
          title={t("dashboard.roi.title")}
          value={`${stats.roiPercentage.toFixed(1)}%`}
          icon={<TrendingUp className="h-4.5 w-4.5 text-amber-400" />}
          iconBg="bg-amber-500/15 border-amber-500/30 text-amber-400"
          accentGlow="from-amber-500/10 via-transparent to-transparent"
          trend={t("dashboard.roi.trend", { amount: stats.avgProfitPerItem.toFixed(2) })}
          trendColor="text-amber-400"
        />
      </div>

      {/* Cashflow Chart */}
      <div className="apple-card p-6 sm:p-7 relative overflow-hidden">
        <div className="apple-card-glow" />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {t("dashboard.cashflow.title")}
              </h3>
              <p className="text-xs text-zinc-400 font-normal">{t("dashboard.cashflow.desc")}</p>
            </div>
          </div>
        </div>
        <DashboardChart transactions={filteredTransactions} />
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
                  {t("dashboard.categories.title")}
                </h3>
              </div>
            </div>
            
            <div className="space-y-3.5 mb-6">
              {stats.topCategories.length > 0 ? (
                stats.topCategories.map((cat, idx) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors"
                  >
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
                        {t("dashboard.categories.sales", { count: cat.solds })} •{" "}
                        {t("dashboard.categories.margin", { margin: cat.margin.toFixed(1) })}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-500 text-center py-6">
                  {t("dashboard.categories.empty")}
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
                  <div className="text-xs font-medium text-zinc-300">{t("dashboard.days.title")}</div>
                  <div className="text-[11px] text-zinc-500">{t("dashboard.days.desc")}</div>
                </div>
              </div>
              <div className="text-lg font-bold text-white font-mono tabular-nums">
                {inventoryStats.avgDaysToSell}{" "}
                <span className="text-xs font-normal text-zinc-400">{t("dashboard.days.unit")}</span>
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
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white tracking-tight">
                  {t("dashboard.activity.title")}
                </h3>
              </div>
              <Link href="/transactions" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {t("dashboard.activity.viewAll")} →
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentTxs.length > 0 ? (
                recentTxs.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_8px] ${
                          tx.type === "Verkauf"
                            ? "bg-emerald-400 shadow-emerald-400/50"
                            : tx.type === "Einkauf"
                            ? "bg-rose-400 shadow-rose-400/50"
                            : "bg-amber-400 shadow-amber-400/50"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 truncate">
                          {tx.type === "Werkzeuge/Sonstiges"
                            ? t("dashboard.activity.expense")
                            : getItemData(tx)?.name || t("dashboard.activity.unknown")}
                        </p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {tx.type === "Verkauf"
                            ? t("dashboard.tx.sell")
                            : tx.type === "Einkauf"
                            ? t("dashboard.tx.buy")
                            : tx.type === "Reparaturkosten"
                            ? t("dashboard.tx.repair")
                            : t("dashboard.tx.other")}{" "}
                          • {new Date(tx.date).toLocaleDateString("de-DE")}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold shrink-0 ml-3 font-mono tabular-nums ${
                        tx.type === "Verkauf" ? "text-emerald-400" : "text-zinc-300"
                      }`}
                    >
                      {tx.type === "Verkauf" ? "+" : "-"}€
                      {Number(tx.amount).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-zinc-500 text-center py-6">{t("dashboard.activity.empty")}</div>
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
                  {t("dashboard.logistics.title")}
                </h3>
              </div>
              <Link href="/inventory" className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                {t("dashboard.logistics.open")} →
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Wallet className="h-3 w-3 text-blue-400" /> {t("dashboard.logistics.value")}
                </span>
                <span className="text-lg font-bold text-white font-mono tabular-nums">
                  €{inventoryStats.stockValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] text-center flex flex-col items-center justify-center">
                <span className="text-[11px] font-medium text-zinc-400 mb-1 flex items-center gap-1">
                  <Truck className="h-3 w-3 text-amber-400" /> {t("dashboard.logistics.ship")}
                </span>
                <span
                  className={`text-lg font-bold font-mono tabular-nums ${
                    inventoryStats.toShipCount > 0 ? "text-amber-400" : "text-zinc-400"
                  }`}
                >
                  {inventoryStats.toShipCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium">{t("dashboard.logistics.total")}</span>
                <span className="text-xs font-bold text-white font-mono">{inventoryStats.itemsCount}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium">{t("dashboard.logistics.sold")}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{inventoryStats.soldCount}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/40 px-3.5 py-2.5 rounded-xl border border-white/[0.04]">
                <span className="text-xs text-zinc-400 font-medium">{t("dashboard.logistics.stock")}</span>
                <span className="text-xs font-bold text-blue-400 font-mono">{inventoryStats.inStockCount}</span>
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
