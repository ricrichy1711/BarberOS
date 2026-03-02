
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
        const { code, barbershopId } = await req.json()
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Validate Coupon
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .single()

        if (couponError || !coupon) {
            return new Response(JSON.stringify({ error: 'Código de cupón inválido.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404,
            })
        }

        if (coupon.is_used) {
            return new Response(JSON.stringify({ error: 'Este cupón ya ha sido utilizado.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }

        // 2. Calculate New Expiry Date
        const months = coupon.months
        const now = new Date()
        const expiryDate = new Date()
        expiryDate.setMonth(now.getMonth() + months)

        // 3. Update Barbershop
        const { error: updateError } = await supabase
            .from('barbershops')
            .update({
                plan: coupon.plan_id.toLowerCase(),
                plan_expires_at: expiryDate.toISOString()
            })
            .eq('id', barbershopId)

        if (updateError) throw updateError

        // 4. Mark Coupon as used
        const { error: markError } = await supabase
            .from('coupons')
            .update({
                is_used: true,
                used_by_barbershop_id: barbershopId,
                used_at: now.toISOString()
            })
            .eq('id', coupon.id)

        if (markError) throw markError

        // 5. Log as a transaction for the admin panel
        await supabase.from('transactions').insert({
            barbershop_id: barbershopId,
            amount: 0,
            status: 'coupon_applied',
            plan_id: coupon.plan_id,
            mercado_pago_id: `COUPON_${coupon.code}`
        })

        return new Response(JSON.stringify({
            success: true,
            plan: coupon.plan_id,
            expiry: expiryDate.toDateString()
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
