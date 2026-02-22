import { supabase } from "@/lib/supabase";
import { ArrowRightLeft, Search } from "lucide-react";
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
  const params = await searchParams;
  const typeFilter = (params.type as string) || "all";
  const categoryFilter = (params.category as string) || "all";
  const searchFilter = (params.search as string) || "";

  // Fetch categories for the options
  const { data: catSettings } = await supabase.from("category_settings").select("name").order("sort_order", { ascending: true });
  const { data: catDataItems } = await supabase.from("items").select("category");
  // Ignore fetching from transactions.category because it might not exist yet (error handling)
  
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

  const { data: rawTransactions, error } = await query;
  
  // Client-side filtering for search and category to avoid complex PG join issues
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ArrowRightLeft className="h-8 w-8 text-violet-500" />
            <Translate tKey="tx.title" />
          </h2>
          <p className="text-zinc-400 mt-1"><Translate tKey="tx.desc" /></p>
        </div>
        <div className="flex items-center gap-3">
          <AddGeneralExpenseButton categories={categories} />
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
        <TransactionsClientFilter categories={categories} />

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium"><Translate tKey="tx.table.date" /></th>
                <th className="px-6 py-4 font-medium"><Translate tKey="tx.table.itemNote" /></th>
                <th className="px-6 py-4 font-medium"><Translate tKey="tx.table.typePlatform" /></th>
                <th className="px-6 py-4 font-medium text-right"><Translate tKey="tx.table.amount" /></th>
                <th className="px-6 py-4 font-medium text-right"><Translate tKey="tx.table.actions" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transactions?.map((t) => {
                const effectiveCategory = t.items?.category || t.category;
                return (
                  <tr key={t.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                      {new Date(t.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-100">
                      {t.items?.name ? (
                        <span>{t.items.name}</span>
                      ) : (
                        <span className="text-zinc-300">{t.notes || <span className="text-zinc-500 italic"><Translate tKey="tx.table.generalExpense" /></span>}</span>
                      )}
                      {effectiveCategory && (
                        <span className="ml-2 inline-flex flex-shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
                          {effectiveCategory}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          t.type === 'Verkauf' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          t.type === 'Einkauf' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {t.type}
                        </span>
                        {t.platform && (
                          <span className="text-xs text-zinc-500 flex items-center gap-1">
                            via {t.platform}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-medium whitespace-nowrap ${t.type === 'Verkauf' ? 'text-emerald-400' : 'text-zinc-100'}`}>
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
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
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
