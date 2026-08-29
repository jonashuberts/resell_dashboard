"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, X, DollarSign, Tag, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
      // 1. Update item status
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
      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 transition-all shadow-[0_1px_4px_rgba(16,185,129,0.15)]"
      >
        {t("sell.button")}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/65 backdrop-blur-xl"
              onClick={() => !isLoading && setIsOpen(false)}
            />

            {/* Apple Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-zinc-950/90 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {t("sell.modal.title")}
                  </h3>
                </div>
                <button 
                  onClick={() => !isLoading && setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-3.5 mb-5 rounded-xl bg-zinc-900/50 border border-white/[0.06] text-xs text-zinc-300">
                <span className="text-zinc-400">{t("sell.modal.desc1")}</span> <strong className="text-white font-semibold">{item.name}</strong>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="price" className="text-xs font-medium text-zinc-300">
                    {t("sell.price")} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">€</span>
                    <input 
                      id="price"
                      name="price"
                      type="text" 
                      required
                      placeholder="250,00"
                      className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono tabular-nums transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="platform" className="text-xs font-medium text-zinc-300">
                    {t("sell.platform")}
                  </label>
                  <select 
                    id="platform"
                    name="platform"
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer transition-all"
                  >
                    <option value="">{t("sell.platform.none")}</option>
                    <option value="eBay Kleinanzeigen">eBay Kleinanzeigen</option>
                    <option value="eBay">eBay</option>
                    <option value="Amazon">Amazon</option>
                    <option value="Vinted">Vinted</option>
                    <option value="Privat">Privat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="date" className="text-xs font-medium text-zinc-300">
                    {t("sell.date")}
                  </label>
                  <input 
                    id="date"
                    name="date"
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-mono transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08] mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                  >
                    {t("sell.cancel")}
                  </button>
                  <motion.button 
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border border-white/20 shadow-[0_2px_10px_rgba(16,185,129,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {t("sell.submit")}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
