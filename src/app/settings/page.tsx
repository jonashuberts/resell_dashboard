import { createClient } from "@/lib/supabase-server";
import { Settings, AlertCircle } from "lucide-react";
import { SettingsCategories } from "@/components/SettingsCategories";
import { SettingsStatuses } from "@/components/SettingsStatuses";
import { LanguageSettings } from "@/components/LanguageSettings";
import { DataExportSettings } from "@/components/DataExportSettings";
import { Translate } from "@/components/Translate";

export const revalidate = 0;

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: categories, error: catError } = await supabase
    .from("category_settings")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: statuses, error: statError } = await supabase
    .from("status_settings")
    .select("*");

  const needsSetup = !!(catError || statError);

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      {/* Header bar */}
      <div className="pb-2 border-b border-white/[0.06]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-zinc-400" />
          <Translate tKey="settings.title" />
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal tracking-tight">
          <Translate tKey="settings.desc" />
        </p>
      </div>

      {needsSetup ? (
        <div className="apple-card p-6 border-rose-500/30 bg-rose-500/10 flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-rose-400 mb-1.5"><Translate tKey="settings.db.title" /></h3>
            <p className="text-xs text-zinc-300 mb-4">
              <Translate tKey="settings.db.desc" />
            </p>
            <pre className="bg-zinc-950 p-4 rounded-xl text-xs text-zinc-300 font-mono overflow-x-auto whitespace-pre-wrap border border-white/[0.08]">
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

-- 3. Pre-fill categories from existing items
INSERT INTO category_settings (name)
SELECT DISTINCT category FROM items ON CONFLICT DO NOTHING;

-- 4. Pre-fill default statuses
INSERT INTO status_settings (name, color) VALUES 
('Auf Lager', 'bg-blue-500/10 text-blue-400 border border-blue-500/20'),
('Verkauft', 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'),
('In Reparatur', 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
ON CONFLICT DO NOTHING;`}
            </pre>
            <p className="mt-3 text-[11px] text-zinc-400 italic"><Translate tKey="settings.db.hint" /></p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <LanguageSettings />
          
          <div className="grid gap-6 md:grid-cols-2 items-start">
            <SettingsCategories initialCategories={categories || []} />
            <SettingsStatuses initialStatuses={statuses || []} />
          </div>

          <DataExportSettings />
        </div>
      )}
    </div>
  );
}
