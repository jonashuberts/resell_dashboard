import { createClient } from "@/lib/supabase-server";
import { Package, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { NewItemForm } from "@/components/NewItemForm";
import { Translate } from "@/components/Translate";

export const revalidate = 0;

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedSearchParams = await searchParams;
  const queryString = new URLSearchParams(resolvedSearchParams as Record<string, string>).toString();

  const { data: catSettings } = await supabase.from("category_settings").select("name").order("sort_order", { ascending: true });
  const { data: statSettings } = await supabase.from("status_settings").select("name");

  const { data: catData } = await supabase.from("items").select("category");
  
  const categoryNames = new Set(catSettings?.map(c => c.name) || []);
  
  const hasUncategorized = catData?.some(c => c.category === 'Keine Kategorie' || !c.category);
  if (hasUncategorized) {
    categoryNames.add('Keine Kategorie');
  }

  // Fallback statuses
  const statusNames = statSettings?.length ? statSettings.map(s => s.name) : ["Auf Lager", "In Reparatur", "Verkauft"];

  const categories = Array.from(categoryNames);

  return (
    <div className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4 pb-2 border-b border-white/[0.06]">
        <Link 
          href={`/inventory${queryString ? `?${queryString}` : ''}`}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-blue-500" />
            <Translate tKey="item.new.title" />
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
            <Translate tKey="item.new.desc" />
          </p>
        </div>
      </div>

      <NewItemForm categories={categories.sort()} statuses={statusNames} queryString={queryString} />
    </div>
  );
}
