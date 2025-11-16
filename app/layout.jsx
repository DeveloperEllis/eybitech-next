import './globals.css';
import { CartProvider } from '../components/cart/CartProvider';
import SiteChrome from '../components/SiteChrome';
import { getStoreSettings } from '../lib/settings/getStoreSettings';
import StructuredData from '../components/StructuredData';

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
  description: 'Tienda online de tecnología en Cuba. Smartphones, laptops, tablets, smartwatches y accesorios. Precios competitivos y envío a toda Cuba.',
  keywords: ['tecnología Cuba', 'tienda online Cuba', 'smartphones Cuba', 'laptops Cuba', 'electrónicos Cuba', 'Trinidad', 'Sancti Spíritus', 'comprar tecnología'],
  authors: [{ name: 'Eybitech' }],
  creator: 'Eybitech',
  publisher: 'Eybitech',
  metadataBase: createValidURL(process.env.NEXT_PUBLIC_APP_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CU',
    siteName: 'Eybitech',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@eybitech',
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
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const revalidate = 300; // 5 min ISR para settings globales

export default async function RootLayout({ children }) {
  const settings = await getStoreSettings();
  return (
    <html lang="es-CU">
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL || 'https://www.eybitech.com'} />
        <meta name="geo.region" content="CU-SS" />
        <meta name="geo.placename" content="Trinidad" />
        <meta name="geo.position" content="21.8022;-79.9833" />
        <meta name="ICBM" content="21.8022, -79.9833" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <StructuredData type="Organization" data={settings} />
        <StructuredData type="WebSite" />
        <CartProvider>
          <SiteChrome initialSettings={settings}>
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}
