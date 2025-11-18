"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from './cart/CartProvider';

export default function Navbar({ cartCount: cartCountProp = 0, initialSettings }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);
  const closeDrawer = () => setIsDrawerOpen(false);
  const { count } = useCart();

  const linkClasses = "text-white hover:text-blue-300 transition-colors duration-200 font-medium";
  const activeLinkClasses = ""; // Next no calcula isActive por defecto; se puede usar usePathname si es necesario

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 sticky top-0 z-40 shadow-md">
      <div className="flex justify-between items-center">
        {/* Mobile menu */}
        <button onClick={toggleDrawer} className="md:hidden p-2 rounded-md hover:bg-gray-800" aria-label="Abrir menú">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo / Home */}
        <Link href="/" className="flex items-center gap-2">
          <span className="relative w-7 h-7">
            <Image src={(initialSettings?.logoSrc) || "/logo.png"} alt="Logo" fill sizes="28px" className="object-contain" />
          </span>
          <span className="text-xl font-bold">
            <span className="text-blue-400">{(initialSettings?.store_name || 'Eybitech').slice(0,4)}</span>
            {(initialSettings?.store_name || 'Eybitech').slice(4)}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-8">
          <Link href="/" className={`${linkClasses} ${activeLinkClasses}`}>Inicio</Link>
          <Link href="/ofertas" className={`${linkClasses} ${activeLinkClasses} text-orange-400 hover:text-orange-300`}>🔥 Ofertas</Link>
          <Link href="/servicios" className={`${linkClasses} ${activeLinkClasses}`}>Servicios</Link>
          <Link href="/calculadora" className={`${linkClasses} ${activeLinkClasses}`}>Calculadora</Link>
          <Link href="/blog" className={`${linkClasses} ${activeLinkClasses}`}>Blog & Tutoriales</Link>
          <Link href="/contacto" className={`${linkClasses} ${activeLinkClasses}`}>Contacto</Link>
        </div>

        {/* Cart */}
        <Link href="/cart" className={`${linkClasses} relative flex items-center px-3 py-2`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          {(count || cartCountProp) > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {count || cartCountProp}
            </span>
          )}
        </Link>
      </div>

      {/* Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={closeDrawer} />
          <div className="absolute left-0 top-0 h-full w-64 bg-gray-900 shadow-xl">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">Menú</h3>
              <button onClick={closeDrawer} className="p-2 rounded-md hover:bg-gray-800" aria-label="Cerrar menú">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </Link>
              <Link href="/ofertas" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 text-orange-400 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ofertas Especiales</span>
              </Link>
              <Link href="/calculadora" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Calculadora</span>
              </Link>
              <Link href="/servicios" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Servicios</span>
              </Link>
              <Link href="/blog" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>Blog & Tutoriales</span>
              </Link>
              <Link href="/contacto" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contacto</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
