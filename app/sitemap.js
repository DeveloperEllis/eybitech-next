import { createServerClient } from '../lib/supabase/supabaseServer'

export const revalidate = 3600 // Revalidar cada hora

// Helper para asegurar que la URL tenga protocolo
function ensureHttps(url) {
  if (!url) return 'https://www.eybitech.com';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export default async function sitemap() {
  const baseUrl = ensureHttps(process.env.NEXT_PUBLIC_APP_URL)
  const supabase = createServerClient()

  // Obtener todos los productos
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .order('updated_at', { ascending: false })

  // Obtener todas las categorías
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')

  // URLs estáticas principales
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/servicios`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/calculadora`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // URLs de productos
  const productPages = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  // URLs de categorías
  const categoryPages = (categories || []).map((category) => ({
    url: `${baseUrl}/?category=${category.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
