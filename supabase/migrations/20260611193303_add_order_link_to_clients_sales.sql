-- Linkear las entregas (clients/sales) a la orden e-commerce que las generó.
-- Sirve para idempotencia (saber si una orden ya se entregó) y trazabilidad.
alter table clients add column if not exists order_id bigint references orders(id);
alter table sales   add column if not exists order_id bigint references orders(id);

create index if not exists idx_sales_order_id on sales(order_id);
create index if not exists idx_clients_order_id on clients(order_id);
