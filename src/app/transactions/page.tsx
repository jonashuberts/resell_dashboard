import { createClient } from "@/lib/supabase-server";
import { ArrowRightLeft } from "lucide-react";
import { AddGeneralExpenseButton } from "@/components/AddGeneralExpenseButton";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { TransactionsClientFilter } from "@/components/TransactionsClientFilter";
import { Translate } from "@/components/Translate";

export const revalidate = 0;

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const typeFilter = (params.type as string) || "all";
  const categoryFilter = (params.category as string) || "all";
  const searchFilter = (params.search as string) || "";

  // Fetch categories for the options
  const { data: catSettings } = await supabase.from("category_settings").select("name").order("sort_order", { ascending: true });
  const { data: catDataItems } = await supabase.from("items").select("category");
  
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  const hasUncategorized = catDataItems?.some(c => c.category === 'Keine Kategorie' || !c.category);
  if (hasUncategorized) {
    categoryNames.add('Keine Kategorie');
  }
  const categories = Array.from(categoryNames).sort();

  // Fetch transactions
  let query = supabase
    .from("transactions")
    .select(`
      *,
      items ( name, category )
    `)
    .order("date", { ascending: false });

  if (typeFilter !== "all") {
    query = query.eq("type", typeFilter);
  }

  const { data: rawTransactions } = await query;
  
  // Client-side filtering for search and category
  let transactions = rawTransactions || [];
  
  if (categoryFilter !== "all") {
    transactions = transactions.filter(t => 
      (t.items?.category === categoryFilter) || 
      (t.category === categoryFilter)
    );
  }
  
  if (searchFilter) {
    const s = searchFilter.toLowerCase();
    transactions = transactions.filter(t => 
      t.items?.name?.toLowerCase().includes(s) || 
      t.type.toLowerCase().includes(s) || 
      t.notes?.toLowerCase().includes(s) || 
      t.platform?.toLowerCase().includes(s)
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ArrowRightLeft className="h-7 w-7 text-violet-400" />
            <Translate tKey="tx.title" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
            <Translate tKey="tx.desc" />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AddGeneralExpenseButton categories={categories} />
        </div>
      </div>

      {/* Main Ledger Card (Apple Grouped Inset style) */}
      <div className="apple-card overflow-hidden shadow-2xl relative">
        <div className="apple-card-glow" />
        
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-950/40">
          <TransactionsClientFilter categories={categories} />
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-3.5"><Translate tKey="tx.table.date" /></th>
                <th className="px-6 py-3.5"><Translate tKey="tx.table.itemNote" /></th>
                <th className="px-6 py-3.5"><Translate tKey="tx.table.typePlatform" /></th>
                <th className="px-6 py-3.5 text-right"><Translate tKey="tx.table.amount" /></th>
                <th className="px-6 py-3.5 text-right"><Translate tKey="tx.table.actions" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions?.map((t) => {
                const effectiveCategory = t.items?.category || t.category;
                return (
                  <tr key={t.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400 font-mono">
                      {new Date(t.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {t.items?.name ? (
                          <span className="font-medium text-xs sm:text-sm text-zinc-100">{t.items.name}</span>
                        ) : (
                          <span className="text-xs text-zinc-300 font-medium">
                            {t.notes || <span className="text-zinc-500 italic"><Translate tKey="tx.table.generalExpense" /></span>}
                          </span>
                        )}
                        {effectiveCategory && (
                          <span className="inline-flex shrink-0 items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-zinc-800/80 text-zinc-300 border border-white/[0.06]">
                            {effectiveCategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-lg text-[11px] font-medium ${
                          t.type === 'Verkauf' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          t.type === 'Einkauf' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          t.type === 'Reparaturkosten' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {t.type}
                        </span>
                        {t.platform && (
                          <span className="text-[11px] text-zinc-400">
                            via {t.platform}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-mono font-semibold text-xs sm:text-sm whitespace-nowrap tabular-nums ${
                      t.type === 'Verkauf' ? 'text-emerald-400' : 'text-zinc-100'
                    }`}>
                      {t.type === 'Verkauf' ? '+' : '-'} €{Number(t.amount).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <EditTransactionDialog transaction={t} categories={categories} />
                    </td>
                  </tr>
                );
              })}
              {!transactions?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-xs text-zinc-500">
                    <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-zinc-900 flex items-center justify-center border border-white/[0.06] text-lg">
                      💳
                    </div>
                    <Translate tKey="tx.table.empty" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
