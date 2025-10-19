"use client";

import { useState, useEffect, Suspense } from 'react';
import { Megaphone, X } from 'lucide-react'; 
// 💡 Asegúrate de que esta ruta apunte a donde guardaste el carrusel
import AdCarousel from '../app/ads/AdCarousel'; 
// Importar o definir el componente de carga (ajusta la importación según tu proyecto)
const LoadingSpinner = ({ text }) => <div className="text-gray-500">{text}</div>; 

function AdAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);
  const [adCount, setAdCount] = useState(0); 

  // --- Lógica para obtener solo el conteo ---
  useEffect(() => {
    async function fetchCount() {
        try {
            const response = await fetch('/api/count-ads');
            if (response.ok) {
                const data = await response.json();
                setAdCount(data.count);
            }
        } catch (err) {
            console.error("No se pudo obtener el conteo de anuncios:", err);
        }
    }
    fetchCount();
  }, []);

  return (
    <>
      {/* Botón Flotante (SIN CAMBIOS) */}
      {adCount > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
              
              <span className="flex absolute h-full w-full">
                  <span className="
                      animate-ping absolute inline-flex h-full w-full 
                      rounded-full bg-red-400 opacity-75 
                      transition duration-1000
                  "></span>
              </span>

              <button
                onClick={() => setIsOpen(true)}
                title="Ver Anuncios y Promociones"
                className="
                  relative inline-flex p-4 
                  bg-red-600 text-white 
                  rounded-full shadow-2xl 
                  hover:bg-red-700 
                  transition-all duration-300 
                  transform hover:scale-105 active:scale-95 
                  focus:outline-none focus:ring-4 focus:ring-red-300
                "
              >
                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 border-2 border-white rounded-full z-10">
                    {adCount}
                </span>
                
                <Megaphone className="w-6 h-6" /> 
              </button>
          </div>
      )}

      {/* Modal de Anuncios: ESTRUCTURA SIMPLIFICADA */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" 
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Contenido del Modal */}
            <div className="
                inline-block w-full max-w-2xl my-8 
                overflow-hidden text-left align-middle 
                transition-all transform bg-white 
                shadow-2xl rounded-xl
            ">
              
              {/* ✅ Header Simplificado: Solo el botón de cierre, sin título ni borde */}
              <div className="absolute top-0 right-0 p-3 z-30">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  // Botón de cierre más visible y estilizado para el encabezado
                  className="p-1 bg-white bg-opacity-80 text-gray-500 hover:text-gray-900 rounded-full transition-colors shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* ✅ Body del Modal: Aquí va el carrusel sin padding excesivo */}
              {/* Hemos quitado el p-4/sm:p-6 para que el carrusel (que ya tiene padding interno) se vea más ajustado. */}
              <div className="relative"> 
                <Suspense fallback={
                  <div className="flex justify-center items-center h-40">
                    <LoadingSpinner text="Cargando anuncios..." />
                  </div>
                }>
                  <AdCarousel /> 
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdAnnouncement;