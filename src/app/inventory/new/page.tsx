import { supabase } from "@/lib/supabase";
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
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link 
          href={`/inventory${queryString ? `?${queryString}` : ''}`}
          className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Package className="h-8 w-8 text-blue-500" />
            <Translate tKey="item.new.title" />
          </h2>
          <p className="text-zinc-400 mt-1"><Translate tKey="item.new.desc" /></p>
        </div>
      </div>

      <NewItemForm categories={categories.sort()} statuses={statusNames} queryString={queryString} />
    </div>
  );
}
