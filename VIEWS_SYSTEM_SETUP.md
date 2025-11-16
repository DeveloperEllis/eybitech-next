# Configuración del Sistema de Vistas de Productos

## Instrucciones de Setup

Para que el contador de vistas funcione correctamente, debes ejecutar el siguiente SQL en tu base de datos de Supabase:

### Paso 1: Ir al SQL Editor en Supabase

1. Abre tu proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### Paso 2: Ejecutar el SQL

Copia y pega el contenido del archivo `supabase/increment_views.sql` en el editor y ejecuta:

```sql
-- Función para incrementar el contador de vistas de productos
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

-- Crear índice para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_views_count ON products(views_count DESC);
```

### Paso 3: Verificar

Una vez ejecutado, puedes verificar que funciona visitando cualquier producto en tu tienda y esperando 2 segundos. El contador debería incrementarse automáticamente.

## Cómo Funciona

1. **ViewTracker Component**: Componente cliente invisible que se renderiza en cada página de producto
2. **Session Storage**: Evita contar múltiples vistas de la misma persona en la misma sesión
3. **Delay de 2 segundos**: Solo cuenta la vista si el usuario permanece al menos 2 segundos (evita bots)
4. **API Route**: `/api/increment-view` maneja la actualización
5. **RPC Function**: Función de Supabase que incrementa el contador de forma atómica

## Características

- ✅ Cuenta solo una vista por sesión de navegador
- ✅ Evita conteo de bots con delay
- ✅ Actualización atómica (sin race conditions)
- ✅ Compatible con ISR (Incremental Static Regeneration)
- ✅ No afecta el rendimiento de la página

## Troubleshooting

Si las vistas no se actualizan:
1. Verifica que el SQL se ejecutó correctamente en Supabase
2. Abre la consola del navegador y busca errores
3. Verifica que la columna `views_count` existe en la tabla `products`
4. Asegúrate de que las políticas RLS permiten la actualización (usa SECURITY DEFINER)
