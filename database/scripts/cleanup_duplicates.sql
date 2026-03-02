-- ════════════════════════════════════════════════════════════════════
-- SCRIPT DE LIMPIEZA: Detectar y corregir contrataciones duplicadas
-- ════════════════════════════════════════════════════════════════════
-- ADVERTENCIA: Este script debe ejecutarse ANTES de aplicar las constraints
-- ════════════════════════════════════════════════════════════════════

-- 1. DETECTAR barberos contratados múltiples veces
DO $$
DECLARE
  duplicate_record RECORD;
  records_found INTEGER := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'VERIFICACIÓN DE CONTRATACIONES DUPLICADAS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  -- Buscar barberos con múltiples contrataciones activas
  FOR duplicate_record IN
    SELECT 
      b.user_id,
      b.name,
      COUNT(*) as contrataciones,
      STRING_AGG(DISTINCT bs.name, ', ') as barberias
    FROM barbers b
    LEFT JOIN barbershops bs ON b.barbershop_id = bs.id
    WHERE b.is_approved = true 
      AND b.barbershop_id IS NOT NULL
    GROUP BY b.user_id, b.name
    HAVING COUNT(*) > 1
  LOOP
    records_found := records_found + 1;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ DUPLICADO ENCONTRADO:';
    RAISE NOTICE '   Barbero: %', duplicate_record.name;
    RAISE NOTICE '   Contrataciones: %', duplicate_record.contrataciones;
    RAISE NOTICE '   Barberías: %', duplicate_record.barberias;
  END LOOP;
  
  IF records_found = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ No se encontraron contrataciones duplicadas';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'TOTAL DE BARBEROS CON DUPLICADOS: %', records_found;
  END IF;
END $$;

-- 2. DETECTAR solicitudes pendientes de barberos ya contratados
DO $$
DECLARE
  pending_record RECORD;
  records_found INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'VERIFICACIÓN DE SOLICITUDES DE BARBEROS CONTRATADOS';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  FOR pending_record IN
    SELECT 
      jr.barber_name,
      bs_req.name as barberia_solicitud,
      bs_curr.name as barberia_actual
    FROM join_requests jr
    INNER JOIN barbers b ON jr.barber_id = b.user_id
    INNER JOIN barbershops bs_req ON jr.barbershop_id = bs_req.id
    LEFT JOIN barbershops bs_curr ON b.barbershop_id = bs_curr.id
    WHERE jr.status = 'pending'
      AND b.is_approved = true
      AND b.barbershop_id IS NOT NULL
  LOOP
    records_found := records_found + 1;
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ SOLICITUD PENDIENTE DE BARBERO CONTRATADO:';
    RAISE NOTICE '   Barbero: %', pending_record.barber_name;
    RAISE NOTICE '   Solicitud para: %', pending_record.barberia_solicitud;
    RAISE NOTICE '   Ya contratado en: %', pending_record.barberia_actual;
  END LOOP;
  
  IF records_found = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ No hay solicitudes pendientes de barberos contratados';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════';
    RAISE NOTICE 'TOTAL DE SOLICITUDES PROBLEMÁTICAS: %', records_found;
  END IF;
END $$;

-- 3. LIMPIEZA AUTOMÁTICA (comentado por seguridad - descomentar para ejecutar)
/*
-- Opción 1: Rechazar solicitudes pendientes de barberos ya contratados
UPDATE join_requests
SET status = 'rejected'
WHERE status = 'pending'
  AND barber_id IN (
    SELECT user_id 
    FROM barbers 
    WHERE is_approved = true 
      AND barbershop_id IS NOT NULL
  );

-- Opción 2: Para duplicados, mantener solo la contratación más antigua
-- ADVERTENCIA: Esto eliminará registros. Hacer backup primero.
WITH ranked_barbers AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id 
      ORDER BY created_at ASC
    ) as rn
  FROM barbers
  WHERE is_approved = true 
    AND barbershop_id IS NOT NULL
)
DELETE FROM barbers
WHERE id IN (
  SELECT id FROM ranked_barbers WHERE rn > 1
);
*/

-- 4. Verificación final
DO $$
DECLARE
  total_duplicates INTEGER;
  total_pending_invalid INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'RESUMEN FINAL';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  SELECT COUNT(DISTINCT user_id)
  INTO total_duplicates
  FROM (
    SELECT user_id
    FROM barbers
    WHERE is_approved = true AND barbershop_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) dup;
  
  SELECT COUNT(*)
  INTO total_pending_invalid
  FROM join_requests jr
  WHERE jr.status = 'pending'
    AND EXISTS (
      SELECT 1 FROM barbers b
      WHERE b.user_id = jr.barber_id
        AND b.is_approved = true
        AND b.barbershop_id IS NOT NULL
    );
  
  RAISE NOTICE 'Barberos con contrataciones duplicadas: %', total_duplicates;
  RAISE NOTICE 'Solicitudes pendientes inválidas: %', total_pending_invalid;
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  
  IF total_duplicates = 0 AND total_pending_invalid = 0 THEN
    RAISE NOTICE '✅ BASE DE DATOS LISTA PARA APLICAR CONSTRAINTS';
  ELSE
    RAISE NOTICE '⚠️ RESOLVER PROBLEMAS ANTES DE APLICAR CONSTRAINTS';
  END IF;
END $$;
