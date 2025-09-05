import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running inventory alert check...');

    // Check for low stock items (less than 5 units)
    const { data: lowStockItems, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity')
      .lt('stock_quantity', 5)
      .eq('in_stock', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    if (lowStockItems && lowStockItems.length > 0) {
      console.log(`Found ${lowStockItems.length} low stock items:`, lowStockItems);

      // In a real application, you would:
      // 1. Send email alerts to inventory managers
      // 2. Create notifications in the admin dashboard
      // 3. Possibly auto-reorder items from suppliers
      // 4. Update product visibility on the website

      // For now, we'll just log the alert
      const alertData = {
        timestamp: new Date().toISOString(),
        low_stock_count: lowStockItems.length,
        items: lowStockItems,
        alert_type: 'low_inventory'
      };

      // You could store this alert in a dedicated alerts table
      // or send it to your monitoring system

      return new Response(JSON.stringify({
        success: true,
        alert_sent: true,
        low_stock_items: lowStockItems,
        message: `Inventory alert: ${lowStockItems.length} items are running low on stock`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log('All items are adequately stocked');
      
      return new Response(JSON.stringify({
        success: true,
        alert_sent: false,
        message: 'All inventory levels are adequate'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in inventory-alert function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// This function can be called:
// 1. Via HTTP endpoint (as shown above)
// 2. Via a cron job using pg_cron
// 3. As a webhook from inventory management systems
// 4. Triggered by database changes using triggers