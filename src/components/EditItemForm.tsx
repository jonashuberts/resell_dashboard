"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
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
  
  // If the item's category somehow isn't in our list (rare), we default to new
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
      // Delete transactions first
      await supabase.from("transactions").delete().eq("item_id", item.id);
      
      // Delete item
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-zinc-300">
            {t("item.form.name")} <span className="text-rose-500">*</span>
          </label>
          <input 
            id="name"
            name="name"
            type="text" 
            defaultValue={item.name}
            required
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
              defaultValue={!categories.includes(item.category) ? item.category : ""}
              required={isNewCategory}
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />          ) : (
            <select 
              id="category_select"
              name="category_select"
              defaultValue={item.category}
              required={!isNewCategory}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-2 pb-4">
          <label htmlFor="status" className="text-sm font-medium text-zinc-300">
            {t("item.form.status")} <span className="text-rose-500">*</span>
          </label>
          <select 
            id="status"
            name="status"
            defaultValue={item.status}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3 border-t border-zinc-800">
        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("item.edit.save")}
        </button>
        
        <Link 
          href={queryString ? `/inventory?${queryString}` : "/inventory"}
          className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-5 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:text-white transition-colors text-center"
        >
          {t("item.form.cancel")}
        </Link>
        
        <button
          type="button"
          onClick={handleDeleteItem}
          disabled={isLoading}
          className="w-full text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-center mt-2"
        >
          {t("item.edit.delete")}
        </button>
      </div>

    </form>
  );
}
