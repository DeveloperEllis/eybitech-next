"use client";
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase/browserClient';

export default function ProductAnalytics() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendorsCount, setVendorsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [topViewed, setTopViewed] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes, vendCountRes, catCountRes] = await Promise.all([
          supabase.from('products').select('id,name,stock,price,currency,is_on_sale,is_featured,is_new_in_box,category_id,created_at,image_url,views_count'),
          supabase.from('categories').select('id,name,icon'),
          supabase.from('vendors').select('*', { count: 'exact', head: true }),
          supabase.from('categories').select('*', { count: 'exact', head: true }),
        ]);
        if (prodRes.error) throw prodRes.error;
        if (catRes.error) throw catRes.error;
        setProducts(prodRes.data || []);
        setCategories(catRes.data || []);
        setVendorsCount(vendCountRes.count || 0);
        setCategoriesCount(catCountRes.count || 0);

        // Compute top viewed
        const prods = prodRes.data || [];
        if (prods.some(p => typeof p.views_count === 'number')) {
          const arr = [...prods]
            .map(p => ({ ...p, views: p.views_count || 0 }))
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5);
          setTopViewed(arr);
        } else {
          try {
            const { data: viewsRows, error: viewsErr } = await supabase
              .from('product_views')
              .select('product_id');
            if (!viewsErr && Array.isArray(viewsRows)) {
              const counts = new Map();
              viewsRows.forEach(r => counts.set(r.product_id, (counts.get(r.product_id) || 0) + 1));
              const arr = prods
                .map(p => ({ ...p, views: counts.get(p.id) || 0 }))
                .filter(p => p.views > 0)
                .sort((a, b) => b.views - a.views)
                .slice(0, 5);
              setTopViewed(arr);
            } else {
              setTopViewed([]);
            }
          } catch {
            setTopViewed([]);
          }
        }
      } catch (e) {
        console.error('Error cargando estadísticas:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const lowStock = products.filter(p => (p.stock ?? 0) <= 5).length;
    const onSale = products.filter(p => p.is_on_sale).length;
    const featured = products.filter(p => p.is_featured).length;
    const newInBox = products.filter(p => p.is_new_in_box).length;
    return { totalProducts, totalStock, lowStock, onSale, featured, newInBox };
  }, [products]);

  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
  }, [products]);

  const lowStockList = useMemo(() => {
    return products
      .filter(p => (p.stock ?? 0) <= 5)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 5);
  }, [products]);

  const categoryMap = useMemo(() => {
    const map = new Map();
    categories.forEach(c => map.set(c.id, c));
    return map;
  }, [categories]);

  const categoryDistribution = useMemo(() => {
    const counts = new Map();
    products.forEach(p => {
      const key = p.category_id || 'sin-cat';
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const arr = Array.from(counts.entries()).map(([key, count]) => ({
      key,
      count,
      label: key === 'sin-cat' ? 'Sin categoría' : (categoryMap.get(key)?.name || 'Categoría'),
      icon: key === 'sin-cat' ? '❓' : (categoryMap.get(key)?.icon || '📦')
    }));
    arr.sort((a, b) => b.count - a.count);
    const max = Math.max(1, ...arr.map(a => a.count));
    return { arr, max };
  }, [products, categoryMap]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Productos" value={metrics.totalProducts} icon="📦" color="bg-blue-50 text-blue-700" />
        <KpiCard label="Stock total" value={metrics.totalStock} icon="📊" color="bg-indigo-50 text-indigo-700" />
        <KpiCard label="Bajo stock" value={metrics.lowStock} icon="⚠️" color="bg-yellow-50 text-yellow-700" />
        <KpiCard label="En oferta" value={metrics.onSale} icon="🔥" color="bg-red-50 text-red-700" />
        <KpiCard label="Destacados" value={metrics.featured} icon="⭐" color="bg-amber-50 text-amber-700" />
        <KpiCard label="Nuevos en caja" value={metrics.newInBox} icon="📦" color="bg-green-50 text-green-700" />
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Distribución por categoría</h3>
          <div className="space-y-3">
            {categoryDistribution.arr.slice(0, 8).map(item => (
              <div key={item.key} className="">
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2 text-gray-700"><span className="text-lg">{item.icon}</span>{item.label}</div>
                  <span className="text-gray-500">{item.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded">
                  <div className="h-2 bg-blue-600 rounded" style={{ width: `${(item.count / categoryDistribution.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Productos recientes</h3>
          <ul className="divide-y divide-gray-200">
            {recentProducts.map(p => (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                  {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" /> : <span className="text-gray-400 text-sm">N/A</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{p.price} {p.currency}</div>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Bajo stock</h3>
          <ul className="divide-y divide-gray-200">
            {lowStockList.length === 0 && <li className="py-3 text-sm text-gray-500">Sin alertas de stock</li>}
            {lowStockList.map(p => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">{p.stock ?? 0}</span>
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                </div>
                <span className="text-xs text-gray-500">ID: {p.id.slice(0, 6)}...</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Proveedores</p>
              <p className="font-semibold text-gray-900 text-lg">{vendorsCount}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-gray-500">Categorías</p>
              <p className="font-semibold text-gray-900 text-lg">{categoriesCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Más vistos */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Productos más vistos</h3>
        <ul className="divide-y divide-gray-200">
          {(!topViewed || topViewed.length === 0) && (
            <li className="py-3 text-sm text-gray-500">No hay datos de vistas aún</li>
          )}
          {topViewed.map(p => (
            <li key={p.id} className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-12 h-12 object-cover" /> : <span className="text-gray-400 text-sm">N/A</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-500">{p.price} {p.currency}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">{p.views || 0} vistas</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }) {
  return (
    <div className={`rounded-lg p-4 border border-gray-100 bg-white`}> 
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <span className="text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}
