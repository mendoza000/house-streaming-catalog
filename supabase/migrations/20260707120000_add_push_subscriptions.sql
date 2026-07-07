-- Suscripciones de Web Push del panel admin (flix-box-ultra). Cada fila es un
-- dispositivo/navegador suscripto de un admin logueado (auth.users). Solo se
-- lee/escribe vía supabaseAdmin (service-role) desde route handlers de ese
-- panel — sin policies públicas, RLS forzado como defensa en profundidad.
create table if not exists push_subscriptions (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references auth.users(id) on delete cascade,
	endpoint text not null unique,
	p256dh text not null,
	auth_key text not null,
	created_at timestamptz not null default now()
);

create index if not exists idx_push_subscriptions_user_id on push_subscriptions(user_id);

alter table push_subscriptions enable row level security;
alter table push_subscriptions force row level security;
