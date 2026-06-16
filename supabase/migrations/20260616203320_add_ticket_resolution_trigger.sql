-- Cuando el admin resuelve por Telegram un ticket de pago originado en la web
-- (source='web', type='payment'), reflejar la decisión en la orden:
--   approved → orden completed + entregar (fulfill_order), server-side, sin
--              depender de que la página del cliente esté abierta.
--   rejected → orden failed.
--
-- fulfill_order se envuelve en EXCEPTION: si no hay stock (OUT_OF_STOCK) NO se
-- aborta la aprobación; la orden queda completed y la entrega se hace a mano.
create or replace function on_web_ticket_resolved()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
	-- Solo tickets de pago web, y solo cuando el status realmente cambió.
	if NEW.source <> 'web' or NEW.type <> 'payment' then
		return NEW;
	end if;
	if NEW.status is not distinct from OLD.status then
		return NEW;
	end if;
	if NEW.order_id is null then
		return NEW;
	end if;

	if NEW.status = 'approved' then
		update orders set status = 'completed'
		where id = NEW.order_id and status <> 'completed';

		begin
			perform fulfill_order(NEW.order_id);
		exception when others then
			raise warning 'fulfill_order failed for order %: %', NEW.order_id, sqlerrm;
		end;
	elsif NEW.status = 'rejected' then
		update orders set status = 'failed'
		where id = NEW.order_id and status not in ('completed', 'failed');
	end if;

	return NEW;
end;
$$;

drop trigger if exists trg_web_ticket_resolved on tickets;
create trigger trg_web_ticket_resolved
	after update on tickets
	for each row
	execute function on_web_ticket_resolved();
