-- ════════════════════════════════════════════════════════════════════
-- MIGRACIÓN CRÍTICA: Constraints para evitar contratación duplicada
-- ════════════════════════════════════════════════════════════════════

-- 1. Crear índice único para evitar duplicados del mismo barbero en la misma barbería
CREATE UNIQUE INDEX IF NOT EXISTS idx_barbers_unique_user_shop 
ON barbers(user_id, barbershop_id) 
WHERE is_approved = true AND barbershop_id IS NOT NULL;

-- 2. Crear índice único para evitar solicitudes pendientes duplicadas
CREATE UNIQUE INDEX IF NOT EXISTS idx_join_requests_unique_pending 
ON join_requests(barber_id, barbershop_id) 
WHERE status = 'pending';

-- 3. Función para verificar si un barbero ya está contratado
CREATE OR REPLACE FUNCTION check_barber_single_employment()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar si el barbero ya tiene una contratación activa
  IF NEW.is_approved = true AND NEW.barbershop_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM barbers 
      WHERE user_id = NEW.user_id 
        AND is_approved = true 
        AND barbershop_id IS NOT NULL
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'El barbero ya está contratado en otra barbería. Un barbero solo puede trabajar en una barbería a la vez.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear trigger para validar antes de insertar o actualizar
DROP TRIGGER IF EXISTS trigger_check_barber_employment ON barbers;
CREATE TRIGGER trigger_check_barber_employment
  BEFORE INSERT OR UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION check_barber_single_employment();

-- 5. Función para auto-rechazar solicitudes pendientes al aprobar una
CREATE OR REPLACE FUNCTION auto_reject_pending_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se aprueba una solicitud, rechazar todas las demás pendientes de ese barbero
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE join_requests 
    SET status = 'rejected'
    WHERE barber_id = NEW.barber_id 
      AND status = 'pending'
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para auto-rechazo
DROP TRIGGER IF EXISTS trigger_auto_reject_requests ON join_requests;
CREATE TRIGGER trigger_auto_reject_requests
  AFTER UPDATE ON join_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_reject_pending_requests();

-- ════════════════════════════════════════════════════════════════════
-- Comentarios de la migración
-- ════════════════════════════════════════════════════════════════════
COMMENT ON INDEX idx_barbers_unique_user_shop IS 
  'Evita que un mismo barbero sea contratado múltiples veces en la misma barbería';

COMMENT ON INDEX idx_join_requests_unique_pending IS 
  'Evita solicitudes pendientes duplicadas del mismo barbero a la misma barbería';

COMMENT ON FUNCTION check_barber_single_employment() IS 
  'Valida que un barbero solo pueda estar contratado en una barbería a la vez';

COMMENT ON FUNCTION auto_reject_pending_requests() IS 
  'Rechaza automáticamente todas las solicitudes pendientes cuando se aprueba una';
