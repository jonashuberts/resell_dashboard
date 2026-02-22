-- 1. Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Apple Watch', 'Accessory'
    status TEXT NOT NULL DEFAULT 'Auf Lager', -- 'Auf Lager', 'Verkauft', 'In Reparatur'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES items(id) ON DELETE SET NULL, -- Can be null for general expenses like tools
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    type TEXT NOT NULL, -- 'Einkauf', 'Verkauf', 'Reparaturkosten', 'Werkzeuge/Sonstiges'
    platform TEXT, -- e.g., 'eBay Kleinanzeigen', 'Amazon'
    amount DECIMAL(12,2) NOT NULL, -- using decimal for currency
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In Supabase, you can run this script directly in the SQL Editor to set up your project.
