-- La migración anterior no marcó 4 servicios porque el comercial_name real
-- difiere del listado. Corrección con los nombres exactos de la DB.
update services set is_by_request = true
where comercial_name in (
	'Canva Pro',
	'Gemini + 2TB de Google drive',
	'Capcut Pro',
	'Netflix (SIN PROBLEMAS DE HOGAR)'
);
