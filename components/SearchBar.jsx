"use client";
import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function SearchBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(currentSearch);

  useEffect(() => { setInputValue(currentSearch); }, [currentSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (!inputValue.trim()) {
        params.delete('search');
      } else {
        params.set('search', inputValue.trim());
      }
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue, pathname, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (!inputValue.trim()) params.delete('search');
    else params.set('search', inputValue.trim());
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearSearch = () => {
    setInputValue('');
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete('search');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="py-2 mb-4">
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Escribe para buscar productos..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-3 pr-20 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {inputValue && (
            <button type="button" onClick={clearSearch} className="absolute inset-y-0 right-12 pr-2 flex items-center text-gray-400 hover:text-red-500" title="Limpiar búsqueda">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <button type="submit" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600" title="Buscar">
            {inputValue ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </form>
        {inputValue && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="animate-pulse">●</span> Buscando "{inputValue}"...
          </div>
        )}
      </div>
    </div>
  );
}
