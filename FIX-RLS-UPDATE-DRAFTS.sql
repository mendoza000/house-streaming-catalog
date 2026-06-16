-- ============================================
-- FIX: Permitir UPDATE de órdenes draft
-- ============================================

-- Eliminar política de UPDATE restrictiva si existe
DROP POLICY IF EXISTS "admin_update_orders" ON orders;
DROP POLICY IF EXISTS "Admins can update order status" ON orders;

-- Crear política que permite a ANON actualizar drafts
CREATE POLICY "allow_update_draft_orders"
  ON orders
  FOR UPDATE
  TO anon, authenticated
  USING (status = 'draft')
  WITH CHECK (status = 'draft');

-- Crear política que solo admins pueden actualizar órdenes NO-draft
CREATE POLICY "admin_update_non_draft_orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    status != 'draft' AND
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================
-- Verificación
-- ============================================

-- Ver políticas de UPDATE
SELECT 
  policyname,
  cmd,
  roles,
  qual as "USING clause",
  with_check as "WITH CHECK clause"
FROM pg_policies 
WHERE tablename = 'orders' 
  AND cmd = 'UPDATE'
ORDER BY policyname;

-- ============================================
-- Probar UPDATE como usuario anónimo
-- ============================================

/*
-- Cambiar a rol anon
SET ROLE anon;

-- Probar actualizar una orden draft
UPDATE orders 
SET payment_method = 'Test Method Updated',
    amount = 999
WHERE id = 7 
  AND status = 'draft'
RETURNING *;

-- Debería funcionar ahora

-- Resetear rol
RESET ROLE;
*/
