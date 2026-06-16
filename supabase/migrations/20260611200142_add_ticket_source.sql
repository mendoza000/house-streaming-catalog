-- Distingue el origen de un ticket: 'whatsapp' (bot) vs 'web' (catálogo).
-- El catálogo inserta consultas de disponibilidad con source='web'; el bot Go
-- las detecta (poller), pregunta al admin por Telegram y resuelve el ticket.
alter table tickets add column if not exists source text not null default 'whatsapp';

create index if not exists idx_tickets_source_status on tickets(source, status);
