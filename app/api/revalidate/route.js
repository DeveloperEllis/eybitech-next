import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Optionally protect this endpoint by setting REVALIDATE_SECRET in your environment.
// If set, the client must send header 'x-revalidate-token' with the same value.
import { POST as refreshProducts } from '../products/route';

export async function POST(request) {
  try {
    console.log('[REVALIDATE] Request received');
    
    // Secret protection (optional)
    const secret = process.env.REVALIDATE_SECRET;
    if (secret) {
      const token = request.headers.get('x-revalidate-token');
      if (!token || token !== secret) {
        console.log('[REVALIDATE] Unauthorized');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { path } = body || {};
    if (!path) {
      return NextResponse.json({ error: 'Missing path in request body' }, { status: 400 });
    }

    console.log(`[REVALIDATE] Revalidating path: ${path}`);

    // Revalidate the path (works with Next.js ISR)
    try {
      revalidatePath(path, 'page');
      console.log(`[REVALIDATE] Successfully revalidated: ${path}`);
    } catch (e) {
      console.error('revalidatePath error:', e);
      return NextResponse.json({ revalidated: false, error: String(e) }, { status: 500 });
    }

    // Also attempt to refresh products API cache (if present)
    let productsRefreshed = false;
    try {
      // The products POST handler doesn't use the request param, so calling without args is fine.
      if (typeof refreshProducts === 'function') {
        await refreshProducts();
        productsRefreshed = true;
        console.log('[REVALIDATE] Products cache refreshed');
      }
    } catch (e) {
      console.warn('Could not refresh products API cache:', e);
      productsRefreshed = false;
    }

    return NextResponse.json({ 
      revalidated: true, 
      productsRefreshed,
      path,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error in revalidate route:', err);
    return NextResponse.json({ error: 'Invalid JSON or server error' }, { status: 500 });
  }
}
