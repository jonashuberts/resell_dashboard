"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { motion } from "motion/react";

export function TimeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = searchParams.get("range") || "all";
  const { t } = useLanguage();

  const options = [
    { value: "all", label: t("filter.time.all") },
    { value: "year", label: t("filter.time.year") },
    { value: "last_year", label: t("filter.time.last_year") },
    { value: "month", label: t("filter.time.month") },
  ];

  const handleSelect = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val !== "all") {
      params.set("range", val);
    } else {
      params.delete("range");
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-zinc-900/80 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {options.map((opt) => {
        const isActive = currentRange === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(opt.value)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none ${
              isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTimeSegment"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-zinc-800/90 border border-white/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
