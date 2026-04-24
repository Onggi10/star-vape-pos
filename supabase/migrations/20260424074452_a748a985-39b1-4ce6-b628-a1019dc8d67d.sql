-- ============ PRODUCTS ============
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
DROP POLICY IF EXISTS "Allow public delete to products" ON public.products;

CREATE POLICY "Authenticated users can view products"
  ON public.products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ SHIFTS ============
DROP POLICY IF EXISTS "Allow public read access to shifts" ON public.shifts;
DROP POLICY IF EXISTS "Allow public insert to shifts" ON public.shifts;
DROP POLICY IF EXISTS "Allow public update to shifts" ON public.shifts;
-- Keep: "Admins can view all shifts", "Users can view own shifts",
--       "Users can insert own shifts", "Users can update own shifts"

-- ============ TRANSACTIONS ============
DROP POLICY IF EXISTS "Allow public read access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow public insert to transactions" ON public.transactions;
-- Keep: "Admins can view all transactions",
--       "Users can view own transactions",
--       "Users can insert transactions in own shift"

-- ============ TRANSACTION ITEMS ============
DROP POLICY IF EXISTS "Allow public read access to transaction_items" ON public.transaction_items;
DROP POLICY IF EXISTS "Allow public insert to transaction_items" ON public.transaction_items;

CREATE POLICY "Admins can view all transaction items"
  ON public.transaction_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view items from own shift transactions"
  ON public.transaction_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      JOIN public.shifts s ON s.id = t.shift_id
      WHERE t.id = transaction_items.transaction_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items into own shift transactions"
  ON public.transaction_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.transactions t
      JOIN public.shifts s ON s.id = t.shift_id
      WHERE t.id = transaction_items.transaction_id
        AND s.user_id = auth.uid()
    )
  );