"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { ChevronDown, Tag } from "lucide-react";

export function CategoryFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "all";
  const { t } = useLanguage();

  return (
    <div className="relative inline-flex items-center">
      <Tag className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
      <select
        value={currentCategory}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value !== "all") {
            params.set("category", e.target.value);
          } else {
            params.delete("category");
          }
          router.push(`/?${params.toString()}`);
        }}
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
  );
}
