import { createServerClient } from '../../lib/supabase/supabaseServer';
import { redirect } from 'next/navigation';

export const metadata = {
  title: '🔥 Ofertas Especiales - Tecnología en Cuba',
  description: '¡Aprovecha nuestras ofertas especiales! 🎉 Los mejores precios en smartphones, laptops, tablets y accesorios. Descuentos exclusivos solo por tiempo limitado. 🚀 ¡No te lo pierdas!',
  keywords: [
    'ofertas tecnología Cuba',
    'descuentos smartphones Cuba',
    'ofertas laptops Cuba',
    'precios especiales Cuba',
    'promociones tecnología',
    'ofertas Trinidad',
    'descuentos electrónicos Cuba',
    'ofertas celulares Cuba',
  ],
  openGraph: {
    title: '🔥 ¡OFERTAS ESPECIALES! - Tecnología en Cuba',
    description: '¡Aprovecha descuentos increíbles! 🎉 Smartphones, laptops y tablets a precios únicos. Solo por tiempo limitado. 🚀',
    images: [
      {
        url: 'https://rboebzykpwhnyjdrygss.supabase.co/storage/v1/object/public/image-web/images/og-ofertas.png',
        width: 1200,
        height: 630,
        alt: 'Ofertas Especiales Eybitech - Tecnología en Cuba',
      },
    ],
    type: 'website',
    locale: 'es_CU',
    siteName: 'Eybitech',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🔥 ¡OFERTAS ESPECIALES! - Tecnología en Cuba',
    description: '¡Aprovecha descuentos increíbles! 🎉 Smartphones, laptops y tablets a precios únicos. Solo por tiempo limitado. 🚀',
    images: ['https://rboebzykpwhnyjdrygss.supabase.co/storage/v1/object/public/image-web/images/og-ofertas.png'],
  },
  alternates: {
    canonical: '/ofertas',
  },
};

export default async function OfertasPage() {
  // Redirigir a la home con el filtro de ofertas aplicado
  redirect('/?filter=sale');
}
