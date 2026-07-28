-- Cola de mensajes de WhatsApp que el panel admin (flix-box-ultra) encola y
-- wabot-v3 consume por polling (el bot corre en un telefono detras de NAT,
-- no puede recibir webhooks entrantes — mismo motivo por el que la entrega
-- de ordenes ya usa un poller sobre `orders` en vez de un webhook).
--
-- Solo se escribe desde el service-role del panel; RLS forzado, sin
-- policies publicas, como defensa en profundidad (mismo patron que
-- push_subscriptions).
create table if not exists whatsapp_outbox (
	id uuid primary key default gen_random_uuid(),
	client_id bigint not null references clients(id) on delete cascade,
	account_id bigint not null references accounts(id) on delete cascade,
	notification_type text not null check (notification_type in ('password_changed', 'new_credentials')),
	status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
	error text,
	created_by uuid references auth.users(id),
	created_at timestamptz not null default now(),
	sent_at timestamptz
);

create index if not exists idx_whatsapp_outbox_pending on whatsapp_outbox(status, created_at) where status = 'pending';

alter table whatsapp_outbox enable row level security;
alter table whatsapp_outbox force row level security;
