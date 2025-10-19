import Navbar from "../../components/Navbar";
import FooterBar from "../../components/FooterBar";
import { supabaseServer } from "../../lib/supabase/serverClient";
import ServicesClient from "../../components/ServicesClient";

export const revalidate = 600; // Revalidar cada 10 minutos

export const metadata = {
  title: "Servicios",
  description: "Servicios profesionales de tecnología: reparación, mantenimiento, instalación, soporte técnico y consultoría en Cuba.",
  keywords: ['servicios', 'reparación', 'mantenimiento', 'soporte técnico', 'tecnología', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    title: "Servicios Profesionales | Eybitech",
    description: "Reparación, mantenimiento, instalación y soporte técnico de equipos tecnológicos en Cuba.",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL}/og-default.png`,
        width: 1200,
        height: 630,
        alt: 'Servicios Eybitech - Soporte técnico profesional',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Servicios Profesionales | Eybitech",
    description: "Reparación, mantenimiento, instalación y soporte técnico de equipos tecnológicos.",
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-default.png`],
  },
};

export default async function ServiciosPage() {
  const supabase = supabaseServer();
  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="container-page py-6 md:py-10">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Nuestros Servicios</h1>
            <p className="text-gray-600 mt-1">Soluciones profesionales para tus necesidades tecnológicas.</p>
          </div>
          {error ? (
            <div className="card p-4">
              <p className="text-red-600">Error cargando servicios</p>
            </div>
          ) : (
            <ServicesClient services={services || []} />
          )}
        </div>
      </main>
    </div>
  );
}
