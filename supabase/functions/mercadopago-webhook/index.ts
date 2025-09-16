import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// Importación correcta del SDK de MercadoPago
import MercadoPago from "npm:mercadopago@2.0.15"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Configurar MercadoPago con el access token
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not configured')
    }

    MercadoPago.configurations.setAccessToken(accessToken)

    // Obtener los datos del webhook
    const webhookData = await req.json()
    
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2))

    // Procesar según el tipo de notificación
    if (webhookData.type === 'payment') {
      const paymentId = webhookData.data.id
      
      if (paymentId) {
        // Obtener los detalles del pago
        const payment = await MercadoPago.payment.findById(paymentId)
        
        console.log('Payment details from webhook:', payment.body)
        
        // Aquí puedes procesar el pago
        // Por ejemplo, actualizar tu base de datos, enviar emails, etc.
        
        return new Response(
          JSON.stringify({ 
            received: true, 
            payment_id: paymentId,
            status: payment.body.status
          }),
          {
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            },
            status: 200,
          },
        )
      }
    }

    // Para otros tipos de notificaciones
    return new Response(
      JSON.stringify({ received: true, type: webhookData.type }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error('Error processing webhook:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error processing webhook',
        details: error.stack || 'No additional details'
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500,
      },
    )
  }
})