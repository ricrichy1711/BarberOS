# 🐛 Guía para Solucionar Creación Automática de Barbería

## Descripción del Problema
Cuando un usuario se registra con el rol de **Dueño (Owner)**, se está creando automáticamente una barbería asociada a su cuenta. Esto impide que el dueño vea el formulario de registro de barbería y configure su negocio correctamente desde el inicio.

## Causa Probable
Dado que el código del frontend (`Auth.tsx`, `AuthCallback.tsx`, `DataContext.tsx`) NO contiene llamadas explícitas para crear una barbería durante el registro, es altamente probable que exista un **Database Trigger** en Supabase que se activa automáticamente al insertar un nuevo usuario.

## Pasos para Solucionar

### 1. Inspeccionar Triggers Existentes
Hemos creado un script SQL para ayudarte a identificar el trigger responsable.

1. Abre tu proyecto en Supabase.
2. Ve al **SQL Editor**.
3. Copia y ejecuta el contenido del archivo:
   `database/scripts/inspect_users_triggers.sql`

Este script listará todos los triggers asociados a la tabla `users` y buscará funciones que inserten en `barbershops`.

### 2. Identificar el Culpable
Busca en los resultados del script algún trigger con nombres como:
- `on_auth_user_created`
- `create_profile_for_new_user`
- `handle_new_user`
- `auto_create_shop`

Y verifica si la función asociada contiene `INSERT INTO barbershops` (o referencias a la tabla `barbershops`).

### 3. Eliminar el Trigger Problemático
Una vez identificado el trigger (digamos que se llama `trigger_crear_barberia_auto`), elimínalo ejecutando el siguiente comando en el SQL Editor:

```sql
DROP TRIGGER IF EXISTS trigger_crear_barberia_auto ON users;
-- Opcional: Eliminar la función asociada si no hace nada más útil
-- DROP FUNCTION IF EXISTS funcion_crear_barberia_auto();
```

### 4. Verificar la Solución
1. Crea una nueva cuenta de prueba con rol de Dueño.
2. Verifica que NO se cree una barbería automáticamente.
3. Deberías ver el formulario "Registrar Barbería" al iniciar sesión por primera vez.

## Logs de Depuración
Hemos agregado logs en la consola del navegador (`F12` -> `Console`) para confirmar que el frontend no está llamando a la función de creación:
- Busca mensajes que empiecen con `🏭 DataContext:` o `🏪 OwnerDashboard:`.
- Si ves "addBarbershop called explicitly", entonces SÍ es el frontend (haznos saber).
- Si NO ves ese mensaje pero la barbería aparece, confirmas que es un Trigger de Base de Datos.
