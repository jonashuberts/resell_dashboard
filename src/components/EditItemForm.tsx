"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";

type EditItemFormProps = {
  item: {
    id: string;
    name: string;
    category: string;
    status: string;
  };
  categories: string[];
  statuses: string[];
  queryString?: string;
};

export function EditItemForm({ item, categories, statuses, queryString }: EditItemFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();
  
  const [isNewCategory, setIsNewCategory] = useState(!categories.includes(item.category));

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

    if (!name || !category) {
      setError(t("item.form.error.required"));
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from("items")
        .update({
          name,
          category,
          status,
        })
        .eq("id", item.id);

      if (updateError) throw updateError;

      router.push(queryString ? `/inventory?${queryString}` : "/inventory");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("item.form.error.general"));
      setIsLoading(false);
    }
  }

  async function handleDeleteItem() {
    if (!window.confirm(t("item.edit.deleteConfirm"))) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await supabase.from("transactions").delete().eq("item_id", item.id);
      const { error: deleteError } = await supabase.from("items").delete().eq("id", item.id);
      if (deleteError) throw deleteError;

      router.push(queryString ? `/inventory?${queryString}` : "/inventory");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(t("item.edit.deleteError"));
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="apple-card p-6 space-y-5 relative overflow-hidden shadow-xl">
      <div className="apple-card-glow" />

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium text-zinc-300">
            {t("item.form.name")} <span className="text-rose-400">*</span>
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            defaultValue={item.name}
            required
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Category */}
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
              defaultValue={!categories.includes(item.category) ? item.category : ""}
              required={isNewCategory}
              autoFocus
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          ) : (
            <select 
              id="category_select"
              name="category_select"
              defaultValue={item.category}
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
            defaultValue={item.status}
            className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer transition-all"
          >
            {statuses.map(s => (
              <option key={s} value={s} className="bg-zinc-900 text-zinc-200">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-2.5 border-t border-white/[0.08]">
        <motion.button 
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading}
          className="apple-button-primary w-full text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {t("item.edit.save")}
        </motion.button>
        
        <Link 
          href={queryString ? `/inventory?${queryString}` : "/inventory"}
          className="apple-button-secondary w-full px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white text-center transition-colors"
        >
          {t("item.form.cancel")}
        </Link>
        
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={handleDeleteItem}
          disabled={isLoading}
          className="w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-center flex items-center justify-center gap-1.5 mt-1"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t("item.edit.delete")}
        </motion.button>
      </div>
    </form>
  );
}
