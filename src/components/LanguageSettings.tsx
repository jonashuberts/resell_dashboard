"use client";

import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";
import { motion } from "motion/react";

export function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="apple-card p-6 sm:p-7 relative overflow-hidden shadow-xl mb-6 md:col-span-2">
      <div className="apple-card-glow" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">{t("settings.language.title")}</h3>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">{t("settings.language.desc")}</p>
          </div>
        </div>

        {/* Apple Segmented Language Picker */}
        <div className="inline-flex p-1 rounded-xl bg-zinc-900/90 border border-white/[0.08] shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setLanguage("de")}
            className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-colors focus:outline-none flex items-center gap-2 ${
              language === "de" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {language === "de" && (
              <motion.div
                layoutId="activeLangSegment"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-zinc-800 border border-white/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
              />
            )}
            <span className="relative z-10 text-sm">🇩🇪</span>
            <span className="relative z-10">{t("settings.language.de")}</span>
          </button>

          <button
            onClick={() => setLanguage("en")}
            className={`relative px-4 py-2 text-xs font-medium rounded-lg transition-colors focus:outline-none flex items-center gap-2 ${
              language === "en" ? "text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {language === "en" && (
              <motion.div
                layoutId="activeLangSegment"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-lg bg-zinc-800 border border-white/[0.12] shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]"
              />
            )}
            <span className="relative z-10 text-sm">🇬🇧</span>
            <span className="relative z-10">{t("settings.language.en")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
