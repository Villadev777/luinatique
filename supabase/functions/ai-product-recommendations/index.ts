import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_preferences, budget_range, occasion } = await req.json();

    console.log('Generating AI product recommendations for:', { user_preferences, budget_range, occasion });

    // Fetch products from database
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // Generate AI recommendations using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a luxury jewelry expert at Lunatiquê. Analyze the available products and user preferences to recommend the most suitable jewelry pieces. Consider style, materials, price range, and occasion. Return recommendations in JSON format with product IDs and reasoning.`
          },
          {
            role: 'user',
            content: `User preferences: ${user_preferences}
Budget range: ${budget_range}
Occasion: ${occasion}

Available products: ${JSON.stringify(products)}

Please recommend 3-5 products that best match these preferences, with detailed reasoning for each recommendation.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const recommendations = aiResponse.choices[0].message.content;

    console.log('AI recommendations generated successfully');

    return new Response(JSON.stringify({ 
      recommendations,
      products: products,
      status: 'success' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-product-recommendations function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});