// /app/api/count-ads/route.js

import { NextResponse } from 'next/server';
import { createServerClient } from '../../../lib/supabase/supabaseServer.js'; 

// 💡 SOLUCIÓN: Deshabilitar el cacheo de la solicitud.
export const dynamic = 'force-dynamic'; 
// Esto asegura que la función GET se ejecute en cada solicitud (request)

/**
 * Maneja las solicitudes HTTP GET y devuelve el número de anuncios activos.
 */
export async function GET() {
    try {
        const supabase = createServerClient(); 
        const now = new Date().toISOString(); 

        const { 
            count, 
            error 
        } = await supabase
            .from('ads') 
            .select('*', { count: 'exact', head: true }) 
            .eq('is_active', true) 
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`); 

        if (error) {
            console.error("Error de Supabase al contar:", error);
            throw new Error(error.message);
        }

        return NextResponse.json({ count: count || 0 }, { status: 200 });

    } catch (error) {
        console.error('Error al contar anuncios (Server):', error.message);
        return NextResponse.json(
            { 
                count: 0, 
                message: 'Fallo interno al obtener el conteo.',
                detail: error.message || 'Error desconocido'
            },
            { status: 500 }
        );
    }
}