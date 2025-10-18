import './globals.css';
import { CartProvider } from '../components/cart/CartProvider';
import SiteChrome from '../components/SiteChrome';
import { getStoreSettings } from '../lib/settings/getStoreSettings';

// Helper para crear URL válida
function createValidURL(url) {
  if (!url) return new URL('http://localhost:3000');
  
  // Si ya es una URL válida completa
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url);
    } catch {
      return new URL('http://localhost:3000');
    }
  }
  
  // Si es solo un dominio, agregar https://
  try {
    return new URL(`https://${url}`);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export const metadata = {
  title: {
    template: '%s | Eybitech',
    default: 'Eybitech - Tu tienda de tecnología en Cuba',
  },
  description: '🔥 Ofertas increíbles en tecnología! Smartphones, laptops, tablets, smartwatches y más con los mejores precios en Cuba. ¡Descuentos exclusivos disponibles!',
  keywords: ['tecnología', 'electrónicos', 'smartphones', 'laptops', 'Cuba', 'Trinidad', 'tienda online', 'ofertas', 'descuentos', 'promociones'],
  authors: [{ name: 'Eybitech' }],
  creator: 'Eybitech',
  publisher: 'Eybitech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: createValidURL(process.env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: '🔥 Eybitech - ¡Ofertas increíbles en tecnología!',
    description: 'Descubre los mejores precios en smartphones, laptops, tablets y más. ¡Ofertas exclusivas y descuentos especiales en productos de calidad!',
    url: '/',
    siteName: 'Eybitech',
    locale: 'es_CU',
    type: 'website',
    // Use og-default.png (1200x630) for best compatibility with social previews
    images: [
      {
        url: '/logo.pn',
        width: 1200,
        height: 630,
        alt: 'Eybitech - Ofertas en tecnología',
      },
      {
        url: '/logo.png',
        width: 400,
        height: 400,
        alt: 'Logo Eybitech',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🔥 Eybitech - ¡Ofertas increíbles en tecnología!',
    description: 'Descubre los mejores precios en smartphones, laptops, tablets y más. ¡Ofertas exclusivas y descuentos especiales!',
  // Use og-default.png for Twitter preview
  images: ['/og-default.png'],
    creator: '@eybitech',
    site: '@eybitech',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const revalidate = 300; // 5 min ISR para settings globales

export default async function RootLayout({ children }) {
  const settings = await getStoreSettings();
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <CartProvider>
          <SiteChrome initialSettings={settings}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
