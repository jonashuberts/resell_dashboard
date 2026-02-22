import { supabase } from "@/lib/supabase";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditItemForm } from "@/components/EditItemForm";
import { ItemTransactions } from "@/components/ItemTransactions";
import { Translate } from "@/components/Translate";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const queryString = new URLSearchParams(resolvedSearchParams as Record<string, string>).toString();

  // Fetch the item
  const { data: item } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  // Fetch transactions for this item
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("item_id", id)
    .order("date", { ascending: false });

  // Categories
  const { data: catSettings } = await supabase.from("category_settings").select("name").order("sort_order", { ascending: true });
  const { data: catData } = await supabase.from("items").select("category");
  
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  
  const hasUncategorized = catData?.some(c => c.category === 'Keine Kategorie' || !c.category);
  if (hasUncategorized) {
    categoryNames.add('Keine Kategorie');
  }

  // Statuses
  const { data: statSettings } = await supabase.from("status_settings").select("name");
  const statusNames = statSettings?.length ? statSettings.map(s => s.name) : ["Auf Lager", "In Reparatur", "Verkauft"];

  const categories = Array.from(categoryNames);

  // Calculate metrics
  let buyPrice = 0;
  let sellPrice = 0;
  let repairCosts = 0;

  transactions?.forEach(tx => {
    if (tx.type === "Einkauf") buyPrice += Number(tx.amount);
    else if (tx.type === "Verkauf") sellPrice += Number(tx.amount);
    else if (tx.type === "Reparaturkosten") repairCosts += Number(tx.amount);
  });

  const profit = sellPrice - buyPrice - repairCosts;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link 
          href={`/inventory${queryString ? `?${queryString}` : ''}`}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <Translate tKey="item.edit.title" /> {item.name}
          </h2>
          <p className="text-zinc-400 mt-1"><Translate tKey="item.edit.desc" /></p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-400 mb-1"><Translate tKey="item.edit.buy" /></div>
          <div className="text-2xl font-bold text-white">{buyPrice.toFixed(2).replace('.', ',')} €</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-400 mb-1"><Translate tKey="item.edit.repair" /></div>
          <div className="text-2xl font-bold text-rose-500">{repairCosts.toFixed(2).replace('.', ',')} €</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm">
          <div className="text-sm font-medium text-zinc-400 mb-1"><Translate tKey="item.edit.sell" /></div>
          <div className="text-2xl font-bold text-emerald-500">{sellPrice.toFixed(2).replace('.', ',')} €</div>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-2 h-full ${profit > 0 ? "bg-emerald-500" : profit < 0 ? "bg-rose-500" : "bg-zinc-500"}`} />
          <div className="text-sm font-medium text-zinc-400 mb-1"><Translate tKey="item.edit.profit" /></div>
          <div className={`text-2xl font-bold ${profit > 0 ? "text-emerald-500" : profit < 0 ? "text-rose-500" : "text-zinc-300"}`}>
            {profit > 0 ? "+" : ""}{profit.toFixed(2).replace('.', ',')} €
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-1">
          <EditItemForm item={item} categories={categories.sort()} statuses={statusNames} queryString={queryString} />
        </div>

        {/* Right Column: Transactions */}
        <div className="md:col-span-2">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-white mb-4"><Translate tKey="item.edit.txTitle" /></h3>
            
            <ItemTransactions item={item} initialTransactions={transactions || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
