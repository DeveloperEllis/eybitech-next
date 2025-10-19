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
  metadataBase: createValidURL(process.env.NEXT_PUBLIC_APP_URL),
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
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
