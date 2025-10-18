import { supabaseServer } from "../../../lib/supabase/serverClient";
import { notFound } from 'next/navigation';
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import FooterBar from "../../../components/FooterBar";
import ImageCarousel from "../../../components/ImageCarousel";
import ProductInfoClient from "../../../components/ProductInfoClient";
import SimilarProducts from "../../../components/SimilarProducts";

export const dynamic = "force-dynamic"; // SSR siempre; luego podemos evaluar ISR
export const revalidate = 0;

// Helper para crear URL válida
function createValidURL(url) {
  if (!url) return 'http://localhost:3000';
  
  // Si ya es una URL válida completa
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url); // Validar que es una URL válida
      return url;
    } catch {
      return 'http://localhost:3000';
    }
  }
  
  // Si es solo un dominio, agregar https://
  try {
    new URL(`https://${url}`); // Validar que es válida
    return `https://${url}`;
  } catch {
    return 'http://localhost:3000';
  }
}

export async function generateMetadata({ params }) {
    const { id } = params;
    const supabase = supabaseServer();
    const { data: product } = await supabase
        .from("products")
        .select(`
            id, name, description, price, currency, image_url, original_price, discount_percentage,
            vendor_id(name),
            category_id(name)
        `)
        .eq("id", id)
        .single();

    const titleBase = "Eybitech";
    if (!product) {
        return {
            title: `Producto no encontrado | ${titleBase}`,
            description: "El producto que buscas no existe o ha sido eliminado",
            openGraph: { 
                title: `Producto no encontrado | ${titleBase}`, 
                description: "El producto que buscas no existe o ha sido eliminado",
                images: [{ url: '/logo.png', width: 1200, height: 630, alt: 'Eybitech' }],
            },
            twitter: { 
                card: "summary_large_image",
                title: `Producto no encontrado | ${titleBase}`, 
                description: "El producto que buscas no existe o ha sido eliminado",
                images: ['/logo.png'],
            },
        };
    }

    // Construir descripción más rica
    let richDescription = product.description || `${product.name} disponible en Eybitech`;
    
    // Verificar si está en oferta y agregar información prominente
    const hasOffer = product.original_price && product.discount_percentage > 0;
    const originalPrice = hasOffer ? parseFloat(product.original_price) : null;
    const currentPrice = parseFloat(product.price);
    const savings = hasOffer ? originalPrice - currentPrice : 0;
    
    if (hasOffer) {
        richDescription = `🔥 ¡OFERTA ESPECIAL! ${product.discount_percentage}% OFF - Ahorra ${savings.toFixed(2)} ${product.currency} | ${richDescription}`;
    }
    
    if (product.vendor_id?.name) {
        richDescription += ` | Marca: ${product.vendor_id.name}`;
    }
    if (product.category_id?.name) {
        richDescription += ` | Categoría: ${product.category_id.name}`;
    }
    
    const finalDescription = richDescription.slice(0, 160);

    // Crear título más atractivo para ofertas
    let title = hasOffer 
        ? `🔥 ${product.name} - ${product.discount_percentage}% OFF - ${product.price} ${product.currency} | ${titleBase}`
        : `${product.name} - ${product.price} ${product.currency} | ${titleBase}`;
    
    const baseUrl = createValidURL(process.env.NEXT_PUBLIC_APP_URL);
    // Priorizar imagen del producto, si no existe usar logo de Eybitech
    const image = product.image_url || `${baseUrl}/logo.png`;
    const url = `${baseUrl}/product/${product.id}`;

    return {
        title,
        description: finalDescription,
        keywords: [
            product.name,
            product.category_id?.name,
            product.vendor_id?.name,
            'tecnología',
            'Cuba',
            'Eybitech'
        ].filter(Boolean),
        openGraph: {
            type: "website",
            url,
            title,
            description: finalDescription,
            images: [{ 
                url: image, 
                width: 1200, 
                height: 630,
                alt: `${product.name} - Eybitech`,
            }],
            siteName: "Eybitech",
            locale: "es_CU",
            ...(hasOffer && {
                product: {
                    price: {
                        amount: product.price,
                        currency: product.currency,
                    },
                    originalPrice: {
                        amount: product.original_price,
                        currency: product.currency,
                    },
                    discountPercentage: product.discount_percentage,
                    savings: savings.toFixed(2),
                }
            }),
            ...(!hasOffer && {
                productPrice: {
                    amount: product.price,
                    currency: product.currency,
                }
            }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: finalDescription,
            images: [image],
            creator: "@eybitech",
        },
        alternates: {
            canonical: url,
        },
    };
}

export default async function ProductPage({ params }) {
    const { id } = params;
    const supabase = supabaseServer();

    const { data: product, error } = await supabase
        .from("products")
        .select(`
      *,
      vendor_id(name),
      category_id(id, name, icon)
    `)
        .eq("id", id)
        .single();

    // Si no se encuentra el producto, mostrar página 404
    if (!product || error) {
        notFound();
    }

    // Fetch product images (optional table)
    let productImages = [];
    const { data: imgs } = await supabase
        .from("product_images")
        .select("image_url")
        .eq("product_id", id)
        .order("display_order", { ascending: true });
    productImages = (imgs || []).map((i) => i.image_url).filter(Boolean);

    // Fetch similar products (same category, exclude current)
    let similarProducts = [];
    let query = supabase
        .from("products")
        .select(`*, vendor_id(name)`) // keep lightweight
        .neq("id", id)
        .limit(4);
    const categoryId = product?.category_id?.id || product?.category_id;
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data: similars } = await query;
    similarProducts = similars || [];

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="mb-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        <span>Volver al inicio</span>
                    </Link>
                </div>
                {!product && (
                    <div className="card p-6">
                        <h1 className="section-title">Producto no encontrado</h1>
                        {error && <p className="text-red-600 mt-2">{error.message}</p>}
                    </div>
                )}
                {product && (
                    <>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="card p-4">

                                <ImageCarousel images={productImages.length > 0 ? productImages : (product.image_url ? [product.image_url] : [])} />
                            </div>

                            <div className="card p-4">
                                <ProductInfoClient product={product} />
                                {product.vendor_id?.name && (
                                    <p className="text-gray-600 mt-4">Proveedor: {product.vendor_id.name}</p>
                                )}
                                {product.category_id?.name && (
                                    <p className="text-gray-600">Categoría: {product.category_id.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <SimilarProducts products={similarProducts} categoryName={product?.category_id?.name} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
