"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

type NewItemFormProps = {
  categories: string[];
  statuses: string[];
  queryString?: string;
};

export function NewItemForm({ categories, statuses, queryString }: NewItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  
  const [isNewCategory, setIsNewCategory] = useState(categories.length === 0);
  
  const defaultStatus = statuses.includes("Bestellt") ? "Bestellt" : (statuses.includes("Auf Lager") ? "Auf Lager" : (statuses[0] || ""));
  const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
  const isSoldStatus = selectedStatus.includes("Verkauft") || selectedStatus.includes("Versendet") || selectedStatus.includes("Angekommen") || selectedStatus.includes("Reklamation");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    
    let category = formData.get("category_select") as string;
    if (isNewCategory) {
      category = formData.get("category_new") as string;
    }

    const status = formData.get("status") as string;
    const rawPrice = formData.get("price") as string;
    const platform = formData.get("platform") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    const rawSellPrice = formData.get("sell_price") as string;
    const sellDate = formData.get("sell_date") as string;

    if (!name || !category) {
      setError(t("item.form.error.required"));
      setIsLoading(false);
      return;
    }

    try {
      // 1. Insert Item
      const { data: itemData, error: itemError } = await supabase
        .from("items")
        .insert({
          name,
          category,
          status,
        })
        .select("id")
        .single();

      if (itemError) throw itemError;

      // 2. Insert Transaction if price is given
      if (rawPrice) {
        // Handle both dot and comma
        const cleanedPrice = rawPrice.replace(",", ".");
        const buyAmount = parseFloat(cleanedPrice);
        
        if (!isNaN(buyAmount) && buyAmount >= 0) {
          const { error: txError } = await supabase
            .from("transactions")
            .insert({
              item_id: itemData.id,
              type: "Einkauf",
              amount: buyAmount,
              platform: platform || null,
              date: date || new Date().toISOString().split('T')[0],
              notes: notes || "Initialer Einkauf",
            });
            
          if (txError) throw txError;
        }
      }

      // 3. Insert Sale Transaction if item is already sold and sell_price is given
      if (isSoldStatus && rawSellPrice) {
        const cleanedSellPrice = rawSellPrice.replace(",", ".");
        const sellAmount = parseFloat(cleanedSellPrice);

        if (!isNaN(sellAmount) && sellAmount >= 0) {
          const { error: sellTxError } = await supabase
            .from("transactions")
            .insert({
              item_id: itemData.id,
              type: "Verkauf",
              amount: sellAmount,
              platform: platform || null, // Assuming same platform as purchase or manual note
              date: sellDate || date || new Date().toISOString().split('T')[0],
              notes: "Direkt als verkauft eingetragen",
            });
            
          if (sellTxError) throw sellTxError;
        }
      }

      router.push(queryString ? `/inventory?${queryString}` : "/inventory");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("item.form.error.general"));
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            {t("item.form.name")} <span className="text-rose-500">*</span>
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            required
            placeholder={t("item.form.name.placeholder")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="flex items-center justify-between text-sm font-medium text-zinc-300">
            <span>{t("item.form.category")} <span className="text-rose-500">*</span></span>
            <button 
              type="button" 
              onClick={() => setIsNewCategory(!isNewCategory)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              {isNewCategory ? t("item.form.category.select") : t("item.form.category.new")}
            </button>
          </label>
          {isNewCategory ? (
            <input 
              id="category_new"
              name="category_new"
              type="text" 
              required={isNewCategory}
              placeholder={t("item.form.category.placeholder")}
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          ) : (
            <select 
              id="category_select"
              name="category_select"
              required={!isNewCategory}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-zinc-300">
            {t("item.form.status")} <span className="text-rose-500">*</span>
          </label>
          <select 
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-zinc-300">
            {t("item.form.buyPrice")} <span className="text-zinc-500 text-xs font-normal ml-1">{t("item.form.buyPrice.hint")}</span>
          </label>
          <input 
            id="price"
            name="price"
            type="text" 
            placeholder={t("item.form.placeholder.purchasePrice")}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="date" className="text-sm font-medium text-zinc-300">
            {t("item.form.buyDate")}
          </label>
          <input 
            id="date"
            name="date"
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-blue-500)_50%,transparent)]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="platform" className="text-sm font-medium text-zinc-300">
            {t("item.form.platform")}
          </label>
          <select 
            id="platform"
            name="platform"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-blue-500)_50%,transparent)] cursor-pointer"
          >
            <option value="">{t("item.form.platform.none")}</option>
            <option value="eBay Kleinanzeigen">eBay Kleinanzeigen</option>
            <option value="eBay">eBay</option>
            <option value="Amazon">Amazon</option>
            <option value="AliExpress">AliExpress</option>
            <option value="Vinted">Vinted</option>
            <option value="Privat">Privat</option>
          </select>
        </div>
      </div>

      {isSoldStatus && (
        <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-4 shadow-sm">
          <h4 className="text-sm font-medium text-emerald-400">{t("item.form.sellDetails")}</h4>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="sell_price" className="text-sm font-medium text-zinc-300">
                {t("item.form.sellPrice")} <span className="text-emerald-500">*</span> <span className="text-emerald-500/60 text-xs font-normal ml-1">{t("item.form.sellPrice.hint")}</span>
              </label>
              <input 
                id="sell_price"
                name="sell_price"
                type="text" 
                placeholder={t("item.form.placeholder.salePrice")}
                required={isSoldStatus}
                className="w-full bg-zinc-950 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="sell_date" className="text-sm font-medium text-zinc-300">
                {t("item.form.sellDate")}
              </label>
              <input 
                id="sell_date"
                name="sell_date"
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-zinc-950 border border-emerald-500/30 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[color-mix(in_oklab,var(--color-emerald-500)_50%,transparent)]"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium text-zinc-300">
          {t("item.form.notes")}
        </label>
        <textarea 
          id="notes"
          name="notes"
          rows={3}
          placeholder={t("item.form.notes.placeholder")}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
        />
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800">
        <Link 
          href={queryString ? `/inventory?${queryString}` : "/inventory"}
          className="px-5 py-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
        >
          {t("item.form.cancel")}
        </Link>
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("item.form.save")}
        </button>
      </div>

    </form>
  );
}
