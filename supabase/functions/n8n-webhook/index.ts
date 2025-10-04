import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const n8nWebhookSecret = Deno.env.get('N8N_WEBHOOK_SECRET') // Optional: para validar requests

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { event, table, record, old_record } = await req.json()

    console.log('📨 Webhook received:', { event, table })

    // Validar secret si está configurado
    const authHeader = req.headers.get('authorization')
    if (n8nWebhookSecret && authHeader !== `Bearer ${n8nWebhookSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Construir payload para n8n
    let webhookPayload: any = {
      event,
      table,
      timestamp: new Date().toISOString(),
      data: record,
    }

    // Agregar información adicional según el evento
    if (table === 'orders') {
      // Obtener items de la orden
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', record.id)

      if (!itemsError && orderItems) {
        webhookPayload.order_items = orderItems
      }

      // Determinar el tipo de webhook según el evento
      if (event === 'INSERT') {
        webhookPayload.webhook_type = 'order.created'
      } else if (event === 'UPDATE') {
        // Detectar cambios específicos
        if (old_record?.status !== record.status) {
          webhookPayload.webhook_type = 'order.status_changed'
          webhookPayload.status_change = {
            from: old_record.status,
            to: record.status
          }
        }
        if (old_record?.payment_status !== record.payment_status) {
          webhookPayload.webhook_type = 'order.payment_updated'
          webhookPayload.payment_change = {
            from: old_record.payment_status,
            to: record.payment_status
          }
        }
      }
    }

    // URLs de n8n (configurar en variables de entorno)
    const n8nWebhookUrls = {
      'order.created': Deno.env.get('N8N_WEBHOOK_ORDER_CREATED'),
      'order.status_changed': Deno.env.get('N8N_WEBHOOK_ORDER_STATUS_CHANGED'),
      'order.payment_updated': Deno.env.get('N8N_WEBHOOK_ORDER_PAYMENT_UPDATED'),
    }

    const webhookUrl = n8nWebhookUrls[webhookPayload.webhook_type as keyof typeof n8nWebhookUrls]

    // Enviar a n8n si hay URL configurada
    if (webhookUrl) {
      console.log(`🔔 Sending webhook to n8n: ${webhookPayload.webhook_type}`)
      
      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      })

      if (!n8nResponse.ok) {
        console.error('❌ Error sending to n8n:', await n8nResponse.text())
      } else {
        console.log('✅ Webhook sent successfully to n8n')
      }
    } else {
      console.log('⚠️ No n8n webhook URL configured for:', webhookPayload.webhook_type)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        webhook_type: webhookPayload.webhook_type,
        sent_to_n8n: !!webhookUrl
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})