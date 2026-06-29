-- Override manual del estado de venta por servicio en el catálogo.
-- Permite al admin forzar disponibilidad independientemente del stock:
--   null  -> automático (default): se decide por stock (vista service_stock / proveedor / bajo pedido)
--   true  -> forzar habilitado: vendible aunque no haya stock (cae al flujo "bajo pedido" / fulfillment manual)
--   false -> forzar deshabilitado: no vendible aunque haya stock ("No disponible" en el catálogo)
alter table public.services add column if not exists sales_override boolean;

comment on column public.services.sales_override is
  'Override de venta en catálogo. null=automático (según stock); true=forzar habilitado (vende aunque no haya stock, vía bajo pedido); false=forzar deshabilitado (no vende aunque haya stock).';
