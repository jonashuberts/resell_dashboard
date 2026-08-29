"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { motion } from "motion/react";
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

      // 3. Insert Sale Transaction if item is already sold
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
              platform: platform || null,
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
    <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
      <div className="apple-card-glow" />

      {error && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Item Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium text-zinc-300">
            {t("item.form.name")} <span className="text-rose-400">*</span>
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            required
            placeholder={t("item.form.name.placeholder")}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-300">
            <span>{t("item.form.category")} <span className="text-rose-400">*</span></span>
            <button 
              type="button" 
              onClick={() => setIsNewCategory(!isNewCategory)}
              className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
            >
              {isNewCategory ? t("item.form.category.select") : t("item.form.category.new")}
            </button>
          </div>
          {isNewCategory ? (
            <input 
              id="category_new"
              name="category_new"
              type="text" 
              required={isNewCategory}
              placeholder={t("item.form.category.placeholder")}
              autoFocus
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          ) : (
            <select 
              id="category_select"
              name="category_select"
              required={!isNewCategory}
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer transition-all"
            >
              {categories.map(c => (
                <option key={c} value={c} className="bg-zinc-900 text-zinc-200">{c}</option>
              ))}
            </select>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label htmlFor="status" className="text-xs font-medium text-zinc-300">
            {t("item.form.status")} <span className="text-rose-400">*</span>
          </label>
          <select 
            id="status"
            name="status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer transition-all"
          >
            {statuses.map(s => (
              <option key={s} value={s} className="bg-zinc-900 text-zinc-200">{s}</option>
            ))}
          </select>
        </div>

        {/* Buy Price */}
        <div className="space-y-1.5">
          <label htmlFor="price" className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span>{t("item.form.buyPrice")}</span>
            <span className="text-zinc-500 text-[11px] font-normal">{t("item.form.buyPrice.hint")}</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">€</span>
            <input 
              id="price"
              name="price"
              type="text" 
              placeholder={t("item.form.placeholder.purchasePrice")}
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono tabular-nums transition-all"
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-xs font-medium text-zinc-300">
            {t("item.form.buyDate")}
          </label>
          <input 
            id="date"
            name="date"
            type="date" 
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono transition-all"
          />
        </div>

        {/* Purchase Platform */}
        <div className="space-y-1.5">
          <label htmlFor="platform" className="text-xs font-medium text-zinc-300">
            {t("item.form.platform")}
          </label>
          <select 
            id="platform"
            name="platform"
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer transition-all"
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

      {/* Direct Sale Info Box (if status is sold) */}
      {isSoldStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-3">
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {t("item.form.sellDetails")}
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="sell_price" className="text-xs font-medium text-zinc-300">
                {t("item.form.sellPrice")} <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">€</span>
                <input 
                  id="sell_price"
                  name="sell_price"
                  type="text" 
                  placeholder={t("item.form.placeholder.salePrice")}
                  required={isSoldStatus}
                  className="w-full bg-zinc-950 border border-emerald-500/30 rounded-xl pl-8 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono tabular-nums transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="sell_date" className="text-xs font-medium text-zinc-300">
                {t("item.form.sellDate")}
              </label>
              <input 
                id="sell_date"
                name="sell_date"
                type="date" 
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-zinc-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-xs font-medium text-zinc-300">
          {t("item.form.notes")}
        </label>
        <textarea 
          id="notes"
          name="notes"
          rows={3}
          placeholder={t("item.form.notes.placeholder")}
          className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-y transition-all"
        />
      </div>

      {/* Actions */}
      <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08]">
        <Link 
          href={queryString ? `/inventory?${queryString}` : "/inventory"}
          className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
        >
          {t("item.form.cancel")}
        </Link>
        <motion.button 
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="apple-button-primary text-white px-5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t("item.form.save")}
        </motion.button>
      </div>
    </form>
  );
}
