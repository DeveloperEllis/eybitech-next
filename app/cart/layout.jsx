export const metadata = {
  title: "Carrito de Compras",
  description: "Revisa tu carrito de compras en Eybitech. Productos tecnológicos seleccionados con precios en múltiples monedas.",
  keywords: ['carrito', 'compras', 'productos', 'tecnología', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    title: "Carrito de Compras | Eybitech",
    description: "Revisa tu carrito de compras. Productos tecnológicos seleccionados con precios actualizados.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Carrito Eybitech - Finaliza tu compra',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Carrito de Compras | Eybitech",
    description: "Revisa tu carrito de compras. Productos tecnológicos seleccionados.",
    images: ['/logo.png'],
  },
  robots: {
    index: false, // No indexar páginas de carrito
    follow: true,
  },
};

export default function CartLayout({ children }) {
  return children;
}