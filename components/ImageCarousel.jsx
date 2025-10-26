"use client";
import { useState } from 'react';
import Image from 'next/image';

export default function ImageCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
        <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  const openModal = (index) => { setModalIndex(index); setShowModal(true); };
  const nextModalImage = () => setModalIndex((prev) => (prev + 1) % images.length);
  const prevModalImage = () => setModalIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <>
      <div className="relative">
        <div className="mb-3">
        
      </div>
        <div
          className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
          onClick={() => openModal(currentIndex)}
        >
          <Image
            src={images[currentIndex]}
            alt={`Producto ${currentIndex + 1}`}
            fill
            className="object-contain transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1.5 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span>Ver imagen completa</span>
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevImage(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextImage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="mt-4 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentIndex ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-400'}`}
              >
                <Image 
                  src={img} 
                  alt={`Miniatura ${index + 1}`} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 15vw"
                />
                {index === currentIndex && <div className="absolute inset-0 bg-blue-600/10"></div>}
              </button>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-medium z-10">
              {modalIndex + 1} / {images.length}
            </div>
          )}

          <div className="relative max-w-6xl w-full h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <Image 
                src={images[modalIndex]} 
                alt={`Producto ${modalIndex + 1}`} 
                fill
                className="object-contain"
                sizes="90vw"
                quality={95}
              />
            </div>
            {images.length > 1 && (
              <>
                <button onClick={prevModalImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={nextModalImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-4xl w-full px-4">
              <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setModalIndex(index)}
                    className={`flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${index === modalIndex ? 'border-white ring-2 ring-white/50' : 'border-white/30 hover:border-white/60'}`}
                  >
                    <Image 
                      src={img} 
                      alt={`Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
