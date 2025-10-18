"use client";
import { useEffect, useState } from "react";
import { CONTACT_INFO, getResolvedAppConstants } from "../constants/appConstants";
import { LoadingSpinner } from "./LoadingComponents";

export default function ServicesClient({ services = [] }) {
  const [selected, setSelected] = useState(null);
  const [whats, setWhats] = useState(CONTACT_INFO.WHATSAPP_NUMBER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const merged = await getResolvedAppConstants((defaults, settings) => (
          settings.whatsapp || defaults.CONTACT_INFO.WHATSAPP_NUMBER
        ));
        setWhats(merged);
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleWhatsApp = (service) => {
    const msg = `¡Hola! 👋 Estoy interesado en el servicio: *${service.title}*\n\n${service.short_desc || ''}\n\n¿Podrían darme más información?`;
    const url = `https://wa.me/${(whats || CONTACT_INFO.WHATSAPP_NUMBER).replace(/[^\d]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // Mostrar loading si no hay servicios y aún está cargando
  if (isLoading && (!services || services.length === 0)) {
    return <LoadingSpinner text="Cargando servicios..." />;
  }

  if (!services?.length) {
    return (
      <div className="text-center py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay servicios disponibles
          </h3>
          <p className="text-gray-600">
            Por el momento no tenemos servicios publicados. Vuelve pronto para ver nuestras ofertas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2" onClick={() => setSelected(s)}>
            <div className={`bg-gradient-to-r ${s.gradient} p-6 text-white relative overflow-hidden`}>
              <div className="absolute top-0 right-0 text-8xl opacity-10 transform translate-x-4 -translate-y-4">{s.icon || '🛠️'}</div>
              <div className="relative z-10">
                <div className="text-5xl mb-3">{s.icon || '🛠️'}</div>
                <h3 className="text-xl font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-white/90">{s.short_desc}</p>
              </div>
            </div>
            <div className="p-6">
              {s.urgency && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 animate-pulse">🔥 {s.urgency}</span>
                </div>
              )}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{s.description}</p>
              {s.benefits && s.benefits.length > 0 && (
                <ul className="space-y-2 mb-6">
                  {s.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2 flex-col sm:flex-row">
                {s.cta && (
                  <button onClick={(e) => { e.stopPropagation(); handleWhatsApp(s); }} className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium h-10">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-4 h-4 fill-current"><path d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6zm97.2-131.8c-5.3-2.6-31.4-15.4-36.2-17.2-4.8-1.7-8.3-2.6-11.8 2.6-3.5 5.3-13.6 17.2-16.7 20.7-3.1 3.5-6.2 4-11.5 1.3-31.2-15.6-51.5-27.9-72.2-63.1-5.5-9.5 5.5-8.8 15.6-29.2 1.7-3.5.9-6.6-.4-9.2-1.3-2.6-11.8-28.5-16.2-39-4.3-10.3-8.7-8.9-11.8-9.1-3-.2-6.6-.2-10.1-.2-3.5 0-9.2 1.3-14 6.6-4.8 5.3-18.4 18-18.4 43.9 0 25.9 18.9 51 21.6 54.6 2.6 3.5 37.2 56.7 90.1 79.4 33.5 14.4 46.6 15.6 63.3 13.1 10.2-1.5 31.4-12.8 35.8-25.2 4.4-12.4 4.4-23 3.1-25.3-1.3-2.3-4.9-3.7-10.2-6.3z"/></svg>
                    <span>{s.cta}</span>
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); setSelected(s); }} className="flex-1 text-sm text-gray-600 hover:text-blue-600 font-medium h-10">Ver todos los beneficios →</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className={`bg-gradient-to-r ${selected.gradient} p-6 md:p-8 text-white sticky top-0 z-10`}>
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-6xl mb-4">{selected.icon}</div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">{selected.title}</h2>
                <p className="text-lg text-white/90">{selected.short_desc}</p>
              </div>
              <div className="p-6 md:p-8">
                {selected.urgency && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <div className="flex items-center space-x-2 text-red-700">
                      <span className="text-2xl animate-bounce">🔥</span>
                      <span className="font-bold text-lg">{selected.urgency}</span>
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">¿Qué incluye?</h3>
                  <p className="text-gray-700 leading-relaxed">{selected.description}</p>
                </div>
                {selected.benefits && selected.benefits.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Beneficios</h3>
                    <ul className="space-y-2">
                      {selected.benefits.map((b, i) => (
                        <li key={i} className="flex items-center text-gray-700">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleWhatsApp(selected)} className="flex-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current"><path d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6zm97.2-131.8c-5.3-2.6-31.4-15.4-36.2-17.2-4.8-1.7-8.3-2.6-11.8 2.6-3.5 5.3-13.6 17.2-16.7 20.7-3.1 3.5-6.2 4-11.5 1.3-31.2-15.6-51.5-27.9-72.2-63.1-5.5-9.5 5.5-8.8 15.6-29.2 1.7-3.5.9-6.6-.4-9.2-1.3-2.6-11.8-28.5-16.2-39-4.3-10.3-8.7-8.9-11.8-9.1-3-.2-6.6-.2-10.1-.2-3.5 0-9.2 1.3-14 6.6-4.8 5.3-18.4 18-18.4 43.9 0 25.9 18.9 51 21.6 54.6 2.6 3.5 37.2 56.7 90.1 79.4 33.5 14.4 46.6 15.6 63.3 13.1 10.2-1.5 31.4-12.8 35.8-25.2 4.4-12.4 4.4-23 3.1-25.3-1.3-2.3-4.9-3.7-10.2-6.3z"/></svg>
                    <span>Contactar por WhatsApp</span>
                  </button>
                  <button onClick={() => setSelected(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
