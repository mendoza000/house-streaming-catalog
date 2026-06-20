-- Origen de cada venta, para separar canales en métricas:
--   'web'    -> catálogo e-commerce (fulfill_order)
--   'bot'    -> Superbot auto-aprobado por WhatsApp
--   'manual' -> entrega/registro manual del admin por Telegram (/deliver, /register)
alter table sales add column if not exists source text check (source in ('bot', 'manual', 'web'));

create index if not exists idx_sales_source on sales(source);

-- Backfill histórico (best-effort: las ventas viejas no guardaban el origen).

-- 1) Web: toda venta linkeada a una orden vino del catálogo.
update sales set source = 'web' where order_id is not null and source is null;

-- 2) Bot (Superbot auto): existe un ticket de WhatsApp aprobado del mismo
--    cliente/servicio en una ventana cercana a la venta.
update sales s
set source = 'bot'
from clients c
where s.client_id = c.id
  and s.order_id is null
  and s.source is null
  and exists (
    select 1
    from tickets t
    where t.client_phone = c.phone
      and t.service_id = c.account_service
      and t.source = 'whatsapp'
      and t.resolved_action = 'approve'
      and t.created_at <= s.created_at
      and t.created_at >= s.created_at - interval '1 day'
  );

-- 3) Resto de ventas directas (sin ticket aprobado) → manual.
update sales set source = 'manual' where source is null;
