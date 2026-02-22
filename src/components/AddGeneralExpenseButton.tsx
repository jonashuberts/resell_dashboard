"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, X } from "lucide-react";
import { useLanguage } from "./LanguageContext";

export function AddGeneralExpenseButton({ categories = [] }: { categories?: string[] }) {
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

    const cleanedAmount = rawAmount.replace(",", ".");
    const expenseAmount = parseFloat(cleanedAmount);

    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setError(t("item.tx.error.amount"));
      setIsLoading(false);
      return;
    }

    try {
      const insertData: any = {
        item_id: null,
        type: "Werkzeuge/Sonstiges",
        amount: expenseAmount,
        platform: platform || null,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null,
      };

      if (category) {
        insertData.category = category;
      }

      const { error: txError } = await supabase
        .from("transactions")
        .insert(insertData);

      if (txError) throw txError;

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(t("tx.add.error"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
      >
        <Plus className="h-4 w-4" />
        {t("tx.add.btn")}
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
                {t("tx.add.title")}
              </h3>
              <button 
                onClick={() => !isLoading && setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-zinc-400 text-sm mb-6">
              {t("tx.add.desc")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="notes" className="text-sm font-medium text-zinc-300">
                  {t("item.form.notes")} <span className="text-rose-500">*</span>
                </label>
                <input 
                  id="notes"
                  name="notes"
                  type="text" 
                  required
                  placeholder={t("tx.add.notes.placeholder")}
                  autoFocus
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="amount" className="text-sm font-medium text-zinc-300">
                  {t("item.tx.amount")} <span className="text-rose-500">*</span>
                </label>
                <input 
                  id="amount"
                  name="amount"
                  type="text" 
                  required
                  placeholder="25,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {categories.length > 0 && (
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-zinc-300">
                    {t("item.form.category")}
                  </label>
                  <select 
                    id="category"
                    name="category"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
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
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 cursor-pointer"
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
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 border-[color-mix(in_oklab,var(--color-violet-500)_50%,transparent)]"
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
                  className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("tx.add.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
