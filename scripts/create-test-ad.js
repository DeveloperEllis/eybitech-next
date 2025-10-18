// Script para crear un anuncio de prueba
// Ejecutar con: node scripts/create-test-ad.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestAd() {
  try {
    console.log('🔍 Verificando si la tabla ads existe...');
    
    // Primero verificar si la tabla existe
    const { data: tables, error: tablesError } = await supabase
      .from('ads')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Error verificando tabla ads:', tablesError.message);
      console.log('💡 Necesitas ejecutar el script SQL en Supabase:');
      console.log('   1. Ve a tu proyecto en https://supabase.com/dashboard');
      console.log('   2. Ve a SQL Editor');
      console.log('   3. Ejecuta el archivo supabase/2025-10-17_ads_table.sql');
      return;
    }

    console.log('✅ Tabla ads existe');

    // Crear anuncio de prueba
    const testAd = {
      title: '¡Oferta Especial de Prueba!',
      description: 'Este es un anuncio de prueba para verificar que el sistema funciona correctamente.',
      cta_text: 'Ver Oferta',
      link_url: 'https://eybitech.com',
      is_active: true,
      start_date: null, // Sin restricción de fecha
      end_date: null    // Sin restricción de fecha
    };

    console.log('📝 Creando anuncio de prueba...');
    
    const { data: newAd, error: insertError } = await supabase
      .from('ads')
      .insert([testAd])
      .select();

    if (insertError) {
      console.error('❌ Error creando anuncio:', insertError.message);
      return;
    }

    console.log('✅ Anuncio de prueba creado:', newAd[0]);

    // Verificar que la función get_active_ads funciona
    console.log('🔍 Probando función get_active_ads...');
    
    const { data: activeAds, error: rpcError } = await supabase
      .rpc('get_active_ads');

    if (rpcError) {
      console.error('❌ Error con función get_active_ads:', rpcError.message);
      console.log('💡 Necesitas ejecutar el script SQL completo en Supabase');
      return;
    }

    console.log('✅ Función get_active_ads funciona, anuncios activos:', activeAds.length);
    console.log('📋 Anuncios:', activeAds);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createTestAd();