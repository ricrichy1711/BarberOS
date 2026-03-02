
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// El webhook de Mercado Pago SIEMPRE debe responder 200 OK
// de lo contrario MP reintentará el envío múltiples veces.
// La lógica de negocio solo ocurre si el pago está APROBADO.

serve(async (req) => {
    try {
        const url = new URL(req.url)
        const topic = url.searchParams.get('topic') || url.searchParams.get('type')
        const id = url.searchParams.get('id') || url.searchParams.get('data.id')

        // Token de Mercado Pago - se configura desde Supabase Dashboard
        // Panel: Project Settings > Edge Functions > Secrets > MP_ACCESS_TOKEN
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!
        if (!MP_ACCESS_TOKEN) throw new Error('MP_ACCESS_TOKEN no configurado en Supabase Secrets.')
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // Solo procesar notificaciones de tipo 'payment'
        if ((topic === 'payment' || topic === 'merchant_order') && id) {

            // 1. Consultar los detalles del pago directamente a la API de Mercado Pago
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
                headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
            })
            const payment = await response.json()

            // 2. VERIFICACIÓN CRÍTICA: Solo activar si el pago está APROBADO
            if (payment.status === 'approved') {

                // 3. Obtener el ID de la barbería desde external_reference (enviado por create-preference)
                const barbershop_id = payment.external_reference

                // 4. VERIFICACIÓN DE SEGURIDAD: el external_reference debe existir
                if (!barbershop_id) {
                    console.error(`[WEBHOOK ERROR] Pago aprobado ID:${payment.id} sin external_reference. No se puede activar.`)
                    // Responder 200 para que MP no reintente, pero registrar el problema
                    return new Response(JSON.stringify({
                        received: true,
                        warning: 'external_reference missing - payment cannot be auto-activated'
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
                }

                // 5. Determinar el plan desde metadata (SEGURO) con fallback a external_reference/description
                let plan_id = 'pro' // default seguro
                if (payment.metadata?.plan_id) {
                    // Primera opción: metadata enviada al crear la preferencia (más confiable)
                    plan_id = payment.metadata.plan_id.toLowerCase()
                } else if (payment.description) {
                    // Fallback: revisar descripción del producto
                    plan_id = payment.description.toLowerCase().includes('premium') ? 'premium' : 'pro'
                }

                // Solo permitir valores de plan conocidos para evitar manipulaciones
                if (plan_id !== 'pro' && plan_id !== 'premium') {
                    plan_id = 'pro'
                }

                // 6. Verificar que la barbería existe antes de activar
                const { data: barbershop, error: bsError } = await supabase
                    .from('barbershops')
                    .select('id, name, plan')
                    .eq('id', barbershop_id)
                    .single()

                if (bsError || !barbershop) {
                    console.error(`[WEBHOOK ERROR] Barbería no encontrada: ${barbershop_id}`)
                    return new Response(JSON.stringify({
                        received: true,
                        error: 'barbershop not found'
                    }), { status: 200, headers: { 'Content-Type': 'application/json' } })
                }

                // 7. Verificar que este pago no haya sido procesado ya (idempotencia)
                const { data: existingTx } = await supabase
                    .from('transactions')
                    .select('id')
                    .eq('mercado_pago_id', payment.id.toString())
                    .single()

                if (existingTx) {
                    console.log(`[WEBHOOK] Pago ${payment.id} ya procesado. Ignorando duplicado.`)
                    return new Response(JSON.stringify({ received: true, status: 'already_processed' }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    })
                }

                // 8. Calcular vencimiento: 30 días desde HOY
                const expiresAt = new Date()
                expiresAt.setDate(expiresAt.getDate() + 30)

                // 9. Activar el plan en la barbería
                const { error: updateError } = await supabase
                    .from('barbershops')
                    .update({
                        plan: plan_id,
                        plan_expires_at: expiresAt.toISOString()
                    })
                    .eq('id', barbershop_id)

                if (updateError) {
                    console.error(`[WEBHOOK ERROR] No se pudo actualizar plan: ${updateError.message}`)
                    // No retornar error a MP para que no reintente, pero loguear
                }

                // 10. Registrar transacción (audit trail)
                await supabase.from('transactions').insert({
                    barbershop_id: barbershop_id,
                    mercado_pago_id: payment.id.toString(),
                    amount: payment.transaction_amount,
                    status: payment.status,
                    plan_id: plan_id
                })

                console.log(`[WEBHOOK OK] Plan ${plan_id.toUpperCase()} activado para barbería ${barbershop.name} (${barbershop_id}) hasta ${expiresAt.toISOString()}`)
            }
        }

        // Siempre responder 200 OK a Mercado Pago
        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error(`[WEBHOOK EXCEPTION] ${error.message}`)
        // Responder 200 igualmente para evitar reintentos de MP en errores inesperados
        return new Response(JSON.stringify({ received: true, error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    }
})
