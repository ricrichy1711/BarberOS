import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    console.log("--- 🗑️ INICIANDO PROCESO DE ELIMINACIÓN DE CUENTA ---");

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        const authHeader = req.headers.get('Authorization');
        const hasAuth = !!authHeader;
        console.log("Header Authorization presente:", hasAuth);

        if (!authHeader) {
            console.error("❌ No hay header de autorización");
            return new Response(JSON.stringify({
                error: 'No authorization header',
                diagnostics: { hasAuth, method: req.method, url: req.url }
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Cliente para verificar al usuario (usando su propio token)
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await userClient.auth.getUser();
        let uid = user?.id;
        let extractionMethod = 'getUser';

        if (userError || !user) {
            console.warn("⚠️ getUser() falló, intentando extraer UID del token manualmente:", userError?.message);
            extractionMethod = 'manual_fallback';
            try {
                const token = authHeader.replace('Bearer ', '');
                const parts = token.split('.');
                if (parts.length !== 3) throw new Error(`Token malformado: ${parts.length} partes`);

                const payloadStr = atob(parts[1]);
                const payload = JSON.parse(payloadStr);
                uid = payload.sub;
                console.log("✅ UID extraído del token:", uid);
            } catch (e: any) {
                console.error("❌ No se pudo extraer el UID del token:", e.message);
                return new Response(JSON.stringify({
                    error: 'Unauthorized',
                    message: 'No se pudo verificar tu identidad (Token inválido)',
                    diagnostics: {
                        userError: userError?.message,
                        extractionError: e.message,
                        hasAuth,
                        tokenParts: authHeader.replace('Bearer ', '').split('.').length
                    }
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        if (!uid) {
            console.error("❌ No se pudo identificar al usuario de ninguna forma");
            return new Response(JSON.stringify({
                error: 'No se pudo identificar al usuario',
                diagnostics: { extractionMethod, hasUser: !!user }
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`👤 Procesando eliminación para UID: ${uid} via ${extractionMethod}`);

        // Cliente admin para borrar datos sin restricciones de RLS
        const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Obtener IDs de barberías y registros de barbero
        const { data: userShops } = await admin.from('barbershops').select('id').eq('owner_id', uid);
        const shopIds = (userShops ?? []).map((s) => s.id);

        const { data: userBarbers } = await admin.from('barbers').select('id').eq('user_id', uid);
        const barberIds = (userBarbers ?? []).map((b) => b.id);

        console.log(`📊 Datos encontrados: ${shopIds.length} barberías, ${barberIds.length} perfiles de barbero`);

        // --- LIMPIEZA DE DATOS ---

        // A. Si tiene barberías, borrar todo lo relacionado con ellas
        if (shopIds.length > 0) {
            console.log("🏢 Limpiando datos de barberías...");

            // Borrar registros que dependen de la barbería
            await admin.from('product_sales').delete().in('barbershop_id', shopIds);
            await admin.from('products').delete().in('barbershop_id', shopIds);
            await admin.from('expenses').delete().in('barbershop_id', shopIds);
            await admin.from('join_requests').delete().in('barbershop_id', shopIds);
            await admin.from('messages').delete().in('barbershop_id', shopIds);
            await admin.from('transactions').delete().in('barbershop_id', shopIds);

            // Los cupones se desvinculan
            await admin.from('coupons').update({ used_by_barbershop_id: null, is_used: false }).in('used_by_barbershop_id', shopIds);

            // Borrar reseñas y citas de estas barberías
            await admin.from('reviews').delete().in('barbershop_id', shopIds);
            await admin.from('appointments').delete().in('barbershop_id', shopIds);

            // Desvincular sillas y barberos
            await admin.from('chairs').update({ barber_id: null }).in('barbershop_id', shopIds);
            await admin.from('barbers').update({ chair_id: null, barbershop_id: null, barbershop_name: null, is_approved: false }).in('barbershop_id', shopIds);

            // Finalmente borrar sillas y barberías
            await admin.from('chairs').delete().in('barbershop_id', shopIds);

            // Romper referencia circular de featured_review_id
            await admin.from('barbershops').update({ featured_review_id: null }).in('id', shopIds);
            await admin.from('barbershops').delete().in('id', shopIds);
        }

        // B. Limpiar datos individuales del usuario
        console.log("🧹 Limpiando datos individuales...");

        await admin.from('reviews').delete().eq('user_id', uid);
        await admin.from('reviews').delete().eq('client_id', uid);
        if (barberIds.length > 0) {
            await admin.from('reviews').delete().in('barber_id', barberIds);
        }

        await admin.from('appointments').delete().eq('client_id', uid);
        if (barberIds.length > 0) {
            await admin.from('appointments').delete().in('barber_id', barberIds);
        }

        await admin.from('messages').delete().eq('sender_id', uid);
        await admin.from('messages').delete().eq('receiver_id', uid);
        await admin.from('join_requests').delete().eq('barber_id', uid);

        // C. Borrar perfil de barbero y registro de usuario
        if (barberIds.length > 0) {
            console.log("✂️ Liberando sillas y borrando perfiles de barbero...");
            // Liberar sillas antes de borrar para evitar error de FK
            await admin.from('chairs').update({ barber_id: null }).in('barber_id', barberIds);
            await admin.from('barbers').delete().in('id', barberIds);
        }

        console.log("👤 Borrando registro de la tabla public.users...");
        const { error: deleteUserError } = await admin.from('users').delete().eq('id', uid);
        if (deleteUserError) {
            console.error("❌ Error borrando de public.users:", deleteUserError);
            throw new Error(`No se pudo limpiar el registro de usuario: ${deleteUserError.message}`);
        }

        // D. Borrar usuario de Supabase Auth
        console.log("🔐 Borrando usuario de Supabase Auth...");
        const { error: authError } = await admin.auth.admin.deleteUser(uid);
        if (authError) {
            console.error("⚠️ Error borrando de Auth:", authError);
            // No lanzamos error si la DB está limpia, pero informamos
        }

        console.log("✅ ELIMINACIÓN COMPLETADA CON ÉXITO");

        return new Response(JSON.stringify({ message: 'Cuenta eliminada correctamente' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (err: any) {
        console.error("🔥 ERROR CRÍTICO EN DELETE-ACCOUNT:", err.message);
        return new Response(JSON.stringify({
            error: 'Error interno al eliminar la cuenta',
            details: err.message
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
})
