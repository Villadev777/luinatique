/*
# Reestructuración de categorías para joyería y manualidades

1. Nuevas Tablas
   - `main_categories` - Categorías principales (TIENDA, SALE, LUNATIQUE, etc.)
   - `category_sections` - Pestañas/secciones (ANILLOS, ARETES, COLLARES, etc.)
   - `subcategories` - Subcategorías (MIYUKI, ALAMBRISMO, BORDADOS, etc.)
   - Actualización de `categories` para usar la nueva estructura jerárquica

2. Estructura Jerárquica
   - main_category -> category_section -> subcategory -> products

3. Datos de Ejemplo
   - Inserción de todas las categorías según el esquema proporcionado
*/

-- Crear tabla de categorías principales
CREATE TABLE IF NOT EXISTS main_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de secciones/pestañas
CREATE TABLE IF NOT EXISTS category_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category_id uuid REFERENCES main_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(main_category_id, slug)
);

-- Crear tabla de subcategorías
CREATE TABLE IF NOT EXISTS subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_section_id uuid REFERENCES category_sections(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(category_section_id, slug)
);

-- Actualizar tabla de productos para usar subcategorías
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'subcategory_id'
  ) THEN
    ALTER TABLE products ADD COLUMN subcategory_id uuid REFERENCES subcategories(id);
  END IF;
END $$;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE main_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para main_categories
CREATE POLICY "Main categories are viewable by everyone"
  ON main_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage main categories"
  ON main_categories
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para category_sections
CREATE POLICY "Category sections are viewable by everyone"
  ON category_sections
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage category sections"
  ON category_sections
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Políticas RLS para subcategories
CREATE POLICY "Subcategories are viewable by everyone"
  ON subcategories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage subcategories"
  ON subcategories
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insertar categorías principales
INSERT INTO main_categories (name, slug, description, display_order) VALUES
('INICIO', 'inicio', 'Página principal con presentación y categorías destacadas', 1),
('TIENDA', 'tienda', 'Catálogo completo de productos de joyería y manualidades', 2),
('SALE', 'sale', 'Promociones y gangas especiales', 3),
('LUNATIQUE', 'lunatique', 'Información sobre técnicas y la historia de Lunatique', 4),
('CONTACTANOS', 'contactanos', 'Información de contacto y ubicación', 5);

-- Insertar secciones para TIENDA
INSERT INTO category_sections (main_category_id, name, slug, description, display_order)
SELECT 
  mc.id,
  section_data.name,
  section_data.slug,
  section_data.description,
  section_data.display_order
FROM main_categories mc,
(VALUES
  ('ANILLOS', 'anillos', 'Anillos artesanales en diversas técnicas', 1),
  ('ARETES', 'aretes', 'Aretes únicos y elegantes', 2),
  ('COLLARES', 'collares', 'Collares artesanales con diseños exclusivos', 3),
  ('PULSERAS', 'pulseras', 'Pulseras para toda la familia', 4),
  ('LLAVEROS', 'llaveros', 'Llaveros decorativos y funcionales', 5),
  ('PRENDEDORES', 'prendedores', 'Prendedores artesanales únicos', 6)
) AS section_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda';

-- Insertar secciones para SALE
INSERT INTO category_sections (main_category_id, name, slug, description, display_order)
SELECT 
  mc.id,
  'PROMOCIONES',
  'promociones',
  'Productos en oferta y promociones especiales',
  1
FROM main_categories mc
WHERE mc.slug = 'sale';

-- Insertar secciones para LUNATIQUE
INSERT INTO category_sections (main_category_id, name, slug, description, display_order)
SELECT 
  mc.id,
  section_data.name,
  section_data.slug,
  section_data.description,
  section_data.display_order
FROM main_categories mc,
(VALUES
  ('NOSOTROS', 'nosotros', 'Historia del nacimiento de Lunatique', 1),
  ('MIYUKI', 'miyuki-info', '¿Qué es la técnica Miyuki?', 2),
  ('ALAMBRISMO', 'alambrismo-info', '¿Qué es el Alambrismo?', 3),
  ('BORDADO DE ACCESORIOS', 'bordado-accesorios', '¿Qué son los accesorios bordados?', 4),
  ('SOUTACHE', 'soutache-info', '¿Qué es la técnica Soutache?', 5)
) AS section_data(name, slug, description, display_order)
WHERE mc.slug = 'lunatique';

-- Insertar subcategorías para ANILLOS
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('MIYUKI', 'miyuki', 'Anillos elaborados con técnica Miyuki', 1),
  ('ALAMBRISMO', 'alambrismo', 'Anillos de alambrismo artesanal', 2)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'anillos';

-- Insertar subcategorías para ARETES
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('MIYUKI', 'miyuki', 'Aretes con técnica Miyuki', 1),
  ('ALAMBRISMO', 'alambrismo', 'Aretes de alambrismo', 2),
  ('BORDADOS', 'bordados', 'Aretes bordados a mano', 3),
  ('SOUTACHE', 'soutache', 'Aretes con técnica Soutache', 4)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'aretes';

-- Insertar subcategorías para COLLARES
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('MIYUKI', 'miyuki', 'Collares con técnica Miyuki', 1),
  ('ALAMBRISMO', 'alambrismo', 'Collares de alambrismo', 2),
  ('BORDADOS', 'bordados', 'Collares bordados', 3),
  ('SOUTACHE', 'soutache', 'Collares con técnica Soutache', 4)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'collares';

-- Insertar subcategorías para PULSERAS
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('HOMBRE', 'hombre', 'Pulseras diseñadas para hombres', 1),
  ('MUJERES', 'mujeres', 'Pulseras elegantes para mujeres', 2),
  ('NIÑAS', 'ninas', 'Pulseras especiales para niñas', 3)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'pulseras';

-- Insertar subcategorías para LLAVEROS
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('MIYUKI', 'miyuki', 'Llaveros con técnica Miyuki', 1),
  ('RESINA', 'resina', 'Llaveros de resina artesanal', 2)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'llaveros';

-- Insertar subcategorías para PRENDEDORES
INSERT INTO subcategories (category_section_id, name, slug, description, display_order)
SELECT 
  cs.id,
  sub_data.name,
  sub_data.slug,
  sub_data.description,
  sub_data.display_order
FROM category_sections cs
JOIN main_categories mc ON cs.main_category_id = mc.id,
(VALUES
  ('MIYUKI', 'miyuki', 'Prendedores con técnica Miyuki', 1),
  ('BORDADOS', 'bordados', 'Prendedores bordados a mano', 2)
) AS sub_data(name, slug, description, display_order)
WHERE mc.slug = 'tienda' AND cs.slug = 'prendedores';