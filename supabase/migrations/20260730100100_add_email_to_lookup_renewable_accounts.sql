-- Agrega el email de la compra original a `lookup_renewable_accounts`.
--
-- `createRenewalOrder` (src/api/renewals.ts) hoy solo guarda `client_phone` en la
-- orden de renovación, nunca `client_email` — porque esta función nunca tocaba
-- `orders`, solo `clients`+`services`. Sin email, un cliente logueado no ve sus
-- renovaciones en "Mis compras" (que filtra por client_email). Se agrega un LEFT
-- JOIN a orders (vía clients.order_id, la compra original de esa pantalla) para
-- que el código pueda stampear ese email en la orden de renovación nueva.
--
-- Postgres no permite cambiar el tipo de retorno de una función vía
-- CREATE OR REPLACE (agregar una columna cuenta como cambio de tipo) — hay que
-- dropearla primero.
drop function if exists lookup_renewable_accounts(text);

create function lookup_renewable_accounts(p_phone text)
returns table (
	client_id         bigint,
	service_id        int,
	service           text,
	screen            int,
	expires_at        timestamptz,
	screen_price      numeric,
	order_client_email text
)
language sql
stable
security definer
set search_path = public
as $$
	with norm as (
		select right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10) as digits
	)
	select
		c.id                                          as client_id,
		c.account_service                             as service_id,
		sv.comercial_name                              as service,
		c.screen                                       as screen,
		c.expires_at                                   as expires_at,
		coalesce(sv.screen_price, c.amount, 0)         as screen_price,
		lower(trim(o.client_email))                    as order_client_email
	from clients c
	join services sv on sv.id = c.account_service
	left join orders o on o.id = c.order_id
	cross join norm
	where length(norm.digits) >= 7
		and right(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), 10) = norm.digits
		and coalesce(c.is_reseller_customer, false) = false
	order by c.expires_at asc nulls last;
$$;

grant execute on function lookup_renewable_accounts(text) to service_role;
