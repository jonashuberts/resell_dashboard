"use client";

import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSettings() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm mb-8 md:col-span-2">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Globe className="h-6 w-6 text-blue-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium text-white mb-1">{t("settings.language.title")}</h3>
          <p className="text-sm text-zinc-400 mb-4">{t("settings.language.desc")}</p>
          
          <div className="flex gap-4">
            <button
              onClick={() => setLanguage("de")}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                language === "de"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              🇩🇪 {t("settings.language.de")}
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                language === "en"
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-zinc-900 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              }`}
            >
              🇬🇧 {t("settings.language.en")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
