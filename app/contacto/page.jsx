import ContactForm from "../../components/contact/ContactForm";
import { CONTACT_INFO, getResolvedAppConstants } from "../../constants/appConstants";

export const metadata = {
  title: "Contacto",
  description: "Ponte en contacto con Eybitech. WhatsApp, email, formulario de contacto. Atención personalizada en Trinidad, Cuba.",
  keywords: ['contacto', 'WhatsApp', 'email', 'soporte', 'Trinidad', 'Cuba', 'Eybitech'],
  openGraph: {
    type: "website",
    title: "Contacto | Eybitech",
    description: "¿Tienes dudas o necesitas una cotización? Contáctanos por WhatsApp, email o formulario. Atención personalizada en Cuba.",
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Contacto Eybitech - Atención personalizada',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Eybitech",
    description: "Contáctanos por WhatsApp, email o formulario. Atención personalizada en Cuba.",
    images: ['/logo.png'],
  },
};

export default async function ContactoPage() {
  const { whatsapp, email, location, schedule } = await getResolvedAppConstants((d, s) => ({
    whatsapp: s?.whatsapp || d.CONTACT_INFO.WHATSAPP_NUMBER,
    email: s?.email || d.CONTACT_INFO.EMAIL,
    location: s?.locality || d.CONTACT_INFO.LOCATION,
    schedule: s?.schedule || d.CONTACT_INFO.BUSINESS_HOURS,
  }));
  const waHref = `https://wa.me/${String(whatsapp || "").replace(/[^\d]/g, "")}`;
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="container-page py-6 md:py-10">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contacto</h1>
            <p className="text-gray-600 mt-1">¿Tienes dudas o necesitas una cotización? Escríbenos.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <ContactForm />
            </div>
            <div className="card p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">También puedes escribirnos</h2>
              <div className="space-y-3 text-gray-700">
                                <a className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium" href={waHref} target="_blank" rel="noopener noreferrer">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.86 11.86 0 0012.06 0C5.7 0 .52 5.18.52 11.54c0 2.03.53 3.93 1.46 5.58L0 24l6.1-1.98a11.5 11.5 0 005.96 1.64h.01c6.36 0 11.54-5.18 11.54-11.54 0-3.08-1.2-5.98-3.38-8.14zM12.07 21.3h-.01a9.76 9.76 0 01-4.98-1.36l-.36-.21-3.62 1.18 1.19-3.52-.24-.37a9.75 9.75 0 01-1.5-5.24C2.55 6.33 6.86 2 12.06 2c2.65 0 5.14 1.03 7.01 2.9 1.87 1.87 2.9 4.36 2.9 7 0 5.2-4.32 9.53-9.9 9.53zm5.58-7.3c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.96 1.18-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.68-1.64-.93-2.25-.24-.58-.48-.5-.68-.51l-.58-.01c-.2 0-.53.08-.8.38-.27.3-1.03 1-1.03 2.43 0 1.43 1.05 2.82 1.2 3.02.15.2 2.06 3.14 4.99 4.41.7.3 1.24.48 1.66.62.7.22 1.34.19 1.84.12.56-.08 1.78-.72 2.04-1.41.25-.7.25-1.3.17-1.41-.07-.11-.27-.18-.57-.33z"/></svg>
                  WhatsApp
                </a>
                                <a className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium" href={`mailto:${email}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 2l-8 5L4 6h16zM4 18V8l8 5 8-5v10H4z"/></svg>
                  {email}
                </a>
                <div className="text-sm text-gray-600">{location} • {schedule}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
