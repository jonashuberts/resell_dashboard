"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Check, X, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "./LanguageContext";
import { ColorPicker, ColorOption } from "./ColorPicker";

type CategorySetting = {
  name: string;
  color: string;
  sort_order: number;
};

export function SettingsCategories({ initialCategories }: { initialCategories: CategorySetting[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isSaving, setIsSaving] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState("bg-zinc-800 text-zinc-300");
  const { t } = useLanguage();

  const colors: ColorOption[] = [
    { label: t("color.gray"), value: "bg-zinc-800 text-zinc-300", bgClass: "bg-zinc-500" },
    { label: t("color.blue"), value: "bg-blue-500/10 text-blue-400 border border-blue-500/20", bgClass: "bg-blue-500" },
    { label: t("color.green"), value: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", bgClass: "bg-emerald-500" },
    { label: t("color.yellow"), value: "bg-amber-500/10 text-amber-400 border border-amber-500/20", bgClass: "bg-amber-500" },
    { label: t("color.red"), value: "bg-rose-500/10 text-rose-400 border border-rose-500/20", bgClass: "bg-rose-500" },
    { label: t("color.purple"), value: "bg-violet-500/10 text-violet-400 border border-violet-500/20", bgClass: "bg-violet-500" },
  ];

  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName) return;

    setIsSaving(true);
    const newCat = { name: newCatName, color: newCatColor, sort_order: categories.length };
    
    const { error } = await supabase.from('category_settings').insert(newCat);
    if (!error) {
      setCategories([...categories, newCat]);
      setNewCatName("");
      router.refresh();
    }
    setIsSaving(false);
  }

  async function handleDelete(name: string) {
    if (!window.confirm(t("settings.cat.deleteConfirm"))) {
      return;
    }

    setIsSaving(true);
    
    // First, move all existing items out of this category
    await supabase.from('items').update({ category: 'Keine Kategorie' }).eq('category', name);
    
    // Then delete the category settings
    const { error } = await supabase.from('category_settings').delete().eq('name', name);
    if (!error) {
      setCategories(categories.filter(c => c.name !== name));
      router.refresh();
    } else {
      console.error("Error deleting category:", error);
      alert(t("settings.cat.error.delete"));
    }
    setIsSaving(false);
  }

  async function handleUpdateColor(name: string, newColor: string) {
    setIsSaving(true);
    const { error } = await supabase
      .from('category_settings')
      .update({ color: newColor })
      .eq('name', name);
      
    if (!error) {
      setCategories(categories.map(c => c.name === name ? { ...c, color: newColor } : c));
      router.refresh();
    }
    setIsSaving(false);
  }

  async function handleRename(oldName: string) {
    if (!editingValue || editingValue === oldName) {
      setEditingCatName(null);
      return;
    }
    
    setIsSaving(true);
    const oldCat = categories.find(c => c.name === oldName);
    if (!oldCat) return;

    const { error: insertError } = await supabase.from('category_settings').insert({
      name: editingValue,
      color: oldCat.color,
      sort_order: oldCat.sort_order
    });

    if (!insertError) {
      await supabase.from('items').update({ category: editingValue }).eq('category', oldName);
      await supabase.from('category_settings').delete().eq('name', oldName);
      
      setCategories(categories.map(c => c.name === oldName ? { ...c, name: editingValue } : c));
      router.refresh();
    } else {
      console.error(insertError);
      alert(t("settings.cat.error.rename"));
    }
    
    setEditingCatName(null);
    setIsSaving(false);
  }

  return (
    <div className="apple-card p-6 sm:p-7 relative overflow-hidden shadow-xl">
      <div className="apple-card-glow" />
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Tag className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-white tracking-tight">{t("settings.cat.title")}</h3>
      </div>
      <p className="text-xs text-zinc-400 mb-5 font-normal">
        {t("settings.cat.desc")}
      </p>

      {/* Category List */}
      <div className="space-y-2.5 mb-6">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors">
            <div className="flex items-center gap-3 w-full">
              {editingCatName === cat.name ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="bg-zinc-950 border border-white/[0.15] rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-[130px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(cat.name);
                      if (e.key === 'Escape') setEditingCatName(null);
                    }}
                  />
                  <button 
                    onClick={() => handleRename(cat.name)}
                    className="text-emerald-400 hover:text-emerald-300 p-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setEditingCatName(null)}
                    className="text-zinc-500 hover:text-zinc-400 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${cat.color} min-w-[100px] justify-center shadow-sm`}
                  onClick={() => {
                    setEditingCatName(cat.name);
                    setEditingValue(cat.name);
                  }}
                  title={t("settings.cat.renameHint")}
                >
                  {cat.name}
                </span>
              )}
              
              <ColorPicker 
                colors={colors}
                value={cat.color}
                disabled={isSaving}
                onChange={(val) => handleUpdateColor(cat.name, val)}
              />
            </div>
            <button 
              onClick={() => handleDelete(cat.name)}
              disabled={isSaving}
              className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ml-2"
              title={t("settings.cat.deleteHint")}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-xs text-zinc-500 py-4 text-center">{t("settings.cat.empty")}</div>
        )}
      </div>

      {/* Add Category Form */}
      <form onSubmit={handleAdd} className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">{t("settings.cat.newName")}</label>
            <input 
              type="text" 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder={t("settings.cat.placeholder")}
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!newCatName || isSaving}
            className="apple-button-primary text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 h-[38px] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {t("settings.addBtn")}
          </motion.button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">{t("settings.cat.design")}</label>
          <ColorPicker 
            colors={colors}
            value={newCatColor}
            onChange={(val) => setNewCatColor(val)}
          />
        </div>
      </form>
    </div>
  );
}
