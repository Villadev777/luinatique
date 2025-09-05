import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  order_id: string;
  customer_email: string;
  customer_name: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!resendApiKey) {
      throw new Error('Resend API key not configured');
    }

    const resend = new Resend(resendApiKey);
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { order_id, customer_email, customer_name }: OrderConfirmationRequest = await req.json();

    console.log('Sending order confirmation for:', { order_id, customer_email });

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          price,
          selected_size,
          products (name, description)
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw new Error(`Failed to fetch order: ${orderError.message}`);
    }

    // Generate order items HTML
    const orderItemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">
          <strong>${item.products.name}</strong>
          ${item.selected_size ? `<br><small>Size: ${item.selected_size}</small>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
          $${item.price.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Lunatiquê <orders@lunatique.com>",
      to: [customer_email],
      subject: `Order Confirmation #${order_id.substring(0, 8)}`,
      html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 32px; color: #8B7355; margin: 0;">Lunatiquê</h1>
            <p style="color: #666; margin: 5px 0;">Luxury Jewelry</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #8B7355; padding-bottom: 10px;">
            Thank you for your order, ${customer_name}!
          </h2>
          
          <p style="color: #666; line-height: 1.6;">
            We've received your order and it's being prepared with the utmost care. 
            You'll receive another email once your items have shipped.
          </p>
          
          <div style="background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> #${order_id.substring(0, 8)}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #8B7355; color: white;">
                <th style="padding: 12px; text-align: left;">Item</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #8B7355;">
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">
                  $${order.total_amount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
          
          <div style="background: #f0f8f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #8B7355;">
            <h4 style="margin: 0 0 10px 0; color: #333;">Shipping Information</h4>
            <p style="margin: 0; color: #666;">
              Your order will be carefully packaged and shipped to:<br>
              ${order.shipping_address ? JSON.stringify(order.shipping_address) : 'Address on file'}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666;">
              Questions about your order?<br>
              Contact us at <a href="mailto:support@lunatique.com" style="color: #8B7355;">support@lunatique.com</a>
            </p>
            <p style="color: #999; font-size: 14px; margin-top: 20px;">
              Thank you for choosing Lunatiquê<br>
              With love, The Lunatiquê Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);