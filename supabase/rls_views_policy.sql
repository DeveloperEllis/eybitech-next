-- ============================================
-- POLÍTICAS RLS PARA CONTADOR DE VISTAS
-- ============================================
-- Estas políticas permiten actualizar SOLO views_count
-- manteniendo la seguridad del resto de la tabla products

-- 1. Habilitar RLS en la tabla products (si no está habilitado)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Política de LECTURA (SELECT): Todos pueden ver productos
-- Esta política permite que usuarios no autenticados vean productos
DROP POLICY IF EXISTS "products_select_public" ON products;
CREATE POLICY "products_select_public" 
ON products 
FOR SELECT 
TO public
USING (true);

-- 3. Política de INSERCIÓN: Solo usuarios autenticados como admin
-- Protege contra la creación de productos no autorizados
DROP POLICY IF EXISTS "products_insert_admin" ON products;
CREATE POLICY "products_insert_admin" 
ON products 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 4. Política de ACTUALIZACIÓN GENERAL: Solo admins
-- Protege todas las columnas excepto views_count
DROP POLICY IF EXISTS "products_update_admin" ON products;
CREATE POLICY "products_update_admin" 
ON products 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 5. Política de ELIMINACIÓN: Solo admins
DROP POLICY IF EXISTS "products_delete_admin" ON products;
CREATE POLICY "products_delete_admin" 
ON products 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- ============================================
-- FUNCIÓN SEGURA PARA INCREMENTAR VISTAS
-- ============================================
-- Usar SECURITY DEFINER permite ejecutar con privilegios del owner
-- Esto bypasea RLS de forma controlada solo para views_count

DROP FUNCTION IF EXISTS increment_product_views(UUID);
CREATE OR REPLACE FUNCTION increment_product_views(p_product_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- 🔑 IMPORTANTE: Ejecuta con privilegios del owner
SET search_path = public
AS $$
BEGIN
  -- Actualizar SOLO la columna views_count
  -- No permite modificar ninguna otra columna
  UPDATE products 
  SET views_count = COALESCE(views_count, 0) + 1,
      updated_at = NOW() -- Opcional: actualizar timestamp
  WHERE id = p_product_id;
  
  -- No lanzar error si el producto no existe
  -- Simplemente no hace nada
END;
$$;

-- ============================================
-- PERMISOS PARA LA FUNCIÓN
-- ============================================
-- Permitir que usuarios anónimos ejecuten SOLO esta función
GRANT EXECUTE ON FUNCTION increment_product_views(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_product_views(UUID) TO authenticated;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Verificar que la columna views_count existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'products' 
    AND column_name = 'views_count'
  ) THEN
    ALTER TABLE products ADD COLUMN views_count INTEGER DEFAULT 0 NOT NULL;
    CREATE INDEX idx_products_views_count ON products(views_count DESC);
  END IF;
END $$;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================
COMMENT ON FUNCTION increment_product_views IS 
'Función segura para incrementar el contador de vistas. 
Usa SECURITY DEFINER para bypass RLS de forma controlada.
Solo modifica views_count, no permite cambiar otras columnas.';

COMMENT ON COLUMN products.views_count IS 
'Contador de vistas del producto. Incrementado automáticamente 
por la función increment_product_views cuando un usuario ve el producto.';
