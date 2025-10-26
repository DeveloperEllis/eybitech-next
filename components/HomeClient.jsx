"use client";
import SearchBar from './SearchBar';
import ExchangeRateBanner from './ExchangeRateBanner';
import ProductCard from './ProductCardNew';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense, useEffect, useRef, useCallback } from 'react';
import { LoadingSpinner, InlineLoading, ProductGridSkeleton } from './LoadingComponents';
// 🛠️ Asumiendo que AdAnnouncement está en su propio archivo (lo que es mejor práctica)
import AdAnnouncement from './AdAnnouncement';
import AdCarousel from '../app/ads/AdCarousel'; 


// Componente para mostrar cuando no hay productos (Sin cambios)
function NoProductsFound({ searchTerm, category, flagFilter, onClearFilters }) {
  const getFilterDescription = () => {
    const filters = [];
    if (searchTerm) filters.push(`"${searchTerm}"`);
    if (category !== 'all') filters.push(`categoría seleccionada`);
    if (flagFilter !== 'all') {
      const flagNames = {
        'sale': 'en oferta',
        'new': 'nuevos',
        'featured': 'destacados'
      };
      filters.push(flagNames[flagFilter] || flagFilter);
    }
    return filters.length > 0 ? filters.join(', ') : 'filtros aplicados';
  };

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron productos
        </h3>
        <p className="text-gray-600 mb-6">
          No hay productos que coincidan con {getFilterDescription()}.
        </p>
        <div className="space-y-3">
          <div className="text-sm text-gray-500">
            <p>Intenta:</p>
            <ul className="mt-2 space-y-1">
              <li>• Verificar la ortografía</li>
              <li>• Usar términos más generales</li>
              <li>• Cambiar o quitar filtros</li>
            </ul>
          </div>
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Ver todos los productos
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Componente CategoryFilter (Sin cambios)
// ----------------------------------------------------------------------
function CategoryFilter({ categories }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const current = searchParams.get('category') || 'all';

  const onChange = async (id) => {
    setIsLoading(true);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (id === 'all') params.delete('category');
    else params.set('category', id);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    
    // Simular un pequeño delay para mostrar el loading
    setTimeout(() => setIsLoading(false), 300);
  };

  return (
    <div className="mt-2">
      {isLoading && (
        <InlineLoading text="Filtrando productos..." />
      )}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        <button 
          onClick={() => onChange('all')} 
          disabled={isLoading}
          className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors disabled:opacity-50 ${
            current==='all'
              ?'bg-blue-600 text-white border-blue-600'
              :'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Todas
        </button>
        {(categories || []).map(c => (
          <button 
            key={c.id} 
            onClick={() => onChange(String(c.id))} 
            disabled={isLoading}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors disabled:opacity-50 ${
              current===String(c.id)
                ?'bg-blue-600 text-white border-blue-600'
                :'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {c.icon ? <span className="mr-1">{c.icon}</span> : null}{c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Componente FlagFilter (ÚNICA DEFINICIÓN)
// ----------------------------------------------------------------------
function FlagFilter({ setIsFiltering }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const current = (searchParams.get('filter') || 'all').toLowerCase();

  const update = async (value) => {
    setIsFiltering(true);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (!value || value === 'all') params.delete('filter');
    else params.set('filter', value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
    
    // Simular delay para mostrar loading
    setTimeout(() => setIsFiltering(false), 300);
  };

  const Chip = ({ value, label, icon }) => (
    <button 
      onClick={() => update(value)} 
      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-colors hover:scale-105 ${
        current===value
          ?'bg-purple-600 text-white border-purple-600 shadow-md'
          :'bg-white text-gray-700 border-gray-300 hover:bg-purple-50 hover:border-purple-300'
      }`}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </button>
  );

  return (
    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar py-1">
      <Chip value="all" label="Todos" icon="🏪" />
      <Chip value="new" label="Nuevo" icon="📦" />
      <Chip value="sale" label="En oferta" icon="🔥" />
      <Chip value="featured" label="Destacado" icon="⭐" />
    </div>
  );
}


// ----------------------------------------------------------------------
// Componente Principal: HomeClient
// ----------------------------------------------------------------------
export default function HomeClient({ products: initialProducts, categories = [] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Estado para scroll infinito
  const [allProducts, setAllProducts] = useState(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  
  const searchTerm = (searchParams.get('search') || '').toLowerCase();
  const category = searchParams.get('category') || 'all';
  const flagFilter = (searchParams.get('filter') || 'all').toLowerCase();

  // Cargar más productos desde la API
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await fetch(`/api/products?page=${nextPage}&limit=20`);
      const data = await response.json();
      
      if (data.products && data.products.length > 0) {
        setAllProducts(prev => [...prev, ...data.products]);
        setDisplayedProducts(prev => [...prev, ...data.products]);
        setPage(nextPage);
        setHasMore(nextPage < data.totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

  // Intersection Observer para detectar scroll al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, loadMoreProducts]);

  // Resetear cuando cambian los productos iniciales
  useEffect(() => {
    setAllProducts(initialProducts);
    setDisplayedProducts(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length >= 20);
  }, [initialProducts]);

  // Filtrado de productos (ahora usa displayedProducts)
  const textFiltered = !searchTerm
    ? displayedProducts
    : displayedProducts.filter(p =>
        p.name?.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
  
  const categoryFiltered = category === 'all'
    ? textFiltered
    : textFiltered.filter(p => String(p.category_id) === category);

  const finalFiltered = (() => {
    if (flagFilter === 'sale') return categoryFiltered.filter(p => p.is_on_sale || (p.original_price && p.discount_percentage > 0));
    if (flagFilter === 'new') return categoryFiltered.filter(p => p.is_new_in_box);
    if (flagFilter === 'featured') return categoryFiltered.filter(p => p.is_featured);
    return categoryFiltered;
  })();

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    router.push(pathname);
  };

  // Detectar si hay filtros activos
  const hasActiveFilters = searchTerm || category !== 'all' || flagFilter !== 'all';

  // Mostrar loading si hay menos de 3 productos y no hay filtros (carga inicial)
  const showInitialLoading = !hasActiveFilters && displayedProducts.length === 0;

  return (
    <>
      {/* 🟢 Componente de anuncio flotante */}
      
      
      <ExchangeRateBanner />
      <div className="container-page">
        <SearchBar />
        <CategoryFilter categories={categories} />
        <FlagFilter setIsFiltering={setIsFiltering} />
        
        {/* Mostrar estado de filtrado */}
        {isFiltering && (
          <div className="mt-4">
            <InlineLoading text="Aplicando filtros..." size="medium" />
          </div>
        )}
        
        {/* Mostrar loading inicial */}
        {showInitialLoading ? (
          <div className="mt-4">
            <ProductGridSkeleton count={8} />
          </div>
        ) : (
          <>
            {/* Mostrar productos o mensaje de no encontrados */}
            {finalFiltered.length > 0 ? (
              <>
                {/* Contador de productos */}
                <div className="mt-4 mb-2 text-sm text-gray-600">
                  Mostrando {finalFiltered.length} {finalFiltered.length === 1 ? 'producto' : 'productos'}
                  {hasActiveFilters && (
                    <button 
                      onClick={clearAllFilters}
                      className="ml-2 text-blue-600 hover:text-blue-800 underline"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
                
                {/* Grid de productos */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {finalFiltered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                
                {/* Sentinel para Intersection Observer (solo si no hay filtros activos) */}
                {!hasActiveFilters && (
                  <div ref={observerTarget} className="mt-8 flex justify-center">
                    {isLoadingMore && (
                      <div className="flex flex-col items-center space-y-2">
                        <LoadingSpinner size="medium" />
                        <p className="text-sm text-gray-600">Cargando más productos...</p>
                      </div>
                    )}
                    {!hasMore && displayedProducts.length > 20 && (
                      <p className="text-sm text-gray-500 py-4">
                        ✨ Has visto todos los productos disponibles
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <NoProductsFound 
                searchTerm={searchTerm}
                category={category}
                flagFilter={flagFilter}
                onClearFilters={clearAllFilters}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}