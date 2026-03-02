-- ════════════════════════════════════════════════════════════════════
-- SCRIPT DE INSPECCIÓN: Detectar triggers en la tabla 'users'
-- ════════════════════════════════════════════════════════════════════
-- Ejecuta este script en el Editor SQL de Supabase para encontrar
-- el trigger que está creando barberías automáticamente.
-- ════════════════════════════════════════════════════════════════════

-- 1. Listar todos los triggers asociados a la tabla 'users'
SELECT 
    trigger_name,
    event_manipulation AS evento,
    action_statement AS accion,
    action_timing AS momento
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- 2. Buscar funciones que inserten en la tabla 'barbershops'
-- (Esto ayuda a identificar qué función está causando el problema)
SELECT 
    routine_name AS nombre_funcion,
    routine_definition AS codigo
FROM information_schema.routines
WHERE routine_definition ILIKE '%INSERT INTO%barbershops%'
   OR routine_definition ILIKE '%insert into%barbershops%';

-- ════════════════════════════════════════════════════════════════════
-- INSTRUCCIONES PARA ELIMINAR EL TRIGGER (Una vez identificado)
-- ════════════════════════════════════════════════════════════════════
-- Si encuentras un trigger sospechoso (ej. 'on_auth_user_created'),
-- ejecuta el siguiente comando reemplazando 'NOMBRE_DEL_TRIGGER':
--
-- DROP TRIGGER IF EXISTS NOMBRE_DEL_TRIGGER ON users;
--
-- También puedes eliminar la función asociada si ya no se necesita:
--
-- DROP FUNCTION IF EXISTS NOMBRE_DE_LA_FUNCION();
-- ════════════════════════════════════════════════════════════════════
