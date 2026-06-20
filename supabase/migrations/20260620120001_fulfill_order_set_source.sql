-- Actualiza fulfill_order para marcar las ventas web con source='web'.
-- (Idéntica a 20260611193304 salvo el INSERT INTO sales, que ahora setea source.)
create or replace function fulfill_order(p_order_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	v_order      orders%rowtype;
	v_items      jsonb;
	v_item       jsonb;
	v_service    int;
	v_price      numeric;
	v_screens    int;
	v_i          int;
	v_account    accounts%rowtype;
	v_screen_no  int;
	v_client_id  bigint;
	v_svc_name   text;
	v_result     jsonb := '[]'::jsonb;
begin
	select * into v_order from orders where id = p_order_id;
	if not found then
		raise exception 'ORDER_NOT_FOUND';
	end if;
	if v_order.status <> 'completed' then
		raise exception 'ORDER_NOT_COMPLETED';
	end if;

	-- Idempotencia: si ya se entregó, devolver lo entregado sin asignar de nuevo.
	if exists (select 1 from sales where order_id = p_order_id) then
		return coalesce((
			select jsonb_agg(jsonb_build_object(
				'service',  sv.comercial_name,
				'mail',     a.mail,
				'password', a.password,
				'screen',   sa.screen
			) order by sa.id)
			from sales sa
			join accounts a on a.id = sa.account_id
			left join services sv on sv.id = a.service
			where sa.order_id = p_order_id
		), '[]'::jsonb);
	end if;

	v_items := coalesce(v_order.items::jsonb, '[]'::jsonb);

	for v_item in select * from jsonb_array_elements(v_items)
	loop
		v_service := (v_item->>'id')::int;
		v_price   := coalesce((v_item->>'price')::numeric, 0);
		v_screens := coalesce((v_item->>'accounts')::int, 1)
		           * coalesce((v_item->>'quantity')::int, 1);
		select comercial_name into v_svc_name from services where id = v_service;

		for v_i in 1..v_screens loop
			-- Cuenta del servicio con pantalla libre, bloqueada para concurrencia.
			select * into v_account
			from accounts a
			where a.service = v_service
				and (select count(*) from clients c where c.account_id = a.id)
				    < coalesce(a.max_clients, 0)
			order by a.id
			for update skip locked
			limit 1;

			if not found then
				raise exception 'OUT_OF_STOCK service %', v_service;
			end if;

			-- Próximo número de pantalla libre (1..max_clients).
			select min(g) into v_screen_no
			from generate_series(1, v_account.max_clients) g
			where g not in (
				select coalesce(c.screen, 0) from clients c where c.account_id = v_account.id
			);

			if v_screen_no is null then
				raise exception 'OUT_OF_STOCK service %', v_service;
			end if;

			insert into clients (name, phone, account_id, account_service, screen, amount, paid, order_id)
			values (v_order.client_name, v_order.client_phone, v_account.id, v_service, v_screen_no, v_price, true, p_order_id)
			returning id into v_client_id;

			insert into sales (account_id, client_id, screen, order_id, source)
			values (v_account.id, v_client_id, v_screen_no, p_order_id, 'web');

			v_result := v_result || jsonb_build_object(
				'service',  v_svc_name,
				'mail',     v_account.mail,
				'password', v_account.password,
				'screen',   v_screen_no
			);
		end loop;
	end loop;

	return v_result;
end;
$$;

grant execute on function fulfill_order(bigint) to service_role;
