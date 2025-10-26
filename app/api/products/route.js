import { createServerClient } from '../../../lib/supabase/supabaseServer';
import { NextResponse } from 'next/server';

// Caché en memoria (persiste durante la vida del servidor)
let productsCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalidar cada 5 minutos

export async function GET(request) {
  try {
    const now = Date.now();
    
    // Verificar si hay caché válido
    if (productsCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return NextResponse.json(productsCache, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Si no hay caché, consultar Supabase
    const supabase = createServerClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, currency, image_url, discount_percentage, original_price, stock, category_id, is_on_sale, is_new_in_box, is_featured')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
    }

    // Actualizar caché
    productsCache = products || [];
    cacheTimestamp = now;

    return NextResponse.json(products || [], {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Soporte para POST: forzar refresco de caché (útil desde el admin tras editar/crear/eliminar)
export async function POST(request) {
  try {
    console.log('[PRODUCTS API] POST refresh requested');
    
    // Clear local cache and fetch fresh data from Supabase
    productsCache = null;
    cacheTimestamp = null;

    const supabase = createServerClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, currency, image_url, discount_percentage, original_price, stock, category_id, is_on_sale, is_new_in_box, is_featured')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[PRODUCTS API] Error refreshing cache:', error);
      return NextResponse.json({ revalidated: false, error: 'Error fetching products' }, { status: 500 });
    }

    productsCache = products || [];
    cacheTimestamp = Date.now();
    
    console.log(`[PRODUCTS API] Cache refreshed successfully. Count: ${productsCache.length}`);

    return NextResponse.json({ revalidated: true, count: productsCache.length });
  } catch (err) {
    console.error('[PRODUCTS API] Error in POST refresh:', err);
    return NextResponse.json({ revalidated: false, error: 'Internal server error' }, { status: 500 });
  }
}
