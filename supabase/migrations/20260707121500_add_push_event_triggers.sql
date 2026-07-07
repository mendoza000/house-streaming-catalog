-- Dispara un webhook HTTP hacia el panel admin (flix-box-ultra) cuando entra
-- una venta nueva o un ticket de pago web pendiente, para que dispare un Web
-- Push real al admin. pg_net es asíncrono: no bloquea el INSERT ni puede
-- tumbarlo si el endpoint externo está caído.
--
-- El secreto compartido vive en Supabase Vault (nunca hardcodeado acá) bajo
-- el nombre 'push_webhook_secret', y el mismo valor está cargado como
-- PUSH_WEBHOOK_SECRET en Vercel (proyecto flix-box-ultra).
create extension if not exists pg_net;

create or replace function notify_sale_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
	v_secret text;
begin
	select decrypted_secret into v_secret
	from vault.decrypted_secrets
	where name = 'push_webhook_secret';

	perform net.http_post(
		url := 'https://fbx000.vercel.app/api/webhooks/sales',
		body := jsonb_build_object(
			'event', 'sale.created',
			'record', to_jsonb(NEW.*)
		),
		headers := jsonb_build_object(
			'Content-Type', 'application/json',
			'x-webhook-secret', v_secret
		),
		timeout_milliseconds := 5000
	);

	return NEW;
end;
$$;

drop trigger if exists trg_notify_sale_created on sales;
create trigger trg_notify_sale_created
	after insert on sales
	for each row
	execute function notify_sale_created();

-- Mismo mecanismo para tickets de pago web pendientes de validar. Guard
-- idéntico al de `on_web_ticket_resolved`: solo dispara para el caso real
-- (pago manual originado en el catálogo), no para disponibilidad ni tickets
-- del bot de WhatsApp.
create or replace function notify_payment_ticket_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
	v_secret text;
begin
	if NEW.source <> 'web' or NEW.type <> 'payment' then
		return NEW;
	end if;

	select decrypted_secret into v_secret
	from vault.decrypted_secrets
	where name = 'push_webhook_secret';

	perform net.http_post(
		url := 'https://fbx000.vercel.app/api/webhooks/payment-ticket',
		body := jsonb_build_object(
			'event', 'payment.pending',
			'record', to_jsonb(NEW.*)
		),
		headers := jsonb_build_object(
			'Content-Type', 'application/json',
			'x-webhook-secret', v_secret
		),
		timeout_milliseconds := 5000
	);

	return NEW;
end;
$$;

drop trigger if exists trg_notify_payment_ticket_created on tickets;
create trigger trg_notify_payment_ticket_created
	after insert on tickets
	for each row
	execute function notify_payment_ticket_created();
