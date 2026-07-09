
-- Drop the permissive always-true INSERT policies
DROP POLICY IF EXISTS "anon_insert_orders" ON public.orders;
DROP POLICY IF EXISTS "anon_insert_order_items" ON public.order_items;

-- orders: authenticated users may only insert rows for themselves;
-- anon users (guest checkout) may only insert rows where user_id is NULL.
CREATE POLICY "insert_orders" ON public.orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR
    (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
  );

-- order_items: only insertable when the parent order belongs to the
-- current session (authenticated uid or a guest/null order).
CREATE POLICY "insert_order_items" ON public.order_items
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders
      WHERE user_id IS NULL
         OR user_id = auth.uid()
    )
  );
