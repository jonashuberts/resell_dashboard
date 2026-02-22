"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "./LanguageContext";

export function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "all";
  const { t } = useLanguage();

  return (
    <select
      value={currentRange}
      onChange={(e) => {
        router.push(`/?range=${e.target.value}`);
      }}
      className="bg-zinc-900 border border-zinc-800 rounded-lg pl-4 pr-10 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-no-repeat bg-[position:right_10px_center]"
    >
      <option value="all">{t("filter.time.all")}</option>
      <option value="year">{t("filter.time.year")}</option>
      <option value="last_year">{t("filter.time.last_year")}</option>
      <option value="month">{t("filter.time.month")}</option>
    </select>
  );
}
