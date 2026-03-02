# Guía de Configuración - Barber OS Five

## 1. ¿Dónde configurar los Horarios de Negocio (businessHours)?

Los horarios de negocio se configuran en el **Owner Dashboard**:

### Pasos:
1. Inicia sesión como **Owner** (dueño de la barbería)
2. Ve a **Owner Dashboard**
3. Haz clic en la pestaña **"Mi Negocio"**
4. Busca la sección **"Horarios de Atención"**
5. Expande la sección haciendo clic en el botón
6. Configura los horarios para cada día de la semana:
   - **Lunes a Domingo**: Establece hora de apertura y cierre
   - **Días cerrados**: Marca el checkbox "Cerrado" para días sin servicio
7. Haz clic en **"Guardar Horarios"**

### Formato de Horarios:
- Formato 24 horas (HH:MM)
- Ejemplo: 09:00 - 18:00
- Los horarios se guardan en la base de datos en el campo `business_hours`

### Estructura en la base de datos:
```json
{
  "0": { "open": "10:00", "close": "18:00", "closed": false },  // Domingo
  "1": { "open": "09:00", "close": "20:00", "closed": false },  // Lunes
  "2": { "open": "09:00", "close": "20:00", "closed": false },  // Martes
  "3": { "open": "09:00", "close": "20:00", "closed": false },  // Miércoles
  "4": { "open": "09:00", "close": "20:00", "closed": false },  // Jueves
  "5": { "open": "09:00", "close": "20:00", "closed": false },  // Viernes
  "6": { "open": "10:00", "close": "18:00", "closed": false }   // Sábado
}
```

---

## 2. Problema: Las solicitudes para unirse a una barbería no llegan al dueño

### Causa del problema:
El sistema de solicitudes (`joinRequests`) necesita verificación en el flujo de datos.

### Verificación en la base de datos:

1. **Tabla `join_requests`** debe existir con:
   ```sql
   - id (uuid)
   - user_id (uuid) - ID del barbero que solicita
   - barbershop_id (uuid) - ID de la barbería
   - status (text) - 'pending', 'approved', 'rejected'
   - created_at (timestamp)
   ```

2. **Verificar que la función `joinBarbershop` en DataContext** esté creando correctamente los registros:
   - Archivo: `src/contexts/DataContext.tsx`
   - Función: `joinBarbershop`
   - Debe insertar en la tabla `join_requests`

3. **Verificar que el Owner Dashboard** esté leyendo las solicitudes:
   - Archivo: `src/pages/OwnerDashboard.tsx`
   - Sección: "Solicitudes Pendientes" en la pestaña Overview
   - Debe mostrar `joinRequests` del DataContext

### Solución si no funciona:

#### Opción A: Verificar en Supabase
1. Ve a tu proyecto en Supabase
2. Abre el **SQL Editor**
3. Ejecuta:
   ```sql
   SELECT * FROM join_requests WHERE status = 'pending';
   ```
4. Verifica si hay solicitudes pendientes

#### Opción B: Verificar permisos RLS (Row Level Security)
1. En Supabase, ve a **Authentication > Policies**
2. Verifica que la tabla `join_requests` tenga políticas que permitan:
   - **INSERT**: Usuarios autenticados pueden crear solicitudes
   - **SELECT**: Owners pueden ver solicitudes de sus barberías

#### Opción C: Revisar el código
Verifica en `src/contexts/DataContext.tsx` que:
```typescript
const joinBarbershop = async (barbershopId: string) => {
  const { error } = await supabase
    .from('join_requests')
    .insert({
      user_id: currentUser?.id,
      barbershop_id: barbershopId,
      status: 'pending'
    });
  
  if (error) console.error('Error joining barbershop:', error);
  await fetchData(); // Recargar datos
};
```

---

## 3. Nuevo Diseño del BookingWidget

### Cambios implementados:
✅ **Barras horizontales compactas** para cada paso
✅ **Scroll horizontal** para opciones múltiples
✅ **Numeración clara**: 1. Servicio, 2. Barbero, 3. Fecha, 4. Hora
✅ **Calendario compacto** con días de la semana abreviados
✅ **Resumen en grid 2x2** más compacto
✅ **Mensajes de error claros** cuando falta configuración

### Flujo de usuario:
1. Selecciona servicio → Barra horizontal con scroll
2. Selecciona barbero → Barra horizontal con scroll
3. Selecciona fecha → Calendario mensual compacto
4. Selecciona hora → Barra horizontal con scroll
5. Revisa resumen → Grid compacto 2x2
6. Confirma reserva → Botón grande

---

## Resumen de Problemas Resueltos

✅ BookingWidget ahora usa diseño compacto con barras horizontales
✅ Calendario más pequeño y elegante
✅ Mensaje claro sobre dónde configurar horarios de negocio
📋 Guía para verificar problema de solicitudes de unirse a barbería

## Próximos Pasos

1. **Configurar horarios** en Owner Dashboard → Mi Negocio → Horarios de Atención
2. **Verificar solicitudes** en la base de datos Supabase
3. **Probar el flujo de reservas** desde el Directory como cliente
