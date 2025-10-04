-- Crear tabla de órdenes
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Dirección de envío
  shipping_street TEXT,
  shipping_number TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip_code TEXT,
  shipping_country TEXT DEFAULT 'PE',
  
  -- Montos
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PEN',
  
  -- Estado del pedido
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  
  -- Método de pago
  payment_method TEXT NOT NULL, -- 'mercadopago' o 'paypal'
  payment_id TEXT, -- ID del pago en MercadoPago o PayPal
  payment_reference TEXT, -- External reference
  
  -- Metadatos
  notes TEXT,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Crear tabla de items de órdenes
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  
  -- Datos del producto al momento de la compra
  product_name TEXT NOT NULL,
  product_image TEXT,
  product_sku TEXT,
  
  -- Variaciones
  selected_size TEXT,
  selected_material TEXT,
  selected_color TEXT,
  
  -- Precio y cantidad
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON public.orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Función para descontar inventario cuando se crea una orden
CREATE OR REPLACE FUNCTION public.decrease_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Descontar el stock del producto
  UPDATE public.products
  SET stock = stock - NEW.quantity
  WHERE id = NEW.product_id;
  
  -- Verificar que el stock no sea negativo
  IF (SELECT stock FROM public.products WHERE id = NEW.product_id) < 0 THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto %', NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para descontar stock cuando se inserta un order_item
CREATE TRIGGER decrease_stock_on_order_item
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_product_stock();

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orders
CREATE POLICY "Cualquiera puede crear órdenes" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden ver todas las órdenes" ON public.orders
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuarios pueden ver sus propias órdenes" ON public.orders
  FOR SELECT
  USING (customer_email = auth.jwt() ->> 'email');

CREATE POLICY "Solo administradores pueden actualizar órdenes" ON public.orders
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Políticas RLS para order_items
CREATE POLICY "Cualquiera puede crear items de órdenes" ON public.order_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Solo administradores pueden ver todos los items" ON public.order_items
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Usuarios pueden ver items de sus órdenes" ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_email = auth.jwt() ->> 'email'
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.orders IS 'Tabla de órdenes/pedidos de clientes';
COMMENT ON TABLE public.order_items IS 'Items individuales de cada orden';
COMMENT ON COLUMN public.orders.status IS 'Estado del pedido: pending, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN public.orders.payment_status IS 'Estado del pago: pending, approved, rejected, refunded';