"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
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
      // Small timeout to allow the browser to process the first download properly
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <Download className="h-5 w-5 text-zinc-400" />
        <h3 className="text-lg font-medium text-white">{t("settings.export.title")}</h3>
      </div>
      
      <p className="text-sm text-zinc-400 mb-6">
        {t("settings.export.desc")}
      </p>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-100 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isExporting ? (
           <>
             <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
             {t("settings.export.loading")}
           </>
        ) : (
           <>
             <Download className="h-4 w-4 text-zinc-400" />
             {t("settings.export.btn")}
           </>
        )}
      </button>
    </div>
  );
}
