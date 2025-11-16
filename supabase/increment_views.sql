-- Función para incrementar el contador de vistas de productos
-- Esta función se ejecuta de forma atómica para evitar race conditions

CREATE OR REPLACE FUNCTION increment_product_views(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products 
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = p_product_id;
END;
$$;

-- Asegurar que la columna views_count existe
-- Si no existe, la crea con valor por defecto 0
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'views_count'
  ) THEN
    ALTER TABLE products ADD COLUMN views_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Crear índice para mejorar performance en consultas por vistas
CREATE INDEX IF NOT EXISTS idx_products_views_count ON products(views_count DESC);
