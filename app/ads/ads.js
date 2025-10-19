"use client";

import { useState, useEffect } from "react";
// Asumiendo que esta es la ruta correcta
import { supabase } from '../../lib/supabase/browserClient'; 
import { ChevronLeft, ChevronRight, Dot } from "lucide-react"; 

// Nombre del componente. Puedes renombrarlo según dónde lo uses.
function AdCarousel() {
  const [activeAds, setActiveAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0); // Estado para el carrusel

  useEffect(() => {
    fetchActiveAds();
  }, []);

  /**
   * Obtiene solo los anuncios activos que están dentro de su rango de fechas.
   */
  const fetchActiveAds = async () => {
    try {
      setLoading(true);
      // Obtener la fecha actual para el filtrado en el cliente (idealmente esto se haría en una función de Supabase)
      const now = new Date().toISOString(); 
      
      const { data, error } = await supabase
        .from("ads") 
        .select(`*`) 
        .eq('is_active', true) // Solo los que están marcados como activos
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // 🛠️ Filtrado en el cliente por rango de fechas (Si start_date y end_date no son NULL)
      const filteredAds = data.filter(ad => {
          const startDate = ad.start_date ? new Date(ad.start_date) : null;
          const endDate = ad.end_date ? new Date(ad.end_date) : null;
          const currentTime = new Date();

          const isRunning = 
              (!startDate || currentTime >= startDate) && 
              (!endDate || currentTime <= endDate);
              
          return isRunning;
      });

      setActiveAds(filteredAds);
      
    } catch (error) {
      console.error('Error cargando anuncios activos:', error);
      setActiveAds([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Lógica del Carrusel ----------------

  const nextSlide = () => {
    setCurrentSlide((prev) => 
        (prev === activeAds.length - 1 ? 0 : prev + 1)
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => 
        (prev === 0 ? activeAds.length - 1 : prev - 1)
    );
  };
  
  // Auto-slide (opcional)
  useEffect(() => {
      if (activeAds.length > 1) {
          const interval = setInterval(nextSlide, 5000); // Cambia cada 5 segundos
          return () => clearInterval(interval);
      }
  }, [activeAds.length]);


  // ---------------- Renderizado ----------------

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (activeAds.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 border border-gray-200">
        No hay anuncios promocionales disponibles.
      </div>
    );
  }
  
  // Renderiza el carrusel con Tailwind CSS
  return (
    <div className="relative w-full overflow-hidden rounded-xl shadow-lg bg-white">
        
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {activeAds.map((ad, index) => (
          <div key={ad.id} className="w-full flex-shrink-0 relative h-64 sm:h-80">
            <a 
                href={ad.link_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full h-full"
            >
                {/* Imagen del anuncio */}
                {ad.image_url && (
                    <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                    />
                )}
                
                {/* Capa de contenido */}
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-start p-6 sm:p-10">
                    <h3 className="text-xl sm:text-3xl font-bold text-white drop-shadow-md">
                        {ad.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-200 mt-2 max-w-lg hidden sm:block">
                        {ad.description}
                    </p>
                    {ad.cta_text && (
                        <span className="mt-4 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md">
                            {ad.cta_text}
                        </span>
                    )}
                </div>
            </a>
          </div>
        ))}
      </div>

      {/* Botones de Navegación */}
      {activeAds.length > 1 && (
        <>
            <button
              onClick={prevSlide}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-opacity z-10"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
        
            {/* Indicadores de Puntos */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 z-10">
              {activeAds.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`p-1.5 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-gray-400 hover:bg-gray-200'
                  }`}
                  aria-label={`Ir al anuncio ${index + 1}`}
                >
                    <Dot className={`w-3 h-3 ${index === currentSlide ? 'text-green-500' : 'text-transparent'}`} />
                </button>
              ))}
            </div>
        </>
      )}
    </div>
  );
}

export default AdCarousel;