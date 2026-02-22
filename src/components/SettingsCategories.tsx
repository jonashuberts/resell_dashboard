"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, GripVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
    // 1. Insert new category settings cloning the old one
    const oldCat = categories.find(c => c.name === oldName);
    if (!oldCat) return;

    const { error: insertError } = await supabase.from('category_settings').insert({
      name: editingValue,
      color: oldCat.color,
      sort_order: oldCat.sort_order
    });

    if (!insertError) {
      // 2. Update existing items to use new category name
      await supabase.from('items').update({ category: editingValue }).eq('category', oldName);
      // 3. Delete old category setting
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
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-white mb-4">{t("settings.cat.title")}</h3>
      <p className="text-sm text-zinc-400 mb-6">
        {t("settings.cat.desc")}
      </p>

      <div className="space-y-3 mb-6">
        {categories.map((cat, i) => (
          <div key={cat.name} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3 w-full">
              {editingCatName === cat.name ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-[120px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(cat.name);
                      if (e.key === 'Escape') setEditingCatName(null);
                    }}
                  />
                  <button 
                    onClick={() => handleRename(cat.name)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button 
                    onClick={() => setEditingCatName(null)}
                    className="text-zinc-500 hover:text-zinc-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ) : (
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${cat.color} min-w-[100px] justify-center`}
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
              className="text-zinc-500 hover:text-rose-400 transition-colors ml-4"
              title={t("settings.cat.deleteHint")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-sm text-zinc-500">{t("settings.cat.empty")}</div>
        )}
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-4 pt-4 border-t border-zinc-800 mt-2">
        <div className="flex gap-4 items-start">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-zinc-400">{t("settings.cat.newName")}</label>
            <input 
              type="text" 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder={t("settings.cat.placeholder")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!newCatName || isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors h-[38px] flex items-center justify-center min-w-[100px] mt-[26px]"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("settings.addBtn")}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">{t("settings.cat.design")}</label>
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
