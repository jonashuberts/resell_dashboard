"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trash2, Check, X, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
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

    const { error: insertError } = await supabase.from('status_settings').insert({
      name: editingValue,
      color: oldStat.color
    });

    if (!insertError) {
      await supabase.from('items').update({ status: editingValue }).eq('status', oldName);
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
    <div className="apple-card p-6 sm:p-7 relative overflow-hidden shadow-xl">
      <div className="apple-card-glow" />
      <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
          <Activity className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-white tracking-tight">{t("settings.stat.title")}</h3>
      </div>
      <p className="text-xs text-zinc-400 mb-5 font-normal">
        {t("settings.stat.desc")}
      </p>

      {/* Status List */}
      <div className="space-y-2.5 mb-6">
        {statuses.map((stat) => (
          <div key={stat.name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors">
            <div className="flex items-center gap-3">
              {editingStatusName === stat.name ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    className="bg-zinc-950 border border-white/[0.15] rounded-lg px-2.5 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40 w-[130px]"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(stat.name);
                      if (e.key === 'Escape') setEditingStatusName(null);
                    }}
                  />
                  <button 
                    onClick={() => handleRename(stat.name)}
                    className="text-emerald-400 hover:text-emerald-300 p-1"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setEditingStatusName(null)}
                    className="text-zinc-500 hover:text-zinc-400 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <span 
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${!["Auf Lager", "Verkauft"].includes(stat.name) ? "cursor-pointer hover:opacity-80" : ""} ${stat.color} shadow-sm`}
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
                <span className="text-[11px] text-zinc-500 font-medium">{t("settings.stat.system")}</span>
              )}

              <div className="ml-2">
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
                className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors ml-2"
                title={t("settings.cat.deleteHint")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Status Form */}
      <form onSubmit={handleAdd} className="space-y-4 pt-4 border-t border-white/[0.08]">
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">{t("settings.stat.newName")}</label>
            <input 
              type="text" 
              value={newStatusName}
              onChange={e => setNewStatusName(e.target.value)}
              placeholder={t("settings.stat.placeholder")}
              className="w-full bg-zinc-900/80 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
            />
          </div>
          
          <motion.button 
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={!newStatusName || isSaving}
            className="apple-button-primary text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 h-[38px] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            {t("settings.addBtn")}
          </motion.button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">{t("settings.stat.color")}</label>
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
