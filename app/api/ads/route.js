import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/supabase/serverClient';

// GET - Obtener anuncios activos
export async function GET(request) {
  try {
    const supabase = supabaseServer();
    
    // Consulta directa sin ordenamiento para evitar registros fantasma
    const { data: activeAds, error } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Preparar URLs de imagen
    const adsWithImageUrls = activeAds.map(ad => ({
      ...ad,
      full_image_url: ad.image_path 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/ads-images/${ad.image_path}`
        : null
    }));

    return NextResponse.json({
      ads: adsWithImageUrls,
      total: activeAds.length,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('API /ads error:', error);
    return NextResponse.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}