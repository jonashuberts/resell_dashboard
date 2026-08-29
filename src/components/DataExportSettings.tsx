"use client";

import { useState } from "react";
import { Download, Loader2, Database } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "./LanguageContext";
import { supabase } from "@/lib/supabase";

export function DataExportSettings() {
  const { t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      // 1. Fetch Items
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // 2. Fetch Transactions
      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (txError) throw txError;

      // 3. Convert Items to CSV
      const itemsHeaders = ["id", "name", "category", "status", "purchase_price", "purchase_date", "platform", "sell_price", "sell_date", "created_at"];
      const itemsCsv = [
        itemsHeaders.join(","),
        ...(items || []).map(item => 
          itemsHeaders.map(header => JSON.stringify(item[header] ?? "")).join(",")
        )
      ].join("\n");

      // 4. Convert Transactions to CSV
      const txHeaders = ["id", "item_id", "type", "amount", "date", "notes", "created_at"];
      const txCsv = [
        txHeaders.join(","),
        ...(transactions || []).map(tx => 
          txHeaders.map(header => JSON.stringify(tx[header] ?? "")).join(",")
        )
      ].join("\n");

      // 5. Trigger Downloads
      const downloadFile = (content: string, filename: string) => {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      const dateStr = new Date().toISOString().split('T')[0];
      downloadFile(itemsCsv, `resell_items_backup_${dateStr}.csv`);
      setTimeout(() => {
        downloadFile(txCsv, `resell_transactions_backup_${dateStr}.csv`);
        setIsExporting(false);
      }, 500);

    } catch (error) {
      console.error("Export failed:", error);
      alert(t("settings.export.error"));
      setIsExporting(false);
    }
  }

  return (
    <div className="apple-card p-6 sm:p-7 relative overflow-hidden shadow-xl md:col-span-2">
      <div className="apple-card-glow" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">{t("settings.export.title")}</h3>
            <p className="text-xs text-zinc-400 font-normal mt-0.5 max-w-xl">{t("settings.export.desc")}</p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleExport}
          disabled={isExporting}
          className="apple-button-secondary px-5 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isExporting ? (
             <>
               <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
               {t("settings.export.loading")}
             </>
          ) : (
             <>
               <Download className="h-3.5 w-3.5 text-zinc-300" />
               {t("settings.export.btn")}
             </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
