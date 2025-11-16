import { createServerClient } from '../../../lib/supabase/serverClient';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { productId } = await request.json();
    
    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    
    // Incrementar views_count
    const { error } = await supabase.rpc('increment_product_views', {
      p_product_id: productId
    });

    if (error) {
      console.error('Error incrementing views:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in increment-view API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
