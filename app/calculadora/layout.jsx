import { og_images } from "../../constants/appConstants";

export const metadata = {
  title: "Calculadora de Divisas | Eybitech",
  description: "Calculadora de conversión de monedas USD, CUP y EUR con tasas actualizadas. Convierte precios fácilmente en Cuba.",
  keywords: ['calculadora', 'divisas', 'conversión', 'USD', 'CUP', 'EUR', 'monedas', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    url: `${process.env.NEXT_PUBLIC_APP_URL}/calculadora`,
    siteName: "Eybitech",
    locale: "es_CU",
    title: "Calculadora de Divisas | Eybitech",
    description: "Convierte entre USD, CUP y EUR con tasas actualizadas en tiempo real. Herramienta gratuita para Cuba.",
    images: [
      {
        url: og_images.calculadora,
        width: 1200,
        height: 630,
        alt: 'Calculadora de divisas Eybitech',
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Divisas | Eybitech",
    description: "Convierte entre USD, CUP y EUR con tasas actualizadas en tiempo real.",
    images: og_images.calculadora,
    creator: "@eybitech",
    site: "@eybitech",
  },
  "og:image": og_images.calculadora,
};

export default function CalculadoraLayout({ children }) {
  return children;
}