import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Usar service role key para poder actualizar sin RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[INCREMENT-VIEW] Missing Supabase environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Primero obtener el producto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, views_count')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('[INCREMENT-VIEW] Error fetching product:', fetchError);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Incrementar views_count
    const newViewsCount = (product.views_count || 0) + 1;
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ views_count: newViewsCount })
      .eq('id', productId);

    if (updateError) {
      console.error('[INCREMENT-VIEW] Error updating views:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log(`[INCREMENT-VIEW] Success for product ${productId}: ${product.views_count || 0} -> ${newViewsCount}`);
    return NextResponse.json({ success: true, views: newViewsCount });
    
  } catch (error) {
    console.error('[INCREMENT-VIEW] Exception:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
