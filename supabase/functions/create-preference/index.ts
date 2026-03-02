
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

    try {
        const { plan, userId, barbershopId } = await req.json()

        // Token de Mercado Pago - se configura desde Supabase Dashboard
        // Panel: Project Settings > Edge Functions > Secrets > MP_ACCESS_TOKEN
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!
        if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN no configurado en Supabase Secrets.')

        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Obtener el email del usuario
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        const payerEmail = userData?.user?.email || 'test@test.com'

        let title = ''
        let amount = 0

        if (plan === 'PRO') {
            title = 'Plan PRO - BarberOs LM (1 Mes)'
            amount = 199
        } else if (plan === 'PREMIUM') {
            title = 'Plan PREMIUM - BarberOs LM (1 Mes)'
            amount = 349
        }

        if (amount === 0) throw new Error('Plan no válido.')

        // CREAR PREFERENCIA (PAGO ÚNICO)
        const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                items: [
                    {
                        title: title,
                        quantity: 1,
                        unit_price: amount,
                        currency_id: "MXN"
                    }
                ],
                payer: {
                    email: payerEmail
                },
                back_urls: {
                    success: "https://barberoslm.com/owner",
                    failure: "https://barberoslm.com/owner",
                    pending: "https://barberoslm.com/owner"
                },
                auto_return: "approved",
                notification_url: "https://labhuzloaybvlnwkxhqn.supabase.co/functions/v1/webhook",
                external_reference: barbershopId, // Usamos esto para identificar el negocio en el webhook
                metadata: {
                    barbershop_id: barbershopId,
                    plan_id: plan.toLowerCase(),
                    user_id: userId
                }
            })
        })

        const mpData = await mpResponse.json()

        // En modo PRUEBA (TEST-) usar sandbox_init_point
        // En modo PRODUCCION (APP_USR-) usar init_point
        // Mercado Pago devuelve ambas URLs, elegimos la correcta según el token
        const isSandbox = MP_ACCESS_TOKEN.startsWith('TEST-')
        const checkoutUrl = isSandbox
            ? (mpData.sandbox_init_point || mpData.init_point)
            : mpData.init_point

        if (checkoutUrl) {
            return new Response(JSON.stringify({ init_point: checkoutUrl }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        } else {
            return new Response(JSON.stringify({ error: 'Error en Mercado Pago', details: mpData }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
