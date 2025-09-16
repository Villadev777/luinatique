// Test function to debug PayPal Edge Function issues
// Add this to your PaymentMethodSelector or console to test

export const testPayPalConnection = async () => {
  console.log('🔍 Testing PayPal Connection...');
  
  // 1. Check environment variables
  console.log('Environment Variables:');
  console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
  console.log('- VITE_PAYPAL_CLIENT_ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID);
  console.log('- VITE_PAYPAL_MODE:', import.meta.env.VITE_PAYPAL_MODE);
  
  // 2. Test Edge Function availability
  const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
  console.log('Functions URL:', functionsUrl);
  
  try {
    console.log('🧪 Testing CORS with OPTIONS request...');
    const corsResponse = await fetch(`${functionsUrl}/paypal-create-order`, {
      method: 'OPTIONS',
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,authorization'
      }
    });
    
    console.log('CORS Response:', {
      status: corsResponse.status,
      statusText: corsResponse.statusText,
      headers: Object.fromEntries(corsResponse.headers.entries())
    });
    
    if (corsResponse.ok) {
      console.log('✅ CORS test passed');
    } else {
      console.log('❌ CORS test failed');
      return;
    }
    
  } catch (error) {
    console.error('❌ CORS test error:', error);
    console.log('🔧 Possible solutions:');
    console.log('1. Edge Function not deployed');
    console.log('2. Wrong Supabase URL');
    console.log('3. Network/firewall blocking request');
    return;
  }
  
  // 3. Test actual function call
  try {
    console.log('🧪 Testing PayPal order creation...');
    
    const testOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '10.00'
        }
      }]
    };
    
    const response = await fetch(`${functionsUrl}/paypal-create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testOrder),
    });
    
    console.log('PayPal Function Response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    
    const responseText = await response.text();
    console.log('Response body:', responseText);
    
    if (response.ok) {
      console.log('✅ PayPal function test passed');
      const data = JSON.parse(responseText);
      console.log('Order ID:', data.id);
    } else {
      console.log('❌ PayPal function test failed');
      console.log('🔧 Check Supabase Edge Functions dashboard for errors');
    }
    
  } catch (error) {
    console.error('❌ PayPal function test error:', error);
  }
};

// Auto-run test in development
if (import.meta.env.DEV) {
  // Uncomment to auto-run test
  // setTimeout(testPayPalConnection, 2000);
}

// Make it available globally for manual testing
(window as any).testPayPalConnection = testPayPalConnection;