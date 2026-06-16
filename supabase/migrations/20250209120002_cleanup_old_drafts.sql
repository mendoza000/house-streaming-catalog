-- ============================================
-- Limpieza Automática de Órdenes Draft Antiguas
-- ============================================

-- Crear función para limpiar drafts viejos (más de 24 horas)
CREATE OR REPLACE FUNCTION cleanup_old_draft_orders()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar órdenes draft creadas hace más de 24 horas
  DELETE FROM orders
  WHERE status = 'draft'
    AND created_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Para ejecutar manualmente:
-- SELECT cleanup_old_draft_orders();

-- ============================================
-- Configuración de Cron Job (opcional)
-- ============================================

-- OPCIÓN 1: Usando pg_cron (si está disponible en Supabase)
-- Ejecutar diariamente a las 3:00 AM
/*
SELECT cron.schedule(
  'cleanup-draft-orders',
  '0 3 * * *',
  $$SELECT cleanup_old_draft_orders()$$
);
*/

-- OPCIÓN 2: Crear Edge Function y configurar cron desde Dashboard
-- Ver: https://supabase.com/docs/guides/functions/schedule-functions

-- ============================================
-- Verificación
-- ============================================

-- Ver cuántos drafts antiguos hay actualmente
SELECT 
  COUNT(*) as old_drafts_count,
  MIN(created_at) as oldest_draft
FROM orders
WHERE status = 'draft'
  AND created_at < NOW() - INTERVAL '24 hours';

-- Ver todos los drafts con su antigüedad
SELECT 
  id,
  client_email,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as hours_old
FROM orders
WHERE status = 'draft'
ORDER BY created_at DESC;
