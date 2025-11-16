import HomeClient from "../components/HomeClient";
import { createServerClient } from "../lib/supabase/supabaseServer";
import { Suspense } from "react";
import { og_images } from "../constants/appConstants";


export const revalidate = 60; // ISR: Revalidar cada 1 minuto (más agresivo para testing)

// Generar metadatos dinámicos para la página principal
export function generateMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.eybitech.com';
  return {
    title: "Inicio - Tienda de Tecnología en Cuba",
    description: "🛒 Compra tecnología en Cuba con Eybitech. ✅ Smartphones, laptops, tablets y accesorios. 🚚 Envío a toda Cuba. 💰 Mejores precios. ⭐ Productos originales y garantizados.",
    keywords: [
      'tecnología Cuba',
      'comprar celulares Cuba',
      'laptops Cuba',
      'tienda online Cuba',
      'smartphones Trinidad',
      'electrónicos Sancti Spíritus',
      'tablets Cuba',
      'smartwatches Cuba',
      'accesorios tecnológicos',
      'ofertas tecnología',
      'envío Cuba',
      'productos Apple Cuba',
      'Samsung Cuba',
      'Xiaomi Cuba'
    ],
    openGraph: {
      title: "Eybitech - La mejor tienda de tecnología en Cuba 🇨🇺",
      description: "Compra smartphones, laptops, tablets y más. Envío a toda Cuba. Precios competitivos. Productos originales con garantía.",
      url: baseUrl,
      siteName: "Eybitech",
      type: "website",
      locale: "es_CU",
      images: [
        {
          url: og_images.default,
          width: 1200,
          height: 630,
          alt: "Eybitech - Tienda de tecnología en Cuba con smartphones, laptops y accesorios",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Eybitech - Tecnología en Cuba 🇨🇺",
      description: "Smartphones, laptops, tablets y más. Envío a toda Cuba. Precios competitivos.",
      images: og_images.default,
      creator: "@eybitech",
      site: "@eybitech",
    },
    alternates: {
      canonical: baseUrl,
    },
    other: {
      'og:image': og_images.default,
    },
  };
}

export default async function HomePage() {
  // Usar consulta directa con createServerClient (funciona en dev y prod)
  try {
    const supabase = createServerClient();
    
    const [productsResult, categoriesResult] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, price, currency, image_url, discount_percentage, original_price, stock, category_id, is_on_sale, is_new_in_box, is_featured')
        .order('created_at', { ascending: false })
        .limit(20), // Solo cargar primeros 20 productos inicialmente
      supabase
        .from('categories')
        .select('id, name, icon')
        .order('name', { ascending: true })
    ]);
    
    const products = productsResult.data || [];
    const categories = categoriesResult.data || [];

    return (
      <div className="min-h-screen bg-gray-50">
        <main>
          <Suspense fallback={<div className="container-page py-6 text-gray-600">Cargando…</div>}>
            <HomeClient products={products} categories={categories} />
          </Suspense>
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading page:', error);
    return (
      <div className="min-h-screen bg-gray-50">
        <main>
          <div className="container-page">
            <p className="text-red-600">Error cargando productos</p>
          </div>
        </main>
      </div>
    );
  }
}
