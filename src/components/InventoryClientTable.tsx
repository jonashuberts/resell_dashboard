"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Tag, Activity, Package } from "lucide-react";
import { SellButton } from "./SellButton";
import { useLanguage } from "./LanguageContext";

type Item = {
  id: string;
  name: string;
  category: string;
  status: string;
  created_at: string;
};

export function InventoryClientTable({
  items,
  categories,
  statuses,
  catColorMap,
  statColorMap,
}: {
  items: Item[];
  categories: string[];
  statuses: string[];
  catColorMap: Record<string, string>;
  statColorMap: Record<string, string>;
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (status !== "all" && item.status !== status) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesCategory = item.category?.toLowerCase().includes(query);
        const matchesStatus = item.status?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesStatus) return false;
      }
      return true;
    });
  }, [items, search, category, status]);

  return (
    <div className="apple-card overflow-hidden shadow-2xl relative">
      <div className="apple-card-glow" />

      {/* Instant Filter Toolbar */}
      <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-950/40">
        <div className="flex flex-wrap items-center gap-3 w-full">
          {/* Instant Search Bar */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder={t("filter.search")}
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

          {/* Status Dropdown */}
          <div className="relative inline-flex items-center">
            <Activity className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
            >
              <option value="all">{t("filter.status.all")}</option>
              {statuses.map((s) => (
                <option key={s} value={s} className="bg-zinc-900 text-zinc-200">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {(search || category !== "all" || status !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("all");
                setStatus("all");
              }}
              className="text-[11px] text-zinc-400 hover:text-white transition-colors underline underline-offset-4"
            >
              {t("filter.reset", { count: filteredItems.length })}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="px-6 py-3.5">{t("inventory.table.name")}</th>
              <th className="px-6 py-3.5">{t("inventory.table.category")}</th>
              <th className="px-6 py-3.5">{t("inventory.table.status")}</th>
              <th className="px-6 py-3.5 text-right">{t("inventory.table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredItems.map((item) => {
              const isSold =
                item.status.includes("Verkauft") ||
                item.status.includes("Versendet") ||
                item.status.includes("Angekommen") ||
                item.status.includes("Reklamation");

              return (
                <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-medium text-xs sm:text-sm text-zinc-100 group-hover:text-white transition-colors">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        catColorMap[item.category] || "bg-zinc-800/80 text-zinc-300 border border-white/[0.08]"
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        statColorMap[item.status] || "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/inventory/${item.id}/edit`}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                      >
                        {t("inventory.table.details")}
                      </Link>
                      {!isSold && <SellButton item={{ id: item.id, name: item.name, status: item.status }} />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-xs text-zinc-500">
                  <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-zinc-900 flex items-center justify-center border border-white/[0.06] text-lg">
                    📦
                  </div>
                  {t("inventory.table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
