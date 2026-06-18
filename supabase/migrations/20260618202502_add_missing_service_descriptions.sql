-- Varios servicios quedaron sin description (cadena vacía o NULL) en la DB.
-- Confirmamos las filas exactas desde el dashboard de Supabase y completamos
-- la copia faltante.
--
-- Los UPDATE son idempotentes: solo escriben cuando description está vacía o
-- NULL, así nunca pisamos textos ya cargados a mano.

update public.services
set description = 'Mira canales de TV en vivo, deportes y entretenimiento desde cualquier dispositivo.'
where id = 11 and (description is null or description = '');

update public.services
set description = 'Disfruta de películas, series exclusivas y deportes en vivo con Paramount+.'
where id = 12 and (description is null or description = '');

update public.services
set description = 'Escucha música en calidad HiFi sin pérdida, con la más alta fidelidad de audio.'
where id = 13 and (description is null or description = '');

update public.services
set description = 'Millones de canciones y podcasts sin anuncios, con recomendaciones hechas a tu medida.'
where id = 14 and (description is null or description = '');

update public.services
set description = 'Edita videos como un profesional con funciones premium, efectos y exportación sin marca de agua.'
where id = 15 and (description is null or description = '');

update public.services
set description = 'Tu Netflix sin restricciones de hogar: mira tus series y películas favoritas donde quieras.'
where id = 16 and (description is null or description = '');

update public.services
set description = 'El asistente de IA de Google con 2TB de almacenamiento en Drive para potenciar tu productividad.'
where id = 17 and (description is null or description = '');

update public.services
set description = 'Navega seguro y sin límites: protege tu conexión y accede a contenido de todo el mundo.'
where id = 18 and (description is null or description = '');
