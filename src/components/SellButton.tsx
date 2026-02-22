"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

type SellButtonProps = {
  item: {
    id: string;
    name: string;
    status: string;
  };
};

export function SellButton({ item }: SellButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // If item is already sold or further along the lifecycle, don't show the sell button
  const lifecycleFinished = 
    item.status.includes("Verkauft") || 
    item.status.includes("Versendet") || 
    item.status.includes("Angekommen") ||
    item.status.includes("Reklamation");

  if (lifecycleFinished) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rawPrice = formData.get("price") as string;
    const platform = formData.get("platform") as string;
    const date = formData.get("date") as string;

    const cleanedPrice = rawPrice.replace(",", ".");
    const sellAmount = parseFloat(cleanedPrice);

    if (isNaN(sellAmount) || sellAmount < 0) {
      setError(t("sell.error.amount"));
      setIsLoading(false);
      return;
    }

    try {
      // 1. Update the item status
      const { error: updateError } = await supabase
        .from("items")
        .update({ status: "Verkauft (Muss versendet werden)" })
        .eq("id", item.id);

      if (updateError) throw updateError;

      // 2. Create the sell transaction
      const { error: txError } = await supabase
        .from("transactions")
        .insert({
          item_id: item.id,
          type: "Verkauf",
          amount: sellAmount,
          platform: platform || null,
          date: date || new Date().toISOString().split('T')[0],
        });

      if (txError) throw txError;

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(t("sell.error.process"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-emerald-500 hover:text-emerald-400 font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {t("sell.button")}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isLoading && setIsOpen(false)}
          />
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            
            <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
              <h3 className="text-xl font-bold text-white">
                {t("sell.modal.title")}
              </h3>
              <button 
                onClick={() => !isLoading && setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
              {t("sell.modal.desc1")} <strong className="text-white">{item.name}</strong><br />
              {t("sell.modal.desc2")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium text-zinc-300">
                  {t("sell.price")} <span className="text-rose-500">*</span>
                </label>
                <input 
                  id="price"
                  name="price"
                  type="text" 
                  required
                  placeholder="250,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="platform" className="text-sm font-medium text-zinc-300">
                  {t("sell.platform")}
                </label>
                <select 
                  id="platform"
                  name="platform"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
                >
                  <option value="">{t("sell.platform.none")}</option>
                  <option value="eBay Kleinanzeigen">eBay Kleinanzeigen</option>
                  <option value="eBay">eBay</option>
                  <option value="Amazon">Amazon</option>
                  <option value="Vinted">Vinted</option>
                  <option value="Privat">Privat</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium text-zinc-300">
                  {t("sell.date")}
                </label>
                <input 
                  id="date"
                  name="date"
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 border-[color-mix(in_oklab,var(--color-emerald-500)_50%,transparent)]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {t("sell.cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("sell.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
