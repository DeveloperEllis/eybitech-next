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
            <div className="flex flex-col p-4 space-y-4">
              <Link href="/" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800`}>Inicio</Link>
              <Link href="/calculadora" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800`}>Calculadora</Link>
              <Link href="/servicios" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800`}>Servicios</Link>
              <Link href="/blog" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800`}>Blog & Tutoriales</Link>
              <Link href="/contacto" onClick={closeDrawer} className={`${linkClasses} py-3 px-4 rounded-lg hover:bg-gray-800`}>Contacto</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
