"use client";
import ProductCard from './ProductCardNew';

export default function SimilarProducts({ products, onAddToCart, categoryName }) {
  if (!products || products.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        {categoryName ? (<>
          Más productos en <span className="text-blue-600">{categoryName}</span>
        </>) : ('Productos similares')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}
