-- Create shipping_settings table
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  free_shipping_threshold DECIMAL(10,2) NOT NULL DEFAULT 50.00,
  standard_shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 9.99,
  currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default values
INSERT INTO public.shipping_settings (free_shipping_threshold, standard_shipping_cost, currency, is_active)
VALUES (50.00, 9.99, 'PEN', true)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read shipping settings
CREATE POLICY "Anyone can read shipping settings"
  ON public.shipping_settings
  FOR SELECT
  USING (true);

-- Policy: Only admins can update shipping settings
CREATE POLICY "Admins can update shipping settings"
  ON public.shipping_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_shipping_settings_timestamp
  BEFORE UPDATE ON public.shipping_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_settings_updated_at();

-- Add comment
COMMENT ON TABLE public.shipping_settings IS 'Configuración de costos de envío y umbrales para envío gratis';