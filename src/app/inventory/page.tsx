import { supabase } from "@/lib/supabase";
import { Package, Plus } from "lucide-react";
import { InventoryFilters } from "@/components/InventoryFilters";
import { SellButton } from "@/components/SellButton";
import { Translate } from "@/components/Translate";
import Link from "next/link";

export const revalidate = 0;

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const statusFilter = (params.status as string) || "all";
  const categoryFilter = (params.category as string) || "all";
  const searchFilter = (params.search as string) || "";

  // Get settings gracefully
  const { data: catSettings } = await supabase.from("category_settings").select("*").order("sort_order", { ascending: true });
  const { data: statSettings } = await supabase.from("status_settings").select("*");

  // Get distinct categories as fallback
  const { data: itemsData } = await supabase.from("items").select("category, status");
  
  // Combine settings with actual data to ensure we have a robust list
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  const statusNames = new Set(statSettings?.map(s => s.name) || ["Auf Lager", "Verkauft", "In Reparatur"]);
  
  // We don't add all item categories to categoryNames anymore so deleted ones disappear from the dropdown
  // But we still want to make sure 'Keine Kategorie' is selectable if some items have it
  const hasUncategorized = itemsData?.some(i => i.category === 'Keine Kategorie' || !i.category);
  if (hasUncategorized) {
    categoryNames.add('Keine Kategorie');
  }

  itemsData?.forEach(i => {
    statusNames.add(i.status);
  });

  const categories = Array.from(categoryNames);
  const statuses = Array.from(statusNames);

  // Maps for UI colors
  const catColorMap = catSettings ? Object.fromEntries(catSettings.map(c => [c.name, c.color])) : {};
  const statColorMap = statSettings ? Object.fromEntries(statSettings.map(s => [s.name, s.color])) : {
    'Auf Lager': 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    'Verkauft': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'In Reparatur': 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
  };

  // Build items query
  let query = supabase.from("items").select("*").order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }
  
  if (categoryFilter !== "all") {
    query = query.eq("category", categoryFilter);
  }

  if (searchFilter) {
    query = query.ilike("name", `%${searchFilter}%`);
  }

  const { data: items } = await query;
  
  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.set("status", statusFilter);
  if (categoryFilter !== "all") queryParams.set("category", categoryFilter);
  if (searchFilter) queryParams.set("search", searchFilter);
  const queryString = queryParams.toString();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <Translate tKey="inventory.title" />
          </h2>
          <p className="text-zinc-400 mt-1"><Translate tKey="inventory.desc" /></p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/inventory/new${queryString ? `?${queryString}` : ''}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <Translate tKey="inventory.newItem" />
          </Link>
        </div>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 flex flex-wrap items-center gap-4">
          <InventoryFilters categories={categories.sort()} statuses={statuses.sort()} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium"><Translate tKey="inventory.table.name" /></th>
                <th className="px-6 py-4 font-medium"><Translate tKey="inventory.table.category" /></th>
                <th className="px-6 py-4 font-medium"><Translate tKey="inventory.table.status" /></th>
                <th className="px-6 py-4 font-medium text-right"><Translate tKey="inventory.table.actions" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {items?.map((item) => {
                const isSold = item.status.includes("Verkauft") || item.status.includes("Versendet") || item.status.includes("Angekommen") || item.status.includes("Reklamation");
                
                return (
                  <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-zinc-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${catColorMap[item.category] || 'bg-zinc-800 text-zinc-300'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statColorMap[item.status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/inventory/${item.id}/edit${queryString ? `?${queryString}` : ''}`} className="text-zinc-400 hover:text-white font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <Translate tKey="inventory.table.details" />
                      </Link>
                      {!isSold && (
                        <>
                          <span className="text-zinc-700 mx-2 opacity-0 group-hover:opacity-100">|</span>
                          <SellButton item={{ id: item.id, name: item.name, status: item.status }} />
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!items?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    <Translate tKey="inventory.table.empty" />
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
