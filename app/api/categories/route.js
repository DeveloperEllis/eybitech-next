import { createServerClient } from '../../../lib/supabase/supabaseServer';
import { NextResponse } from 'next/server';

// Caché en memoria
let categoriesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos (las categorías cambian menos)

export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidar cada 10 minutos

export async function GET(request) {
  try {
    const now = Date.now();
    
    // Verificar si hay caché válido
    if (categoriesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return NextResponse.json(categoriesCache, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      });
    }

    // Si no hay caché, consultar Supabase
    const supabase = createServerClient();
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name, icon')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
    }

    // Actualizar caché
    categoriesCache = categories || [];
    cacheTimestamp = now;

    return NextResponse.json(categories || [], {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Error in categories API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
