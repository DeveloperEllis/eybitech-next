"use client";

// Componente de loading spinner reutilizable
export function LoadingSpinner({ 
  text = "Cargando...", 
  size = "large", 
  className = "",
  showText = true 
}) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8", 
    large: "h-12 w-12"
  };

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClasses[size]} ${showText ? 'mb-4' : ''}`}></div>
        {showText && <p className="text-gray-600">{text}</p>}
      </div>
    </div>
  );
}

// Componente de página de carga completa
export function PageLoading({ text = "Cargando página..." }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{text}</h2>
        <p className="text-gray-600">Por favor espera un momento...</p>
      </div>
    </div>
  );
}

// Componente de loading inline para búsquedas/filtros
export function InlineLoading({ text = "Cargando...", size = "small" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-6 w-6"
  };

  return (
    <div className="flex items-center justify-center py-2">
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 mr-2 ${sizeClasses[size]}`}></div>
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}

// Skeleton loader para tarjetas de productos
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Skeleton loader para lista de productos
export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Componente de error con retry
export function ErrorState({ 
  message = "Ha ocurrido un error", 
  onRetry,
  showRetry = true 
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 text-red-300">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Oops! Algo salió mal
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}

// Loading para página de detalles de producto
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar skeleton */}
      <div className="h-16 bg-white shadow-sm animate-pulse border-b">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="text-gray-400">›</div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="text-gray-400">›</div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image carousel skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl animate-pulse shadow-sm" />
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0 animate-pulse shadow-sm" />
              ))}
            </div>
          </div>

          {/* Product info skeleton */}
          <div className="space-y-6">
            {/* Title and brand */}
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-4/5 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>

            {/* Price section */}
            <div className="space-y-3 p-4 bg-white rounded-xl shadow-sm">
              <div className="h-10 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
              <div className="flex space-x-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="space-y-2 p-4 bg-white rounded-xl shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/6 animate-pulse" />
              </div>
            </div>

            {/* Stock and category info */}
            <div className="flex flex-wrap gap-3">
              <div className="h-8 bg-gray-200 rounded-full w-24 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-full w-28 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse" />
            </div>

            {/* Action buttons */}
            <div className="space-y-3 pt-4">
              <div className="h-14 bg-gray-200 rounded-xl w-full animate-pulse shadow-sm" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 rounded-xl w-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Similar products skeleton */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="bg-gray-800 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 bg-gray-600 rounded w-3/4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-full animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-600 rounded w-4/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook personalizado para gestionar estados de carga
export function useLoadingState(initialState = false) {
  const [isLoading, setIsLoading] = useState(initialState);
  const [error, setError] = useState(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage) => {
    setIsLoading(false);
    setError(errorMessage);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError
  };
}