"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, ArrowDownRight, ArrowUpRight, Wrench } from "lucide-react";
import dayjs from "dayjs";
import { useLanguage } from "./LanguageContext";

type Transaction = {
  id: string;
  item_id: string | null;
  date: string;
  type: string;
  platform: string | null;
  amount: number;
  notes: string | null;
};

type ItemTransactionsProps = {
  item: { id: string; name: string };
  initialTransactions: Transaction[];
};

export function ItemTransactions({ item, initialTransactions }: ItemTransactionsProps) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  async function handleAddExpense(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    const rawAmount = formData.get("amount") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    const amount = parseFloat(rawAmount.replace(",", "."));
    if (isNaN(amount) || amount <= 0) {
      setError(t("item.tx.error.amount"));
      setIsLoading(false);
      return;
    }

    try {
      const newTx = {
        item_id: item.id,
        type,
        amount,
        date: date || new Date().toISOString().split('T')[0],
        notes: notes || null,
        platform: null
      };

      const { data, error: insertError } = await supabase
        .from("transactions")
        .insert(newTx)
        .select("*")
        .single();

      if (insertError) throw insertError;

      setTransactions([data, ...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsAdding(false);
      router.refresh(); // Tells server component to recalculate metrics
    } catch (err: any) {
      console.error(err);
      setError(t("item.tx.error.add"));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteTransaction(id: string) {
    if (!window.confirm(t("item.tx.deleteConfirm"))) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      
      setTransactions(transactions.filter(t => t.id !== id));
      router.refresh();
    } catch (err) {
      console.error(err);
      alert(t("item.tx.deleteError"));
    } finally {
      setIsLoading(false);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Einkauf':
        return <ArrowDownRight className="h-4 w-4 text-rose-500" />;
      case 'Verkauf':
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case 'Reparaturkosten':
        return <Wrench className="h-4 w-4 text-amber-500" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-zinc-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Einkauf': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Verkauf': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Reparaturkosten': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {!isAdding ? (
        <button 
          onClick={() => setIsAdding(true)}
          className="w-full py-3 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-400 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          {t("item.tx.addBtn")}
        </button>
      ) : (
        <form onSubmit={handleAddExpense} className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-white">{t("item.tx.addTitle")}</h4>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="text-zinc-500 hover:text-zinc-300 text-sm"
            >
              {t("item.form.cancel")}
            </button>
          </div>
          
          {error && <div className="text-rose-400 text-xs bg-rose-500/10 p-2 rounded">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">{t("item.tx.type")}</label>
              <select name="type" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none cursor-pointer">
                <option value="Reparaturkosten">{t("item.tx.type.repair")}</option>
                <option value="Werkzeuge/Sonstiges">{t("item.tx.type.other")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">{t("item.tx.amount")}</label>
              <input name="amount" type="text" required placeholder="0,00" className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">{t("item.tx.date")}</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">{t("item.form.notes")}</label>
              <input name="notes" type="text" placeholder={t("item.tx.notes.placeholder")} className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none" />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              {t("item.tx.save")}
            </button>
          </div>
        </form>
      )}

      {transactions.length === 0 ? (
        <p className="text-sm text-zinc-500 mt-4">{t("item.tx.empty")}</p>
      ) : (
        <div className="space-y-3">
          {transactions.map(tx => (
             <div key={tx.id} className="flex items-start justify-between p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-lg group">
               <div className="flex items-start gap-4">
                 <div className={`p-2 rounded-full border ${getTypeColor(tx.type)}`}>
                   {getTypeIcon(tx.type)}
                 </div>
                 <div>
                   <div className="font-medium text-zinc-200 text-sm flex items-center gap-2">
                     {tx.type} 
                     {tx.platform && <span className="text-xs text-zinc-500 font-normal">{t("item.tx.via")}{tx.platform}</span>}
                   </div>
                   <div className="text-xs text-zinc-500 mt-0.5">
                     {dayjs(tx.date).format('DD.MM.YYYY')} 
                     {tx.notes && <span className="ml-2">— {tx.notes}</span>}
                   </div>
                 </div>
               </div>
               <div className="flex flex-col items-end gap-2">
                 <div className={`font-medium ${tx.type === 'Verkauf' ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {tx.type === 'Verkauf' ? '+' : '-'}{tx.amount.toFixed(2).replace('.', ',')} €
                 </div>
                 <button 
                   onClick={() => handleDeleteTransaction(tx.id)}
                   disabled={isLoading}
                   className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                   title="Transaktion löschen"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                 </button>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
