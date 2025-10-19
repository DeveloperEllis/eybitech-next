"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquareOff } from 'lucide-react'; 

// Componente simple para el spinner de carga (SIN CAMBIOS)
const Spinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

// Componente de la Tarjeta Individual del Anuncio (AdItem) (SIN CAMBIOS)
const AdItem = ({ ad }) => (
    <div 
        className="
            p-5 sm:p-6 h-full w-full 
            flex flex-col items-center justify-between 
            text-center bg-white 
            transition-all duration-500
        "
    >
        <div className="flex flex-col items-center w-full">
            {ad.image_url && (
                <img 
                    src={ad.image_url} 
                    alt={ad.title || 'Anuncio'} 
                    className="w-full max-h-48 object-contain rounded-md mb-3 sm:mb-4" 
                />
            )}
            <h4 className="text-lg sm:text-xl font-extrabold text-gray-900 mt-2">
                {ad.title}
            </h4>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6 max-w-sm">
                {ad.description}
            </p>
        </div>
        {ad.link_url && (
            <a 
                href={ad.link_url}
                target="_blank" 
                rel="noopener noreferrer" 
                className="
                    mt-auto py-3 px-8 rounded-full  
                    bg-indigo-600 hover:bg-indigo-700 
                    text-white font-bold text-base 
                    transition duration-300 shadow-xl 
                    hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300
                    w-auto max-w-xs
                "
            >
                {ad.cta_text || 'Ver Oferta'}
            </a>
        )}
    </div>
);

// ----------------------------------------------------------------------
// Componente Principal del Carrusel (AdCarousel)
// ----------------------------------------------------------------------

function AdCarousel() {
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    // Lógica para obtener anuncios (omitiendo por brevedad)
    useEffect(() => {
        async function fetchAds() {
            try {
                const response = await fetch('/api/get-ads'); 
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'No se pudieron obtener los anuncios.');
                setAds(data); 
            } catch (err) {
                console.error("Error al cargar anuncios:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchAds();
    }, []); 

    // Lógica para el avance automático (SIN CAMBIOS)
    useEffect(() => {
        if (ads.length === 0) return;
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
        }, 5000); 
        return () => clearInterval(timer);
    }, [ads.length]); 

    // Funciones de navegación manual (SIN CAMBIOS)
    const prevSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + ads.length) % ads.length);
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ads.length);
    };

    // RENDERING CONDICIONAL DE ESTADOS (SIN CAMBIOS)
    const baseClasses = "w-full min-h-64 flex items-center justify-center rounded-xl";
    if (loading) return (<div className={`${baseClasses} border border-gray-200`}><Spinner /></div>);
    if (error) return (<div className={`p-5 ${baseClasses} border border-red-300 bg-red-50`}><p className="text-sm text-red-700">⚠️ Error al cargar: {error}</p></div>);
    if (ads.length === 0) return (<div className={`p-5 ${baseClasses} flex-col border border-gray-300 bg-gray-50`}><MessageSquareOff className="w-6 h-6 text-gray-500 mb-2"/><p className="text-sm text-gray-600">No hay anuncios activos en este momento.</p></div>);
    
    const currentAd = ads[currentIndex];

    // --- RENDERING DEL CARRUSEL FINAL ---
    return (
        // Mantenemos la clase `group` para que el código sea limpio si se quiere volver al hover, pero ya no es necesaria.
        <div className="relative w-full min-h-64 rounded-xl overflow-hidden shadow-md group"> 
            
            {/* Contenido del Anuncio */}
            <div className="h-full">
                <AdItem ad={currentAd} />
            </div>
            
            {/* Contador de Anuncios (SIN CAMBIOS) */}
            <div className="absolute top-0 left-0 z-20">
                <div className="
                    bg-red-600 text-white text-xs font-semibold 
                    py-1 px-3 rounded-tl-xl rounded-br-lg 
                    shadow-md
                ">
                    {currentIndex + 1} / {ads.length}
                </div>
            </div>

            {/* ⬅️ Guion Izquierdo: CLASES MODIFICADAS para ser SIEMPRE visible */}
            <button
                onClick={prevSlide}
                className="
                    absolute left-0 top-1/2 transform -translate-y-1/2 
                    p-2 text-gray-500
                    hover:text-black hover:bg-white hover:bg-opacity-20
                    transition-all duration-300 z-10 
                    rounded-r-lg
                "
                aria-label="Anuncio anterior"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            {/* ➡️ Guion Derecho: CLASES MODIFICADAS para ser SIEMPRE visible */}
            <button
                onClick={nextSlide}
                className="
                    absolute right-0 top-1/2 transform -translate-y-1/2 
                    p-2 text-gray-500
                    hover:text-black hover:bg-white hover:bg-opacity-20
                    transition-all duration-300 z-10 
                    rounded-l-lg
                "
                aria-label="Próximo anuncio"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

        </div>
    );
}

export default AdCarousel;