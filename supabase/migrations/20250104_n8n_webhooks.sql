-- Enable the http extension if not already enabled
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Function to call n8n webhook
CREATE OR REPLACE FUNCTION notify_n8n_webhook()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
  payload jsonb;
  response int;
BEGIN
  -- Get the Supabase function URL from env or use default
  webhook_url := current_setting('app.settings.supabase_url', true) || '/functions/v1/n8n-webhook';
  
  -- Build the payload
  payload := jsonb_build_object(
    'event', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW),
    'old_record', CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END
  );

  -- Call the edge function asynchronously
  PERFORM extensions.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := payload::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for INSERT on orders (new order created)
DROP TRIGGER IF EXISTS orders_insert_webhook ON orders;
CREATE TRIGGER orders_insert_webhook
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_n8n_webhook();

-- Create trigger for UPDATE on orders (status/payment changes)
DROP TRIGGER IF EXISTS orders_update_webhook ON orders;
CREATE TRIGGER orders_update_webhook
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status OR
    OLD.payment_status IS DISTINCT FROM NEW.payment_status
  )
  EXECUTE FUNCTION notify_n8n_webhook();

-- Add comment
COMMENT ON FUNCTION notify_n8n_webhook() IS 'Sends webhook notifications to n8n for order automation';
COMMENT ON TRIGGER orders_insert_webhook ON orders IS 'Triggers n8n webhook when a new order is created';
COMMENT ON TRIGGER orders_update_webhook ON orders IS 'Triggers n8n webhook when order status or payment status changes';