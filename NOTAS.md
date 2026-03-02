# Notas de Desarrollo — Plataforma Bárberos

## Último deploy a Vercel
- URL: https://barberoslm.com
- Fecha: 2026-02-21

## Estado actual (post-auditoría)
- ✅ Bugs de codificación corregidos en OwnerDashboard (`con éxito`)
- ✅ `delete-account` edge function sincronizada localmente
- ✅ Cron job `expire-plans-daily` activo en Supabase (00:05 UTC)
- ✅ Expiración de plan visible en Configuraciones del dueño
- ✅ Botón sol/luna arrastrable y funcionando
- ✅ Modo claro via CSS filter invertido en `#root`

## Pendiente — Admin Dashboard
> Modificaciones en curso...

## Reglas de trabajo
- Sin `npm run build` hasta indicación del usuario
- No subir a Vercel hasta indicación del usuario
- No tocar visual ni estructuras de perfil sin pedirlo
