-- 1. Create table for category settings
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
ON CONFLICT DO NOTHING;
