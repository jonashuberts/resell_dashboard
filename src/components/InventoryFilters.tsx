"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition } from "react";
import { useLanguage } from "./LanguageContext";

export function InventoryFilters({ categories, statuses }: { categories: string[], statuses: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentStatus = searchParams.get("status") || "all";
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
      router.push(`/inventory?${params.toString()}`);
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
    <>
      <div className="relative flex-1 max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          placeholder={t("filter.search")} 
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>
      
      <select 
        value={currentCategory}
        onChange={(e) => updateFilters("category", e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        <option value="all">{t("filter.category.all")}</option>
        {categories.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select 
        value={currentStatus}
        onChange={(e) => updateFilters("status", e.target.value)}
        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
      >
        <option value="all">{t("filter.status.all")}</option>
        {statuses.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </>
  );
}
