-- 1. Add user_id to all tables
ALTER TABLE items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Default custom settings don't strictly need a user, but if we want per-user settings:
ALTER TABLE category_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE status_settings ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Retroactive Assignment
-- If you just signed up, you are the only user in auth.users. 
-- We assign all existing data to your missing user_id so you don't lose it.
DO $$ 
DECLARE
  first_user_id UUID;
BEGIN
  -- Get the first registered user
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    UPDATE items SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE transactions SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE category_settings SET user_id = first_user_id WHERE user_id IS NULL;
    UPDATE status_settings SET user_id = first_user_id WHERE user_id IS NULL;
  END IF;
END $$;

-- 3. Make user_id NOT NULL for future rows and pull the active UID
ALTER TABLE items ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE transactions ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE category_settings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE status_settings ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE items ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE transactions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE status_settings ALTER COLUMN user_id SET DEFAULT auth.uid();

-- 4. Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_settings ENABLE ROW LEVEL SECURITY;

-- 5. Policies
-- Items Policies
CREATE POLICY "Users can manage their own items" ON items
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can manage their own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Categories Policies
CREATE POLICY "Users can manage their own categories" ON category_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Statuses Policies
CREATE POLICY "Users can manage their own statuses" ON status_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
