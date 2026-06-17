-- Vencimiento y renovación de cuentas (mejora #6 del vault).
--
-- Hasta ahora una venta web entregaba pantallas (fulfill_order crea clients) pero
-- descartaba los `months` comprados: no se sabía cuándo vencía la cuenta y esas ventas
-- no entraban al ciclo de recordatorios del bot.
--
-- Modelo: el bot sigue razonando por `day` (15/25). Agregamos `months` + `expires_at`
-- a clients y centralizamos el cálculo en un trigger (fuente única de verdad para los
-- tres writers: fulfill_order, dashboard, bot). El vencimiento vive en clients (la
-- pantalla vendida), no en accounts.

alter table clients add column if not exists months     int;
alter table clients add column if not exists expires_at timestamptz;

create index if not exists idx_clients_expires_at on clients(expires_at);

-- Calcula day (bucket de recordatorio) y expires_at a partir de `months` y la fecha de
-- alta. Regla:
--   * day-of-month de la compra 3..20  -> day = 15 ; resto -> day = 25
--   * expires_at = primera ocurrencia del day (15/25) >= fecha de alta, + months meses
-- Sólo actúa cuando hay `months`. No pisa un expires_at explícito (ej. renovación).
create or replace function clients_set_expiry()
returns trigger
language plpgsql
as $$
declare
	v_start     timestamptz;
	v_dom       int;
	v_bucket    int;
	v_candidate timestamptz;
begin
	if NEW.months is null then
		return NEW;
	end if;

	if TG_OP = 'UPDATE' then
		-- Recalcular sólo si cambió months y el caller NO fijó expires_at a mano.
		if NEW.months is not distinct from OLD.months then
			return NEW;
		end if;
		if NEW.expires_at is distinct from OLD.expires_at then
			return NEW;
		end if;
	else
		-- INSERT: respetar un expires_at explícito si vino.
		if NEW.expires_at is not null then
			return NEW;
		end if;
	end if;

	v_start  := coalesce(NEW.created_at, now());
	v_dom    := extract(day from v_start)::int;
	v_bucket := case when v_dom between 3 and 20 then 15 else 25 end;

	-- Día `v_bucket` del mes de alta; si ya pasó, el del mes siguiente.
	v_candidate := date_trunc('month', v_start) + make_interval(days => v_bucket - 1);
	if v_candidate < v_start then
		v_candidate := v_candidate + interval '1 month';
	end if;

	NEW.day        := v_bucket;
	NEW.expires_at := v_candidate + make_interval(months => NEW.months);

	return NEW;
end;
$$;

drop trigger if exists trg_clients_set_expiry on clients;
create trigger trg_clients_set_expiry
	before insert or update on clients
	for each row
	execute function clients_set_expiry();

-- Re-crear fulfill_order para que propague `months` al INSERT de clients. El trigger
-- completa day + expires_at. Único cambio respecto de la versión previa: la columna
-- months en el insert (línea marcada).
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
	v_months     int;
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
				'service',    sv.comercial_name,
				'mail',       a.mail,
				'password',   a.password,
				'screen',     sa.screen,
				'expires_at', c.expires_at
			) order by sa.id)
			from sales sa
			join accounts a on a.id = sa.account_id
			left join clients c on c.id = sa.client_id
			left join services sv on sv.id = a.service
			where sa.order_id = p_order_id
		), '[]'::jsonb);
	end if;

	v_items := coalesce(v_order.items::jsonb, '[]'::jsonb);

	for v_item in select * from jsonb_array_elements(v_items)
	loop
		v_service := (v_item->>'id')::int;
		v_price   := coalesce((v_item->>'price')::numeric, 0);
		v_months  := coalesce((v_item->>'months')::int, 1);
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

			-- months viaja al insert; el trigger clients_set_expiry calcula day + expires_at.
			insert into clients (name, phone, account_id, account_service, screen, amount, paid, order_id, months)
			values (v_order.client_name, v_order.client_phone, v_account.id, v_service, v_screen_no, v_price, true, p_order_id, v_months)
			returning id into v_client_id;

			insert into sales (account_id, client_id, screen, order_id)
			values (v_account.id, v_client_id, v_screen_no, p_order_id);

			v_result := v_result || jsonb_build_object(
				'service',    v_svc_name,
				'mail',       v_account.mail,
				'password',   v_account.password,
				'screen',     v_screen_no,
				'expires_at', (select expires_at from clients where id = v_client_id)
			);
		end loop;
	end loop;

	return v_result;
end;
$$;

grant execute on function fulfill_order(bigint) to service_role;
