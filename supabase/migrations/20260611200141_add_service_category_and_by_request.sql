-- Categoría real por servicio (hoy el catálogo muestra "Streaming" hardcodeado).
alter table services add column if not exists category text;

-- Servicios "bajo pedido": no tienen stock gestionado (no hay accounts con
-- pantallas); su disponibilidad se consulta al admin antes de pagar.
alter table services add column if not exists is_by_request boolean not null default false;

update services set is_by_request = true
where comercial_name in (
	'Spotify', 'Crunchyroll', 'Canva', 'Gemini', 'Paramount',
	'Tidal', 'Deezer', 'CapCut Pro', 'Netflix Extra'
);
