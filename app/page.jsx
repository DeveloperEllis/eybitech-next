import HomeClient from "../components/HomeClient";
import { supabaseServer } from "../lib/supabase/serverClient";
import { Suspense } from "react";
import { og_images } from "../constants/appConstants";


export const revalidate = 60; // ISR básico para listado

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
  // SSR/ISR simple: obtener productos (solo datos mínimos)
  const supabase = supabaseServer();
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, description, price, currency, image_url, discount_percentage, original_price, stock, category_id, is_on_sale, is_new_in_box, is_featured");

  const { data: categories = [] } = await supabase
    .from("categories")
    .select("id, name, icon")
    .order("name", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {error ? (
          <div className="container-page">
            <p className="text-red-600">Error cargando productos</p>
          </div>
        ) : (
          <Suspense fallback={<div className="container-page py-6 text-gray-600">Cargando…</div>}>
            <HomeClient products={products || []} categories={categories || []} />
            
          </Suspense>
        )}
      </main>
    </div>
  );
}
