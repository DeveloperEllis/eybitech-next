"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProductsManagement from './ProductsManagement';
import VendorsManagement from './VendorsManagement';
import CategoriesManagement from './CategoriesManagement';
import ServicesManagement from './ServicesManagement';
import CurrencyManagement from './CurrencyManagement';
import ProductAnalytics from './ProductAnalytics';
import BlogManagement from './BlogManagement';
import AdsManagement from './AdsManagement';

import { supabase } from '../../lib/supabase/browserClient';
import StoreSettings from './StoreSettings';

export default function AdminDashboardClient() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const menuItems = [
    { id: 'analytics', name: 'Estadísticas', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
    )},
    { id: 'products', name: 'Productos', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
    )},
    { id: 'vendors', name: 'Proveedores', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
    )},
    { id: 'categories', name: 'Categorías', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
    )},
    { id: 'services', name: 'Servicios', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
    )},
    { id: 'blog', name: 'Blog & Tutoriales', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
    )},
    { id: 'currency', name: 'Tasas de Cambio', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    )},
    { id: 'ads', name: 'Anuncios', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m0 4v10m4-10v10M5 7v10m14-6h2m-2 4h2m-2-8h2"/></svg>
    )},
    { id: 'settings', name: 'Ajustes de Tienda', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-1.14 1.953-1.14 2.253 0a1.724 1.724 0 002.573 1.066c1.003-.58 2.187.604 1.607 1.607a1.724 1.724 0 001.066 2.573c1.14.3 1.14 1.953 0 2.253a1.724 1.724 0 00-1.066 2.573c.58 1.003-.604 2.187-1.607 1.607a1.724 1.724 0 00-2.573 1.066c-.3 1.14-1.953 1.14-2.253 0a1.724 1.724 0 00-2.573-1.066c-1.003.58-2.187-.604-1.607-1.607a1.724 1.724 0 00-1.066-2.573c-1.14-.3-1.14-1.953 0-2.253a1.724 1.724 0 001.066-2.573c-.58-1.003.604-2.187 1.607-1.607.99.572 2.232.05 2.573-1.066z"/></svg>
    )},
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
        <div className="flex items-center justify-center h-16 border-b border-gray-200 ">
          <div className="flex items-center space-x-2 ">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center ">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
            </div>
            <span className="text-blue-600 font-bold text-lg ">EYBITECH</span>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 ">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeSection === item.id ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}>
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))},
           <div className="pt-4 mt-2 border-t border-gray-200">
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setSidebarOpen(false); router.replace('/admin/login'); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    <span>Salir</span>
                  </button>
                </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header bar with breadcrumb and hamburger */}
        <header className="sticky top-0 z-20 h-16 bg-blue-600 text-white border-b border-blue-700 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center text-sm">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-3 p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className="flex items-center space-x-2">
              
              <span className="font-semibold">{menuItems.find(i => i.id === activeSection)?.name}</span>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)}>
            <div className="bg-white w-64 h-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Menú</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-600">
                    <svg className="w-6 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
              <nav className="p-4 ">
                {menuItems.map((item) => (
                  <button key={item.id} onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeSection === item.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}>
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <button
                    onClick={async () => { await supabase.auth.signOut(); setSidebarOpen(false); router.replace('/admin/login'); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
                    <span>Salir</span>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Content */}
        <main className="p-4 lg:p-8">

          {activeSection === 'analytics' && <ProductAnalytics />}
          {activeSection === 'products' && <ProductsManagement />}
          {activeSection === 'vendors' && <VendorsManagement />}
          {activeSection === 'categories' && <CategoriesManagement />}
          {activeSection === 'services' && <ServicesManagement />}
          {activeSection === 'blog' && <BlogManagement />}
          {activeSection === 'currency' && <CurrencyManagement />}
          {activeSection === 'ads' && <AdsManagement />}
          {activeSection === 'settings' && <StoreSettings />}
        </main>
      </div>
    </div>
  );
}
