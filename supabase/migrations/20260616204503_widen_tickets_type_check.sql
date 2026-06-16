-- El CHECK de tickets.type solo permitía purchase/support/renewal. Los flujos
-- web agregan 'availability' (consulta de disponibilidad) y 'payment'
-- (validación de pago manual). Ampliamos el constraint.
alter table tickets drop constraint if exists tickets_type_check;
alter table tickets add constraint tickets_type_check
	check (type in ('purchase', 'support', 'renewal', 'availability', 'payment'));
