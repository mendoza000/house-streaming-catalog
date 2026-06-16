-- Token secreto para seguimiento de orden. El cliente accede a su orden y
-- credenciales vía /orden/[token] sin poder enumerar IDs secuenciales.
-- Se genera solo en cada INSERT (gen_random_uuid), estable a través de los
-- updates del draft.
alter table orders
  add column if not exists tracking_token uuid not null default gen_random_uuid();

create unique index if not exists idx_orders_tracking_token on orders(tracking_token);
