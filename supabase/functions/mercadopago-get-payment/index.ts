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

    // Obtener el payment ID desde la URL
    const url = new URL(req.url)
    const paymentId = url.pathname.split('/').pop()

    if (!paymentId) {
      throw new Error('Payment ID is required')
    }

    console.log('Getting payment details for ID:', paymentId)

    // Obtener los detalles del pago
    const payment = await MercadoPago.payment.findById(paymentId)
    
    console.log('Payment details:', payment.body)

    return new Response(
      JSON.stringify(payment.body),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error getting payment:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error getting payment',
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