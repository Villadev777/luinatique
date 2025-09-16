-- Enhance orders table for PayPal and MercadoPago support
-- This migration adds fields and improves the structure for both payment methods

-- Add PayPal specific fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mercadopago',
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'PEN',
ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(10,4);

-- Create indexes for PayPal fields
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);

-- Add check constraint for payment_method
ALTER TABLE orders 
ADD CONSTRAINT check_payment_method 
CHECK (payment_method IN ('mercadopago', 'paypal'));

-- Add check constraint for currency
ALTER TABLE orders 
ADD CONSTRAINT check_currency 
CHECK (currency IN ('PEN', 'USD'));

-- Update RLS policies to include the new fields
-- Policy for service role to update PayPal orders
CREATE POLICY "Service role can update paypal orders" ON orders
    FOR UPDATE USING (
        current_setting('role') = 'service_role' OR 
        auth.uid() = user_id
    );

-- Create function to handle PayPal order creation
CREATE OR REPLACE FUNCTION create_paypal_order(
    p_user_id UUID,
    p_items JSONB,
    p_total_amount DECIMAL,
    p_customer_email TEXT,
    p_customer_name TEXT,
    p_customer_phone TEXT DEFAULT NULL,
    p_shipping_address JSONB DEFAULT NULL,
    p_exchange_rate DECIMAL DEFAULT 0.27
)
RETURNS UUID AS $$
DECLARE
    order_id UUID;
    external_ref TEXT;
BEGIN
    -- Generate unique external reference for PayPal
    external_ref := 'PAYPAL_' || extract(epoch from now())::bigint || '_' || substr(md5(random()::text), 1, 8);
    
    INSERT INTO orders (
        user_id,
        payment_method,
        external_reference,
        total_amount,
        currency,
        exchange_rate,
        customer_email,
        customer_name,
        customer_phone,
        shipping_address,
        items,
        status
    ) VALUES (
        p_user_id,
        'paypal',
        external_ref,
        p_total_amount,
        'USD',
        p_exchange_rate,
        p_customer_email,
        p_customer_name,
        p_customer_phone,
        p_shipping_address,
        p_items,
        'pending'
    ) RETURNING id INTO order_id;
    
    RETURN order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update PayPal order status
CREATE OR REPLACE FUNCTION update_paypal_order_status(
    p_external_reference TEXT,
    p_paypal_order_id TEXT,
    p_paypal_payer_id TEXT DEFAULT NULL,
    p_payment_status TEXT DEFAULT 'completed',
    p_status TEXT DEFAULT 'completed'
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE orders 
    SET 
        paypal_order_id = p_paypal_order_id,
        paypal_payer_id = p_paypal_payer_id,
        payment_status = p_payment_status,
        status = p_status,
        updated_at = NOW()
    WHERE external_reference = p_external_reference
    AND payment_method = 'paypal';
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get order by external reference
CREATE OR REPLACE FUNCTION get_order_by_reference(
    p_external_reference TEXT
)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    status TEXT,
    payment_method TEXT,
    total_amount DECIMAL,
    currency TEXT,
    customer_email TEXT,
    items JSONB,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.id,
        o.user_id,
        o.status,
        o.payment_method,
        o.total_amount,
        o.currency,
        o.customer_email,
        o.items,
        o.created_at
    FROM orders o
    WHERE o.external_reference = p_external_reference;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on the functions
GRANT EXECUTE ON FUNCTION create_paypal_order TO authenticated;
GRANT EXECUTE ON FUNCTION update_paypal_order_status TO service_role;
GRANT EXECUTE ON FUNCTION get_order_by_reference TO authenticated, service_role;

-- Create a view for order analytics
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
    payment_method,
    currency,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as average_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_orders,
    DATE_TRUNC('day', created_at) as order_date
FROM orders
GROUP BY payment_method, currency, DATE_TRUNC('day', created_at)
ORDER BY order_date DESC;

-- Grant access to the view
GRANT SELECT ON order_analytics TO authenticated;