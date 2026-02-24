-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_settings ENABLE ROW LEVEL SECURITY;

-- 1. Items Policies
CREATE POLICY "Users can only read their own items" ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own items" ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own items" ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own items" ON items
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Transactions Policies
CREATE POLICY "Users can only read their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Categories Policies
CREATE POLICY "Users can read categories" ON category_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage categories" ON category_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Statuses Policies
CREATE POLICY "Users can read statuses" ON status_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage statuses" ON status_settings
  FOR ALL USING (auth.role() = 'authenticated');
