"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Edit2, X } from "lucide-react";
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
      <button 
        onClick={() => setIsOpen(true)}
        className="text-zinc-400 hover:text-blue-400 p-1 rounded transition-colors"
        title={t("tx.edit.btn")}
      >
        <Edit2 className="h-4 w-4" />
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
                {t("tx.edit.btn")}
              </h3>
              <button 
                onClick={() => !isLoading && setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-zinc-300">
                  {t("item.tx.amount")} <span className="text-rose-500">*</span>
                </label>
                <input 
                  id="amount"
                  name="amount"
                  type="text" 
                  required
                  defaultValue={transaction.amount.toString().replace(".", ",")}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="type" className="text-sm font-medium text-zinc-300">
                  {t("item.tx.type")} <span className="text-rose-500">*</span>
                </label>
                <select 
                  id="type"
                  name="type"
                  required
                  defaultValue={transaction.type}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                >
                  <option value="Einkauf">{t("tx.type.buy") || "Einkauf"}</option>
                  <option value="Verkauf">{t("tx.type.sell") || "Verkauf"}</option>
                  <option value="Reparaturkosten">{t("tx.type.repair") || "Reparaturkosten"}</option>
                  <option value="Werkzeuge/Sonstiges">{t("tx.type.other") || "Werkzeuge/Sonstiges"}</option>
                </select>
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-zinc-300">
                    {t("item.form.category")}
                  </label>
                  <select 
                    id="category"
                    name="category"
                    defaultValue={transaction.category || ""}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                  >
                    <option value="">{t("tx.add.category.none")}</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="platform" className="text-sm font-medium text-zinc-300">
                  {t("item.form.platform")}
                </label>
                <select 
                  id="platform"
                  name="platform"
                  defaultValue={transaction.platform || ""}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
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

              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium text-zinc-300">
                  {t("item.tx.date")}
                </label>
                <input 
                  id="date"
                  name="date"
                  type="date" 
                  defaultValue={transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : ""}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border-[color-mix(in_oklab,var(--color-blue-500)_50%,transparent)]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-zinc-300">
                  {t("item.form.notes")}
                </label>
                <input 
                  id="notes"
                  name="notes"
                  type="text" 
                  defaultValue={transaction.notes || ""}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  {t("item.form.cancel")}
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("item.tx.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
