-- Renovación: respetar el día de pago (15/25) al recalcular el vencimiento.
--
-- La versión previa de renew_order hacía expires_at = greatest(hoy, vencimiento) + meses.
-- Para cuentas ACTIVAS eso ya caía bien (sumar meses preserva el día del mes, que ya
-- era 15/25). Para cuentas VENCIDAS la base era `hoy`, así que el nuevo vencimiento caía
-- en un día arbitrario (ej. el 22) en vez del día de pago del cliente, desalineándose del
-- modelo de buckets que usa el bot para los recordatorios.
--
-- Ahora: si la cuenta sigue activa, se extiende desde su vencimiento (ya en el bucket);
-- si venció (o no tiene fecha), se arranca desde la próxima ocurrencia del `day` del
-- cliente (15/25) y se suman los meses — misma regla que clients_set_expiry para una
-- compra nueva. Si el cliente no tiene `day`, se deriva del día de hoy (3..20 -> 15, resto
-- -> 25) y se persiste.

create or replace function renew_order(p_order_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
	v_order      orders%rowtype;
	v_items      jsonb;
	v_item       jsonb;
	v_client_id  bigint;
	v_months     int;
	v_client     clients%rowtype;
	v_day        int;
	v_candidate  timestamptz;
	v_new        timestamptz;
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
	if v_order.kind <> 'renewal' then
		raise exception 'ORDER_NOT_RENEWAL';
	end if;

	-- Idempotencia: ya aplicada → devolver el resumen existente.
	if exists (select 1 from renewals where order_id = p_order_id) then
		return coalesce((
			select jsonb_agg(jsonb_build_object(
				'service',    sv.comercial_name,
				'screen',     c.screen,
				'expires_at', r.new_expires_at
			) order by r.id)
			from renewals r
			join clients c on c.id = r.client_id
			left join services sv on sv.id = c.account_service
			where r.order_id = p_order_id
		), '[]'::jsonb);
	end if;

	v_items := coalesce(v_order.items::jsonb, '[]'::jsonb);

	for v_item in select * from jsonb_array_elements(v_items)
	loop
		v_client_id := (v_item->>'client_id')::bigint;
		v_months    := coalesce((v_item->>'months')::int, 1);
		if v_client_id is null then
			continue;
		end if;

		select * into v_client from clients where id = v_client_id for update;
		if not found then
			continue;
		end if;

		if v_client.expires_at is not null and v_client.expires_at > now() then
			-- Activa: extender desde el vencimiento vigente (ya cae en el día de pago).
			v_day := v_client.day;
			v_new := v_client.expires_at + make_interval(months => v_months);
		else
			-- Vencida / sin fecha: arrancar desde la próxima ocurrencia del día de pago.
			v_day := coalesce(
				v_client.day,
				case when extract(day from now())::int between 3 and 20 then 15 else 25 end
			);
			v_candidate := date_trunc('month', now()) + make_interval(days => v_day - 1);
			if v_candidate < now() then
				v_candidate := v_candidate + interval '1 month';
			end if;
			v_new := v_candidate + make_interval(months => v_months);
		end if;

		-- expires_at explícito → clients_set_expiry NO lo recalcula. Persistimos day por
		-- si era null (para que el bot lo agrupe en el bucket correcto).
		update clients
		set expires_at = v_new, paid = true, day = v_day
		where id = v_client_id;

		insert into renewals (order_id, client_id, months, old_expires_at, new_expires_at)
		values (p_order_id, v_client_id, v_months, v_client.expires_at, v_new);

		select comercial_name into v_svc_name from services where id = v_client.account_service;

		v_result := v_result || jsonb_build_object(
			'service',    v_svc_name,
			'screen',     v_client.screen,
			'expires_at', v_new
		);
	end loop;

	return v_result;
end;
$$;

grant execute on function renew_order(bigint) to service_role;
