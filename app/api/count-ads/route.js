// /app/api/count-ads/route.js

import { NextResponse } from 'next/server';
// Importa la función de inicialización del servidor (debe ser la misma ruta)
import { createServerClient } from '../../../lib/supabase/supabaseServer.js'; 

/**
 * Maneja las solicitudes HTTP GET y devuelve el número de anuncios activos.
 */
export async function GET() {
    try {
        // Inicializa el cliente de Supabase
        const supabase = createServerClient(); 
        
        const now = new Date().toISOString(); 

        // Consulta de conteo (solo necesitamos el head y el count)
        const { 
            count, 
            error 
        } = await supabase
            .from('ads') 
            .select('*', { count: 'exact', head: true }) // Solicitamos el conteo exacto
            .eq('is_active', true) 
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`); 

        if (error) {
            console.error("Error de Supabase al contar:", error);
            // Si hay error en la consulta, se lanza y pasa al catch
            throw new Error(error.message);
        }

        // Devolvemos solo el número de anuncios activos
        // El megáfono aparecerá si este count es > 0
        return NextResponse.json({ count: count || 0 }, { status: 200 });

    } catch (error) {
        // Esta es la rama de error que siempre debe devolver una respuesta
        console.error('Error al contar anuncios (Server):', error.message);
        
        return NextResponse.json(
            { 
                count: 0, 
                message: 'Fallo interno al obtener el conteo.',
                detail: error.message || 'Error desconocido'
            },
            { status: 500 } // Error del servidor
        );
    }
}