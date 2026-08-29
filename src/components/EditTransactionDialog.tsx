"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, X, Receipt } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";

type Transaction = {
  id: string;
  amount: number;
  date: string;
  platform: string | null;
  notes: string | null;
  type: string;
  category?: string | null;
};

export function EditTransactionDialog({ 
  transaction, 
  categories 
}: { 
  transaction: Transaction,
  categories: string[]
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const rawAmount = formData.get("amount") as string;
    const platform = formData.get("platform") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;
    const category = formData.get("category") as string;
    const type = formData.get("type") as string;

    const cleanedAmount = rawAmount.replace(",", ".");
    const expenseAmount = parseFloat(cleanedAmount);

    if (isNaN(expenseAmount) || expenseAmount < 0) {
      setError(t("item.tx.error.amount"));
      setIsLoading(false);
      return;
    }

    try {
      const updateData: any = {
        amount: expenseAmount,
        platform: platform || null,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null,
        type: type,
      };

      if (category) {
        updateData.category = category;
      }

      const { error: txError } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transaction.id);

      if (txError) throw txError;

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(t("tx.edit.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <motion.button 
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        title={t("tx.edit.btn")}
      >
        <Edit2 className="h-3.5 w-3.5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/65 backdrop-blur-xl"
              onClick={() => !isLoading && setIsOpen(false)}
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 340 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-zinc-950/90 p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white tracking-tight">
                    {t("tx.edit.btn")}
                  </h3>
                </div>
                <button 
                  onClick={() => !isLoading && setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="amount" className="text-xs font-medium text-zinc-300">
                    {t("item.tx.amount")} <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500">€</span>
                    <input 
                      id="amount"
                      name="amount"
                      type="text" 
                      required
                      defaultValue={transaction.amount.toString().replace(".", ",")}
                      className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl pl-8 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono tabular-nums transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="type" className="text-xs font-medium text-zinc-300">
                    {t("item.tx.type")} <span className="text-rose-400">*</span>
                  </label>
                  <select 
                    id="type"
                    name="type"
                    required
                    defaultValue={transaction.type}
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                  >
                    <option value="Einkauf">{t("tx.type.buy") || "Einkauf"}</option>
                    <option value="Verkauf">{t("tx.type.sell") || "Verkauf"}</option>
                    <option value="Reparaturkosten">{t("tx.type.repair") || "Reparaturkosten"}</option>
                    <option value="Werkzeuge/Sonstiges">{t("tx.type.other") || "Werkzeuge/Sonstiges"}</option>
                  </select>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="text-xs font-medium text-zinc-300">
                      {t("item.form.category")}
                    </label>
                    <select 
                      id="category"
                      name="category"
                      defaultValue={transaction.category || ""}
                      className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
                    >
                      <option value="">{t("tx.add.category.none")}</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="platform" className="text-xs font-medium text-zinc-300">
                    {t("item.form.platform")}
                  </label>
                  <select 
                    id="platform"
                    name="platform"
                    defaultValue={transaction.platform || ""}
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all"
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

                <div className="space-y-1.5">
                  <label htmlFor="date" className="text-xs font-medium text-zinc-300">
                    {t("item.tx.date")}
                  </label>
                  <input 
                    id="date"
                    name="date"
                    type="date" 
                    defaultValue={transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ""}
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="notes" className="text-xs font-medium text-zinc-300">
                    {t("item.form.notes")}
                  </label>
                  <input 
                    id="notes"
                    name="notes"
                    type="text" 
                    defaultValue={transaction.notes || ""}
                    className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/[0.08] mt-6">
                  <button 
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition-colors"
                  >
                    {t("item.form.cancel")}
                  </button>
                  <motion.button 
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isLoading}
                    className="apple-button-primary text-white px-5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {t("item.tx.save")}
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
