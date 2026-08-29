"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, ArrowDownRight, ArrowUpRight, Wrench, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
      router.refresh();
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
        return <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />;
      case 'Verkauf':
        return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />;
      case 'Reparaturkosten':
        return <Wrench className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <ArrowDownRight className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Einkauf': return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
      case 'Verkauf': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25';
      case 'Reparaturkosten': return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25';
    }
  };

  return (
    <div className="space-y-5">
      <AnimatePresence mode="wait">
        {!isAdding ? (
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAdding(true)}
            className="w-full py-3 border border-dashed border-white/[0.15] hover:border-white/[0.25] rounded-xl text-zinc-400 hover:text-white bg-zinc-900/30 hover:bg-zinc-900/60 transition-all flex items-center justify-center gap-2 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("item.tx.addBtn")}
          </motion.button>
        ) : (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddExpense} 
            className="bg-zinc-900/60 border border-white/[0.1] rounded-xl p-4.5 space-y-4 shadow-lg backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white">{t("item.tx.addTitle")}</h4>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="text-zinc-400 hover:text-white text-xs font-medium"
              >
                {t("item.form.cancel")}
              </button>
            </div>
            
            {error && <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg">{error}</div>}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">{t("item.tx.type")}</label>
                <select name="type" className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none cursor-pointer">
                  <option value="Reparaturkosten">{t("item.tx.type.repair")}</option>
                  <option value="Werkzeuge/Sonstiges">{t("item.tx.type.other")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">{t("item.tx.amount")}</label>
                <input name="amount" type="text" required placeholder="0,00" className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono tabular-nums" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">{t("item.tx.date")}</label>
                <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none font-mono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">{t("item.form.notes")}</label>
                <input name="notes" type="text" placeholder={t("item.tx.notes.placeholder")} className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <motion.button 
                whileTap={{ scale: 0.97 }}
                type="submit" 
                disabled={isLoading}
                className="apple-button-primary text-white px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
              >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                {t("item.tx.save")}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {transactions.length === 0 ? (
        <p className="text-xs text-zinc-500 py-6 text-center">{t("item.tx.empty")}</p>
      ) : (
        <div className="space-y-2.5">
          {transactions.map(tx => (
             <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/[0.04] hover:bg-zinc-900/70 transition-colors group">
               <div className="flex items-center gap-3">
                 <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${getTypeColor(tx.type)}`}>
                   {getTypeIcon(tx.type)}
                 </div>
                 <div>
                   <div className="font-medium text-zinc-200 text-xs flex items-center gap-1.5">
                     {tx.type} 
                     {tx.platform && <span className="text-[10px] text-zinc-500 font-normal">{t("item.tx.via")}{tx.platform}</span>}
                   </div>
                   <div className="text-[11px] text-zinc-500 font-mono">
                     {dayjs(tx.date).format('DD.MM.YYYY')} 
                     {tx.notes && <span className="ml-2 text-zinc-400 font-sans">— {tx.notes}</span>}
                   </div>
                 </div>
               </div>
               <div className="flex items-center gap-3">
                 <div className={`font-mono font-semibold text-xs tabular-nums ${tx.type === 'Verkauf' ? 'text-emerald-400' : 'text-rose-400'}`}>
                   {tx.type === 'Verkauf' ? '+' : '-'}{tx.amount.toFixed(2).replace('.', ',')} €
                 </div>
                 <button 
                   onClick={() => handleDeleteTransaction(tx.id)}
                   disabled={isLoading}
                   className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                   title="Transaktion löschen"
                 >
                   <Trash2 className="h-3.5 w-3.5" />
                 </button>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
