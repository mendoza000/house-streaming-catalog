-- Endurece el gate de admin sobre `orders` antes de habilitar signup público de
-- clientes, y hace el matching por email case-insensitive.
--
-- Problema: las policies de admin ("Admins can view all orders" y la variante de
-- UPDATE que agregó FIX-RLS-UPDATE-DRAFTS.sql) chequean `raw_user_meta_data`, que
-- es el `user_metadata` de Supabase Auth — el propio usuario lo puede editar desde
-- el cliente con `supabase.auth.updateUser({ data: { role: 'admin' } })`. Con
-- checkout de invitado nomás esto era inofensivo (un solo admin creado a mano);
-- en cuanto exista signup público, cualquier cliente podría auto-asignarse ese rol
-- y ver/editar órdenes ajenas. `raw_app_meta_data` (`app_metadata`) es el campo
-- correcto: solo lo puede setear el service-role.
--
-- Esta migración es idempotente (`DROP POLICY IF EXISTS`) y es la fuente de verdad
-- única para las policies de `orders`, reemplazando tanto la migración original
-- (20250209120001_setup_orders_rls.sql) como el script ad-hoc de la raíz
-- (FIX-RLS-UPDATE-DRAFTS.sql) sin importar cuál de los dos esté aplicado hoy en prod.

-- 1. Helper centralizado — evita repetir el EXISTS(...) en cada policy (ahí fue
--    donde se coló la inconsistencia entre USING y WITH CHECK que corregimos abajo).
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
	select exists (
		select 1 from auth.users
		where auth.uid() = id
			and raw_app_meta_data->>'role' = 'admin'
	);
$$;

grant execute on function is_admin() to authenticated;

-- 2. Migrar el flag del admin actual de user_metadata a app_metadata. No depende
--    de conocer su email: mueve el flag de quien sea que lo tenga hoy.
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
where raw_user_meta_data->>'role' = 'admin';

-- 3. Recrear las policies de orders usando is_admin().
drop policy if exists "Admins can view all orders" on orders;
create policy "Admins can view all orders"
	on orders
	for select
	to authenticated
	using (is_admin());

drop policy if exists "Admins can update order status" on orders;
drop policy if exists "admin_update_non_draft_orders" on orders;
drop policy if exists "allow_update_draft_orders" on orders;

create policy "allow_update_draft_orders"
	on orders
	for update
	to anon, authenticated
	using (status = 'draft')
	with check (status = 'draft');

create policy "admin_update_non_draft_orders"
	on orders
	for update
	to authenticated
	using (status != 'draft' and is_admin())
	with check (is_admin());

-- 4. Matching por email case-insensitive: el checkout no normaliza `client_email`
--    tal como se tipeó, pero Supabase Auth sí normaliza el email de signup/login a
--    minúsculas. Sin esto, "John@Gmail.com" (compra vieja) nunca matchea con
--    "john@gmail.com" (login) — false-negativo silencioso ("no tenés compras").
drop policy if exists "Customers can view own orders by email" on orders;
create policy "Customers can view own orders by email"
	on orders
	for select
	to anon, authenticated
	using (
		lower(trim(client_email)) = lower(current_setting('request.jwt.claims', true)::json->>'email')
	);

-- 5. Backfill de datos existentes.
update orders
set client_email = lower(trim(client_email))
where client_email is not null
	and client_email <> lower(trim(client_email));

-- Nota: `raw_user_meta_data.role` del admin queda sin usar pero no rompe nada al
-- dejarlo — ninguna policy lo vuelve a leer después de esta migración.
--
-- IMPORTANTE: antes de mergear, confirmar que flix-box-ultra (el panel admin) no
-- dependa también de `user_metadata.role` en su propio código de login/guards —
-- esto no se puede verificar desde este repo.
