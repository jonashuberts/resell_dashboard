import { createClient } from "@/lib/supabase-server";
import { ArrowRightLeft } from "lucide-react";
import { AddGeneralExpenseButton } from "@/components/AddGeneralExpenseButton";
import { TransactionsClientTable } from "@/components/TransactionsClientTable";
import { Translate } from "@/components/Translate";

export const revalidate = 0;

export default async function TransactionsPage() {
  const supabase = await createClient();

  // 1. Fetch categories and transactions in parallel
  const [catSettingsRes, catItemsRes, txRes] = await Promise.all([
    supabase.from("category_settings").select("name").order("sort_order", { ascending: true }),
    supabase.from("items").select("category"),
    supabase.from("transactions").select("*, items(name, category)").order("date", { ascending: false }),
  ]);

  const catSettings = catSettingsRes.data || [];
  const catDataItems = catItemsRes.data || [];
  const transactions = txRes.data || [];

  const categoryNames = new Set(catSettings.map((c) => c.name));
  const hasUncategorized = catDataItems.some((c) => c.category === "Keine Kategorie" || !c.category);
  if (hasUncategorized) {
    categoryNames.add("Keine Kategorie");
  }
  const categories = Array.from(categoryNames).sort();

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

      {/* Instant Client Table */}
      <TransactionsClientTable transactions={transactions} categories={categories} />
    </div>
  );
}
