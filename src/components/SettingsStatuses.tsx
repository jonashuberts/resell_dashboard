"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { ColorPicker, ColorOption } from "./ColorPicker";

type StatusSetting = {
  name: string;
  color: string;
};

export function SettingsStatuses({ initialStatuses }: { initialStatuses: StatusSetting[] }) {
  const router = useRouter();
  const [statuses, setStatuses] = useState(initialStatuses);
  const [isSaving, setIsSaving] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("bg-purple-500/10 text-purple-400 border border-purple-500/20");

  const [editingStatusName, setEditingStatusName] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { t } = useLanguage();

  const colors: ColorOption[] = [
    { label: t("color.gray"), value: "bg-zinc-800 text-zinc-300", bgClass: "bg-zinc-500" },
    { label: t("color.blue"), value: "bg-blue-500/10 text-blue-400 border border-blue-500/20", bgClass: "bg-blue-500" },
    { label: t("color.green"), value: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", bgClass: "bg-emerald-500" },
    { label: t("color.yellow"), value: "bg-amber-500/10 text-amber-400 border border-amber-500/20", bgClass: "bg-amber-500" },
    { label: t("color.orange"), value: "bg-orange-500/10 text-orange-400 border border-orange-500/20", bgClass: "bg-orange-500" },
    { label: t("color.red"), value: "bg-rose-500/10 text-rose-400 border border-rose-500/20", bgClass: "bg-rose-500" },
    { label: t("color.purple"), value: "bg-purple-500/10 text-purple-400 border border-purple-500/20", bgClass: "bg-purple-500" },
    { label: t("color.cyan"), value: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20", bgClass: "bg-cyan-500" },
  ];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatusName) return;

    setIsSaving(true);
    const newStat = { name: newStatusName, color: newStatusColor };
    
    const { error } = await supabase.from('status_settings').insert(newStat);
    if (!error) {
      setStatuses([...statuses, newStat]);
      setNewStatusName("");
      router.refresh();
    }
    setIsSaving(false);
  }

  async function handleDelete(name: string) {
    if (name === "Auf Lager" || name === "Verkauft") {
      alert(t("settings.stat.error.systemDelete"));
      return;
    }
    
    if (!window.confirm(t("settings.stat.deleteConfirm"))) {
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('status_settings').delete().eq('name', name);
    if (!error) {
      setStatuses(statuses.filter(s => s.name !== name));
      router.refresh();
    }
    setIsSaving(false);
  }

  async function handleRename(oldName: string) {
    if (!editingValue || editingValue === oldName) {
      setEditingStatusName(null);
      return;
    }
    
    setIsSaving(true);
    const oldStat = statuses.find(s => s.name === oldName);
    if (!oldStat) return;

    // 1. Insert new status
    const { error: insertError } = await supabase.from('status_settings').insert({
      name: editingValue,
      color: oldStat.color
    });

    if (!insertError) {
      // 2. Update existing items
      await supabase.from('items').update({ status: editingValue }).eq('status', oldName);
      // 3. Delete old status
      await supabase.from('status_settings').delete().eq('name', oldName);
      
      setStatuses(statuses.map(s => s.name === oldName ? { ...s, name: editingValue } : s));
      router.refresh();
    } else {
      console.error(insertError);
      alert(t("settings.cat.error.rename"));
    }
    
    setEditingStatusName(null);
    setIsSaving(false);
  }

  async function handleUpdateColor(name: string, newColor: string) {
    setIsSaving(true);
    const { error } = await supabase
      .from('status_settings')
      .update({ color: newColor })
      .eq('name', name);
      
    if (!error) {
      setStatuses(statuses.map(s => s.name === name ? { ...s, color: newColor } : s));
      router.refresh();
    }
    setIsSaving(false);
  }

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-medium text-white mb-4">{t("settings.stat.title")}</h3>
      <p className="text-sm text-zinc-400 mb-6">
        {t("settings.stat.desc")}
      </p>

      <div className="space-y-3 mb-6">
        {statuses.map((stat) => (
          <div key={stat.name} className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              {editingStatusName === stat.name ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-blue-500 w-[120px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(stat.name);
                      if (e.key === 'Escape') setEditingStatusName(null);
                    }}
                  />
                  <button 
                  onClick={() => handleRename(stat.name)}
                    className="text-emerald-400 hover:text-emerald-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </button>
                  <button 
                    onClick={() => setEditingStatusName(null)}
                    className="text-zinc-500 hover:text-zinc-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ) : (
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${!["Auf Lager", "Verkauft"].includes(stat.name) ? "cursor-pointer hover:opacity-80" : ""} ${stat.color}`}
                  onClick={() => {
                    if (!["Auf Lager", "Verkauft"].includes(stat.name)) {
                      setEditingStatusName(stat.name);
                      setEditingValue(stat.name);
                    }
                  }}
                  title={!["Auf Lager", "Verkauft"].includes(stat.name) ? t("settings.cat.renameHint") : ""}
                >
                  {stat.name}
                </span>
              )}
              {["Auf Lager", "Verkauft"].includes(stat.name) && (
                <span className="text-xs text-zinc-600">{t("settings.stat.system")}</span>
              )}

              <div className="ml-4">
                {!["Auf Lager", "Verkauft"].includes(stat.name) && (
                  <ColorPicker 
                    colors={colors}
                    value={stat.color}
                    disabled={isSaving}
                    onChange={(val) => handleUpdateColor(stat.name, val)}
                  />
                )}
              </div>
            </div>
            {!["Auf Lager", "Verkauft"].includes(stat.name) && (
              <button 
                onClick={() => handleDelete(stat.name)}
                disabled={isSaving}
                className="text-zinc-500 hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-4 pt-4 border-t border-zinc-800 mt-2">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-zinc-400">{t("settings.stat.newName")}</label>
            <input 
              type="text" 
              value={newStatusName}
              onChange={e => setNewStatusName(e.target.value)}
              placeholder={t("settings.stat.placeholder")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          <button 
            type="submit"
            disabled={!newStatusName || isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors h-[38px] flex items-center justify-center min-w-[100px] mt-[26px]"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : t("settings.addBtn")}
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400">{t("settings.stat.color")}</label>
          <ColorPicker 
            colors={colors}
            value={newStatusColor}
            onChange={(val) => setNewStatusColor(val)}
          />
        </div>
      </form>
    </div>
  );
}
