-- Marca de notificación de entrega por WhatsApp.
--
-- El bot (wabot-v3) corre en un teléfono detrás de NAT: no puede recibir webhooks
-- ni exponer un endpoint. En vez de empujarle la notificación, el bot POLEA esta
-- tabla de forma saliente y, cuando encuentra una orden 'completed' con pantallas
-- asignadas (filas en clients/sales) y delivery_notified_at NULL, le manda las
-- credenciales al cliente por WhatsApp y setea delivery_notified_at.
--
-- Esta columna es la ÚNICA clave de dedupe: todos los caminos que entregan
-- (dashboard flix-box-ultra vía fulfill_order, página de seguimiento del catálogo,
-- entrega manual por Telegram, ventas automáticas del superbot) terminan marcando
-- aquí, así el cliente recibe el WhatsApp exactamente una vez.
alter table orders add column if not exists delivery_notified_at timestamptz;

-- Backfill: las órdenes que YA tienen ventas se consideran notificadas, para que
-- el primer ciclo del poller no le reenvíe credenciales a clientes históricos
-- (incluida la #15, que se notifica a mano).
update orders
set delivery_notified_at = now()
where delivery_notified_at is null
  and id in (select distinct order_id from sales where order_id is not null);
