"use client";

import { useState, useMemo } from "react";
import { Search, X, Tag, Activity } from "lucide-react";
import { EditTransactionDialog } from "./EditTransactionDialog";
import { useLanguage } from "./LanguageContext";

type Transaction = {
  id: string;
  item_id: string | null;
  date: string;
  type: string;
  platform: string | null;
  amount: number;
  notes: string | null;
  category?: string | null;
  items?: {
    name: string;
    category: string;
  } | null;
};

export function TransactionsClientTable({
  transactions,
  categories,
}: {
  transactions: Transaction[];
  categories: string[];
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const effectiveCategory = item.items?.category || item.category;
      if (category !== "all" && effectiveCategory !== category) return false;
      if (type !== "all" && item.type !== type) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.items?.name?.toLowerCase().includes(query);
        const matchesType = item.type?.toLowerCase().includes(query);
        const matchesNotes = item.notes?.toLowerCase().includes(query);
        const matchesPlatform = item.platform?.toLowerCase().includes(query);
        const matchesCat = effectiveCategory?.toLowerCase().includes(query);
        if (!matchesName && !matchesType && !matchesNotes && !matchesPlatform && !matchesCat) return false;
      }
      return true;
    });
  }, [transactions, search, category, type]);

  return (
    <div className="apple-card overflow-hidden shadow-2xl relative">
      <div className="apple-card-glow" />

      {/* Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-950/40">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("tx.filter.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-9.5 pr-8 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative inline-flex items-center">
            <Tag className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
            >
              <option value="all">{t("filter.category.all")}</option>
              {categories.map((c) => (
                <option key={c} value={c} className="bg-zinc-900 text-zinc-200">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="relative inline-flex items-center">
            <Activity className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
            >
              <option value="all">{t("tx.filter.type.all")}</option>
              <option value="Einkauf" className="bg-zinc-900 text-zinc-200">
                {t("tx.type.buy")}
              </option>
              <option value="Verkauf" className="bg-zinc-900 text-zinc-200">
                {t("tx.type.sell")}
              </option>
              <option value="Reparaturkosten" className="bg-zinc-900 text-zinc-200">
                {t("tx.type.repair")}
              </option>
              <option value="Werkzeuge/Sonstiges" className="bg-zinc-900 text-zinc-200">
                {t("tx.type.other")}
              </option>
            </select>
          </div>

          {(search || category !== "all" || type !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setType("all");
              }}
              className="text-[11px] text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
              Filter zurücksetzen ({filteredTransactions.length} Treffer)
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="px-6 py-3.5">{t("tx.table.date")}</th>
              <th className="px-6 py-3.5">{t("tx.table.itemNote")}</th>
              <th className="px-6 py-3.5">{t("tx.table.typePlatform")}</th>
              <th className="px-6 py-3.5 text-right">{t("tx.table.amount")}</th>
              <th className="px-6 py-3.5 text-right">{t("tx.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTransactions.map((tItem) => {
              const effectiveCategory = tItem.items?.category || tItem.category;
              return (
                <tr key={tItem.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                    {new Date(tItem.date).toLocaleDateString("de-DE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {tItem.items?.name ? (
                        <span className="font-medium text-xs sm:text-sm text-zinc-100">{tItem.items.name}</span>
                      ) : (
                        <span className="text-xs text-zinc-300 font-medium">
                          {tItem.notes || <span className="text-zinc-500 italic">{t("tx.table.generalExpense")}</span>}
                        </span>
                      )}
                      {effectiveCategory && (
                        <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-white/[0.06]">
                          {effectiveCategory}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                          tItem.type === "Verkauf"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : tItem.type === "Einkauf"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : tItem.type === "Reparaturkosten"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {tItem.type}
                      </span>
                      {tItem.platform && <span className="text-[11px] text-zinc-400">via {tItem.platform}</span>}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-mono font-semibold text-xs sm:text-sm whitespace-nowrap tabular-nums ${
                      tItem.type === "Verkauf" ? "text-emerald-400" : "text-zinc-100"
                    }`}
                  >
                    {tItem.type === "Verkauf" ? "+" : "-"} €
                    {Number(tItem.amount).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditTransactionDialog transaction={tItem} categories={categories} />
                  </td>
                </tr>
              );
            })}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-xs text-zinc-500">
                  <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-zinc-900 flex items-center justify-center border border-white/[0.06] text-lg">
                    💳
                  </div>
                  {t("tx.table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
