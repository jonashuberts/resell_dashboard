import { createClient } from "@/lib/supabase-server";
import { Package, Plus } from "lucide-react";
import { InventoryClientTable } from "@/components/InventoryClientTable";
import { Translate } from "@/components/Translate";
import Link from "next/link";

export const revalidate = 0;

export default async function InventoryPage() {
  const supabase = await createClient();

  // 1. Fetch settings and items in parallel for maximum speed
  const [catSettingsRes, statSettingsRes, itemsRes] = await Promise.all([
    supabase.from("category_settings").select("*").order("sort_order", { ascending: true }),
    supabase.from("status_settings").select("*"),
    supabase.from("items").select("*").order("created_at", { ascending: false }),
  ]);

  const catSettings = catSettingsRes.data || [];
  const statSettings = statSettingsRes.data || [];
  const items = itemsRes.data || [];

  const categoryNames = new Set(catSettings.map((c) => c.name));
  const statusNames = new Set(statSettings.map((s) => s.name).concat(["Auf Lager", "Verkauft", "In Reparatur"]));

  const hasUncategorized = items.some((i) => i.category === "Keine Kategorie" || !i.category);
  if (hasUncategorized) {
    categoryNames.add("Keine Kategorie");
  }

  items.forEach((i) => {
    if (i.status) statusNames.add(i.status);
  });

  const categories = Array.from(categoryNames).sort();
  const statuses = Array.from(statusNames).sort();

  const catColorMap = Object.fromEntries(catSettings.map((c) => [c.name, c.color]));
  const statColorMap = Object.fromEntries(
    statSettings.map((s) => [s.name, s.color])
  );

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
            href="/inventory/new"
            className="apple-button-primary text-white px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <Translate tKey="inventory.newItem" />
          </Link>
        </div>
      </div>

      {/* Instant Client Table */}
      <InventoryClientTable
        items={items}
        categories={categories}
        statuses={statuses}
        catColorMap={catColorMap}
        statColorMap={statColorMap}
      />
    </div>
  );
}
