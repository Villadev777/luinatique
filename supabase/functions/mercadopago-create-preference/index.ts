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

    // Obtener los datos del request
    const preferenceData = await req.json()

    console.log('Received preference data:', JSON.stringify(preferenceData, null, 2))

    // Crear la preferencia
    const preference = await MercadoPago.preferences.create(preferenceData)
    
    console.log('Preference created:', preference.body)

    return new Response(
      JSON.stringify(preference.body),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating preference:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error creating preference',
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