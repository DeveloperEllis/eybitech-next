import HomeClient from "../components/HomeClient";
import { createServerClient } from "../lib/supabase/supabaseServer";
import { Suspense } from "react";
import { og_images } from "../constants/appConstants";


export const revalidate = 300; // ISR: Revalidar cada 5 minutos

// Generar metadatos dinámicos para la página principal
export function generateMetadata() {
  return {
    title: "Inicio",
    description: "Descubre los mejores productos tecnológicos en Cuba. Smartphones, laptops, tablets, smartwatches y accesorios de calidad en Eybitech.",
    keywords: ['tecnología', 'electrónicos', 'smartphones', 'laptops', 'Cuba', 'Trinidad', 'tienda online', 'ofertas'],
    openGraph: {
      title: "Eybitech - Los mejores productos tecnológicos en Cuba",
      description: "Descubre smartphones, laptops, tablets, smartwatches y accesorios de calidad. Precios competitivos y envíos a toda Cuba.",
      url: process.env.NEXT_PUBLIC_APP_URL,
      siteName: "Eybitech",
      type: "website",
      locale: "es_CU",
      images: [
        {
          url: og_images.default,
          width: 1200,
          height: 630,
          alt: "Eybitech - Tienda de tecnología en Cuba",
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Eybitech - Los mejores productos tecnológicos en Cuba",
      description: "Descubre smartphones, laptops, tablets, smartwatches y accesorios de calidad.",
      images: og_images.default,
      creator: "@eybitech",
      site: "@eybitech",
    },
    // Proporcionar explícitamente og:image
    "og:image": og_images.default,
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
        .order('created_at', { ascending: false }),
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
