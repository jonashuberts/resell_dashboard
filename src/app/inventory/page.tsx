import { createClient } from "@/lib/supabase-server";
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
  const supabase = await createClient();
  const params = await searchParams;
  const statusFilter = (params.status as string) || "all";
  const categoryFilter = (params.category as string) || "all";
  const searchFilter = (params.search as string) || "";

  // Get settings gracefully
  const { data: catSettings } = await supabase.from("category_settings").select("*").order("sort_order", { ascending: true });
  const { data: statSettings } = await supabase.from("status_settings").select("*");

  // Get distinct categories as fallback
  const { data: itemsData } = await supabase.from("items").select("category, status");
  
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  const statusNames = new Set(statSettings?.map(s => s.name) || ["Auf Lager", "Verkauft", "In Reparatur"]);
  
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
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-blue-500" />
            <Translate tKey="inventory.title" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
            <Translate tKey="inventory.desc" />
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/inventory/new${queryString ? `?${queryString}` : ''}`} 
            className="apple-button-primary text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <Translate tKey="inventory.newItem" />
          </Link>
        </div>
      </div>

      {/* Main Table Card (Apple Grouped Inset style) */}
      <div className="apple-card overflow-hidden shadow-2xl relative">
        <div className="apple-card-glow" />
        
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-white/[0.08] bg-zinc-950/40">
          <InventoryFilters categories={categories.sort()} statuses={statuses.sort()} />
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-zinc-950/70 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-3.5"><Translate tKey="inventory.table.name" /></th>
                <th className="px-6 py-3.5"><Translate tKey="inventory.table.category" /></th>
                <th className="px-6 py-3.5"><Translate tKey="inventory.table.status" /></th>
                <th className="px-6 py-3.5 text-right"><Translate tKey="inventory.table.actions" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {items?.map((item) => {
                const isSold = item.status.includes("Verkauft") || item.status.includes("Versendet") || item.status.includes("Angekommen") || item.status.includes("Reklamation");
                
                return (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-xs sm:text-sm text-zinc-100 group-hover:text-white transition-colors">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${catColorMap[item.category] || 'bg-zinc-800/80 text-zinc-300 border border-white/[0.08]'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statColorMap[item.status] || 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/inventory/${item.id}/edit${queryString ? `?${queryString}` : ''}`} 
                          className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                          <Translate tKey="inventory.table.details" />
                        </Link>
                        {!isSold && (
                          <SellButton item={{ id: item.id, name: item.name, status: item.status }} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!items?.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-xs text-zinc-500">
                    <div className="h-10 w-10 mx-auto mb-2 rounded-full bg-zinc-900 flex items-center justify-center border border-white/[0.06] text-lg">
                      📦
                    </div>
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
