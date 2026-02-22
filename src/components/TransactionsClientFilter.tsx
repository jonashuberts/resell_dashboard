"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useEffect, useRef, useTransition } from "react";
import { useLanguage } from "./LanguageContext";

export function TransactionsClientFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();
  
  const currentType = searchParams.get("type") || "all";
  const currentCategory = searchParams.get("category") || "all";
  const currentSearch = searchParams.get("search") || "";

  const [searchValue, setSearchValue] = useState(currentSearch);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  };

  useEffect(() => {
    if (!timeoutRef.current) {
      setSearchValue(currentSearch);
    }
  }, [currentSearch]);

  const handleSearchChange = (val: string) => {
    setSearchValue(val);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      updateFilters("search", val);
      timeoutRef.current = null;
    }, 300);
  };

  return (
    <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center gap-4">
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input 
          type="text" 
          placeholder={t("tx.filter.search")}
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
      </div>
      <select 
        value={currentCategory}
        onChange={(e) => updateFilters("category", e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
      >
        <option value="all">{t("filter.category.all")}</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select 
        value={currentType}
        onChange={(e) => updateFilters("type", e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
      >
        <option value="all">{t("tx.filter.type.all")}</option>
        <option value="Einkauf">{t("tx.type.buy")}</option>
        <option value="Verkauf">{t("tx.type.sell")}</option>
        <option value="Reparaturkosten">{t("tx.type.repair")}</option>
        <option value="Werkzeuge/Sonstiges">{t("tx.type.other")}</option>
      </select>
    </div>
  );
}
