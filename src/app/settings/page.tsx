import { supabase } from "@/lib/supabase";
import { Settings, AlertCircle } from "lucide-react";
import { SettingsCategories } from "@/components/SettingsCategories";
import { SettingsStatuses } from "@/components/SettingsStatuses";
import { LanguageSettings } from "@/components/LanguageSettings";
import { DataExportSettings } from "@/components/DataExportSettings";
import { Translate } from "@/components/Translate";

export const revalidate = 0;

export default async function SettingsPage() {
  const { data: categories, error: catError } = await supabase
    .from("category_settings")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: statuses, error: statError } = await supabase
    .from("status_settings")
    .select("*");

  const needsSetup = !!(catError || statError);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Settings className="h-8 w-8 text-zinc-400" />
          <Translate tKey="settings.title" />
        </h2>
        <p className="text-zinc-400 mt-1"><Translate tKey="settings.desc" /></p>
      </div>

      {needsSetup ? (
        <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-rose-400 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-rose-400 mb-2"><Translate tKey="settings.db.title" /></h3>
            <p className="text-zinc-300 mb-4">
              <Translate tKey="settings.db.desc" />
            </p>
            <pre className="bg-zinc-950 p-4 rounded-lg text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap border border-zinc-800">
              {`-- 1. Create table for category settings
CREATE TABLE category_settings (
    name TEXT PRIMARY KEY,
    color TEXT DEFAULT 'bg-zinc-800 text-zinc-300',
    sort_order INTEGER DEFAULT 0
);

-- 2. Create table for status settings
CREATE TABLE status_settings (
    name TEXT PRIMARY KEY,
    color TEXT DEFAULT 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
);

-- 3. Pre-fill categories from existing items so we don't start empty
INSERT INTO category_settings (name)
SELECT DISTINCT category FROM items ON CONFLICT DO NOTHING;

-- 4. Pre-fill default statuses with their existing colors
INSERT INTO status_settings (name, color) VALUES 
('Auf Lager', 'bg-blue-500/10 text-blue-400 border border-blue-500/20'),
('Verkauft', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'),
('In Reparatur', 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
ON CONFLICT DO NOTHING;`}
            </pre>
            <p className="mt-4 text-sm text-zinc-400 italic"><Translate tKey="settings.db.hint" /></p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <LanguageSettings />
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <SettingsCategories initialCategories={categories || []} />
            <SettingsStatuses initialStatuses={statuses || []} />
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-start">
            <DataExportSettings />
          </div>
        </div>
      )}
    </div>
  );
}
