export const metadata = {
  title: "Calculadora de Divisas",
  description: "Calculadora de conversión de monedas USD, CUP y EUR con tasas actualizadas. Convierte precios fácilmente en Cuba.",
  keywords: ['calculadora', 'divisas', 'conversión', 'USD', 'CUP', 'EUR', 'monedas', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    title: "Calculadora de Divisas | Eybitech",
    description: "Convierte entre USD, CUP y EUR con tasas actualizadas en tiempo real. Herramienta gratuita para Cuba.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Calculadora de divisas Eybitech',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Divisas | Eybitech",
    description: "Convierte entre USD, CUP y EUR con tasas actualizadas en tiempo real.",
    images: ['/logo.png'],
  },
};

export default function CalculadoraLayout({ children }) {
  return children;
}