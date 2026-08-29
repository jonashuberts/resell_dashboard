import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { DashboardClientView } from "@/components/DashboardClientView";
import { DEMO_CATEGORIES, DEMO_ITEMS, DEMO_TRANSACTIONS } from "@/lib/demo-data";

export const revalidate = 0;

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("resell_demo")?.value === "true";

  if (isDemo) {
    const demoCategories = DEMO_CATEGORIES.map((c) => c.name);
    const demoStockTxs = DEMO_TRANSACTIONS.filter((t) => t.type === "Einkauf").map((t) => ({
      item_id: t.item_id,
      amount: t.amount,
    }));

    return (
      <DashboardClientView
        transactions={DEMO_TRANSACTIONS}
        items={DEMO_ITEMS}
        categories={demoCategories}
        stockTxs={demoStockTxs}
        isDemo={true}
      />
    );
  }

  const supabase = await createClient();

  // Fetch all base data in parallel for maximum speed
  const [catSettingsRes, catDataRes, transactionsRes, itemsRes, stockTxsRes] = await Promise.all([
    supabase.from("category_settings").select("name").order("sort_order", { ascending: true }),
    supabase.from("items").select("category"),
    supabase.from("transactions").select("id, date, type, item_id, amount, platform, items!inner(category, name)"),
    supabase.from("items").select("id, status, category, created_at"),
    supabase.from("transactions").select("item_id, amount").eq("type", "Einkauf"),
  ]);

  const catSettings = catSettingsRes.data || [];
  const catData = catDataRes.data || [];
  const transactions = transactionsRes.data || [];
  const items = itemsRes.data || [];
  const stockTxs = stockTxsRes.data || [];

  const categoryNames = new Set(catSettings.map((c) => c.name));
  const hasUncategorized = catData.some((c) => c.category === "Keine Kategorie" || !c.category);
  if (hasUncategorized) {
    categoryNames.add("Keine Kategorie");
  }
  const categories = Array.from(categoryNames).sort();

  return (
    <DashboardClientView
      transactions={transactions}
      items={items}
      categories={categories}
      stockTxs={stockTxs}
    />
  );
}
