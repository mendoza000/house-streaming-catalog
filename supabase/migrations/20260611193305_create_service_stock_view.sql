-- Stock por servicio = pantallas totales (Σ max_clients de sus cuentas) menos
-- pantallas ocupadas (clients asignados a esas cuentas).
-- Vista agregada: devuelve SOLO conteos, nunca credenciales, así que es segura
-- para exponer a anon aunque la tabla accounts tenga RLS.
create or replace view service_stock as
select
	s.id as service_id,
	coalesce(sum(a.max_clients), 0)::int as capacity,
	greatest(
		coalesce(sum(a.max_clients), 0) - coalesce(sum(occ.cnt), 0),
		0
	)::int as available
from services s
left join accounts a on a.service = s.id
left join lateral (
	select count(*) as cnt from clients c where c.account_id = a.id
) occ on true
group by s.id;

grant select on service_stock to anon, authenticated;
