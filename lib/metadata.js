// Configuración centralizada de metadatos para Open Graph y Twitter Cards

export const SITE_METADATA = {
  title: {
    template: '%s | Eybitech',
    default: 'Eybitech - Tu tienda de tecnología en Cuba',
  },
  description: 'Venta de productos electrónicos, tecnológicos y accesorios de calidad en Cuba. Smartphones, laptops, tablets, smartwatches y más.',
  keywords: ['tecnología', 'electrónicos', 'smartphones', 'laptops', 'Cuba', 'Trinidad', 'tienda online'],
  
  // Imágenes por defecto
  images: {
    default: '/og-default.png',
    logo: '/logo.png',
  },
  
  // Open Graph
  openGraph: {
    siteName: 'Eybitech',
    locale: 'es_CU',
    type: 'website',
  },
  
  // Twitter
  twitter: {
    creator: '@eybitech',
    site: '@eybitech',
  },
  
  // URLs y social
  social: {
    facebook: 'https://facebook.com/eybitech',
    twitter: 'https://twitter.com/eybitech',
    instagram: 'https://instagram.com/eybitech',
  }
};

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

// Helper para generar metadatos consistentes
export function generateSEOMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords = [],
  noIndex = false,
}) {
  const baseUrl = createValidURL(process.env.NEXT_PUBLIC_APP_URL);
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
  const imageUrl = image || SITE_METADATA.images.default;
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  
  return {
    title,
    description,
    keywords: [...SITE_METADATA.keywords, ...keywords],
    openGraph: {
      title,
      description,
      url: fullUrl,
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: SITE_METADATA.openGraph.siteName,
      locale: SITE_METADATA.openGraph.locale,
      type,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [fullImageUrl],
      creator: SITE_METADATA.twitter.creator,
    },
    alternates: {
      canonical: fullUrl,
    },
    robots: {
      index: !noIndex,
      follow: true,
      googleBot: {
        index: !noIndex,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Metadatos específicos para productos
export function generateProductMetadata({
  product,
  additionalImages = [],
  vendor = null,
  category = null,
}) {
  if (!product) {
    return generateSEOMetadata({
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe o ha sido eliminado',
      noIndex: true,
    });
  }

  let description = product.description || `${product.name} disponible en Eybitech`;
  if (vendor) description += ` | Marca: ${vendor}`;
  if (category) description += ` | Categoría: ${category}`;
  if (product.original_price && product.discount_percentage > 0) {
    description += ' | ¡Oferta especial!';
  }

  const images = [];
  if (product.image_url) {
    images.push({
      url: product.image_url,
      width: 1200,
      height: 630,
      alt: `${product.name} - Eybitech`,
    });
  }
  
  additionalImages.forEach(img => {
    if (img) {
      images.push({
        url: img,
        width: 1200,
        height: 630,
        alt: `${product.name} - Vista adicional`,
      });
    }
  });

  if (images.length === 0) {
    images.push({
      url: SITE_METADATA.images.default,
      width: 1200,
      height: 630,
      alt: `${product.name} - Eybitech`,
    });
  }

  return {
    title: `${product.name} - ${product.price} ${product.currency}`,
    description: description.slice(0, 160),
    keywords: [
      product.name,
      category,
      vendor,
      'tecnología',
      'Cuba',
      'comprar',
      'precio',
    ].filter(Boolean),
    openGraph: {
      type: 'website',
      title: `${product.name} - ${product.price} ${product.currency}`,
      description: description.slice(0, 160),
      images,
      siteName: SITE_METADATA.openGraph.siteName,
      locale: SITE_METADATA.openGraph.locale,
      productPrice: {
        amount: product.price,
        currency: product.currency,
      },
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - ${product.price} ${product.currency}`,
      description: description.slice(0, 160),
      images: images.map(img => img.url),
      creator: SITE_METADATA.twitter.creator,
    },
  };
}