-- Linkea un ticket de validación de pago (web) a la orden del catálogo, para
-- que al aprobarlo el trigger sepa qué orden completar y entregar.
alter table tickets add column if not exists order_id bigint references orders(id);
create index if not exists idx_tickets_order_id on tickets(order_id);
