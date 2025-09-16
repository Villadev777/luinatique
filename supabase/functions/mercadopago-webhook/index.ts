import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { MercadoPago, Payment } from "npm:mercadopago";

interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string;
          user_id: string;
          status: string;
          payment_id: string | null;
          external_reference: string | null;
          total_amount: number;
          payment_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          status: string;
          payment_id?: string | null;
          external_reference?: string | null;
          total_amount: number;
          payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: string;
          payment_id?: string | null;
          external_reference?: string | null;
          total_amount?: number;
          payment_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: 'MercadoPago access token not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse webhook notification
    const notification = await req.json();
    console.log('Received webhook notification:', notification);

    // Validate notification structure
    if (!notification.data || !notification.data.id) {
      console.log('Invalid notification structure');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    const paymentId = notification.data.id;
    console.log('Processing payment ID:', paymentId);

    // Initialize MercadoPago and Supabase clients
    const mpClient = new MercadoPago({
      accessToken: accessToken,
      options: { timeout: 5000 }
    });
    
    const supabase = createClient<Database>(supabaseUrl, supabaseKey);

    // Get payment details from MercadoPago
    const payment = new Payment(mpClient);
    const paymentDetails = await payment.get({ id: paymentId });
    
    console.log('Payment details:', paymentDetails);

    if (!paymentDetails.external_reference) {
      console.log('No external reference found in payment');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Update order status in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_id: paymentId,
        payment_status: paymentDetails.status,
        status: mapPaymentStatusToOrderStatus(paymentDetails.status),
        updated_at: new Date().toISOString()
      })
      .eq('external_reference', paymentDetails.external_reference);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw updateError;
    }

    console.log('Order updated successfully');

    // Send confirmation email if payment is approved
    if (paymentDetails.status === 'approved') {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-order-confirmation`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            external_reference: paymentDetails.external_reference,
            payment_id: paymentId
          })
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Don't fail the webhook for email errors
      }
    }

    return new Response('OK', { status: 200, headers: corsHeaders });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process webhook',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to map payment status to order status
function mapPaymentStatusToOrderStatus(paymentStatus: string): string {
  switch (paymentStatus) {
    case 'approved':
      return 'confirmed';
    case 'pending':
    case 'in_process':
      return 'pending';
    case 'rejected':
    case 'cancelled':
      return 'cancelled';
    case 'refunded':
    case 'charged_back':
      return 'refunded';
    default:
      return 'pending';
  }
}