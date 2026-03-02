
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { type } = await req.json()

        // DESACTIVADO POR SOLICITUD DEL USUARIO PARA AHORRAR CRÉDITOS DE RESEND
        // Solo se mantiene el de confirmación de cuenta (que es manejado por Supabase Auth)
        console.log(`[INFO] Evento de cita recibido (${type}), pero el envío de correos está DESACTIVADO para ahorrar cuota de Resend.`);

        return new Response(JSON.stringify({
            message: 'Envío de correos de citas desactivado por configuración de ahorro de costos.',
            event_type: type
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
