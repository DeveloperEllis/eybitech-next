import { supabaseServer } from "../../../lib/supabase/serverClient";
import { notFound } from 'next/navigation';
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import FooterBar from "../../../components/FooterBar";
import ImageCarousel from "../../../components/ImageCarousel";
import ProductInfoClient from "../../../components/ProductInfoClient";
import SimilarProducts from "../../../components/SimilarProducts";

export const dynamic = "force-static"; // Generar estáticamente cuando sea posible
export const revalidate = 300; // Revalidar cada 5 minutos (ISR)

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
    
    // Optimizado: solo seleccionar campos necesarios para metadata
    const { data: product } = await supabase
        .from("products")
        .select('id, name, description, price, currency, image_url, original_price, discount_percentage, vendor_id, category_id')
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

    // Optimizado: consultas paralelas para reducir tiempo de carga
    const [productResult, imagesResult] = await Promise.all([
        supabase
            .from("products")
            .select('*, vendor_id(name), category_id(id, name, icon)')
            .eq("id", id)
            .single(),
        supabase
            .from("product_images")
            .select("image_url")
            .eq("product_id", id)
            .order("display_order", { ascending: true })
    ]);

    const { data: product, error } = productResult;
    
    // Si no se encuentra el producto, mostrar página 404
    if (!product || error) {
        notFound();
    }

    // Procesar imágenes
    const productImages = (imagesResult.data || []).map((i) => i.image_url).filter(Boolean);

    // Fetch similar products (same category, exclude current) - solo lo necesario
    let similarProducts = [];
    const categoryId = product?.category_id?.id || product?.category_id;
    if (categoryId) {
        const { data: similars } = await supabase
            .from("products")
            .select('id, name, price, currency, image_url, is_on_sale, discount_percentage, stock, original_price, is_new_in_box, is_featured, category_id')
            .eq("category_id", categoryId)
            .neq("id", id)
            .limit(4);
        similarProducts = similars || [];
    }

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
