"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, useTransition } from "react";
import { useLanguage } from "./LanguageContext";
import { Search, ChevronDown, Tag, Activity, X } from "lucide-react";

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

  const clearSearch = () => {
    setSearchValue("");
    updateFilters("search", "");
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Apple-style Search Bar */}
      <div className="relative flex-1 min-w-[220px] max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        <input 
          type="text" 
          placeholder={t("filter.search")} 
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-9.5 pr-8 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
        />
        {searchValue && (
          <button 
            type="button" 
            onClick={clearSearch}
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
          value={currentCategory}
          onChange={(e) => updateFilters("category", e.target.value)}
          className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
        >
          <option value="all">{t("filter.category.all")}</option>
          {categories.map(c => (
            <option key={c} value={c} className="bg-zinc-900 text-zinc-200">{c}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </div>

      {/* Status Dropdown */}
      <div className="relative inline-flex items-center">
        <Activity className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
        <select 
          value={currentStatus}
          onChange={(e) => updateFilters("status", e.target.value)}
          className="appearance-none bg-zinc-900/80 border border-white/[0.08] hover:border-white/[0.14] rounded-xl pl-8.5 pr-8 py-2 text-xs font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer backdrop-blur-md shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] transition-all"
        >
          <option value="all">{t("filter.status.all")}</option>
          {statuses.map(s => (
            <option key={s} value={s} className="bg-zinc-900 text-zinc-200">{s}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}
