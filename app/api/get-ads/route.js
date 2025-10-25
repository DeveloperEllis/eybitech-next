// app/api/get-ads/route.js

import { NextResponse } from 'next/server';
// Importa la función de inicialización del servidor
import { createServerClient } from '../../../lib/supabase/supabaseServer.js'; 
export const dynamic = 'force-dynamic'; 
/**
 * Maneja las solicitudes HTTP GET, consultando la tabla public.ads de Supabase.
 */
export async function GET() {
    let supabase;
    
    try {
        // Inicializa el cliente DENTRO del try.
        // Si las variables de entorno son incorrectas, el error salta al catch.
        supabase = createServerClient(); 
        
        const now = new Date().toISOString(); 

        const { 
            data: ads, 
            error 
        } = await supabase
            .from('ads') 
            .select('id, title, description, image_url, link_url, cta_text') 
            .eq('is_active', true) 
            // Filtros de fecha (deben existir los campos en tu tabla)
            .or(`start_date.is.null,start_date.lte.${now}`)
            .or(`end_date.is.null,end_date.gte.${now}`); 

        if (error) {
            console.error("Error de Supabase en la consulta:", error);
            // Lanza el error para que sea capturado por el catch
            throw new Error(`Fallo en la consulta a Supabase: ${error.message}`);
        }

        if (!ads || ads.length === 0) {
            // Ruta de retorno 1: Éxito pero lista vacía
            return NextResponse.json([], { status: 200 });
        }

        // Ruta de retorno 2: Éxito con datos
        return NextResponse.json(ads, { status: 200 });

    } catch (error) {
        // Esta es la rama que captura todos los errores (conexión, consulta, inicialización)
        console.error('Error interno del servidor al obtener anuncios:', error.message);
        
        // La clave es que el catch SIEMPRE DEVUELVE una respuesta (NextResponse)
        return NextResponse.json(
            { 
                message: 'Error interno del servidor al obtener anuncios.',
                detail: error.message || 'Error desconocido' // Muestra el mensaje de error real
            },
            { status: 500 } // Estado de error interno
        );
    }
}