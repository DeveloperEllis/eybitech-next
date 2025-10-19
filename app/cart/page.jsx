"use client";
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import FooterBar from '../../components/FooterBar';
import { useCart } from '../../components/cart/CartProvider';
import { useEffect, useMemo, useState } from 'react';
import { CONTACT_INFO } from '../../constants/appConstants';
import { fetchExchangeRates, calculateCartTotals, formatCurrency, generateWhatsAppCartMessage } from '../../lib/currencyConverter';

export default function CartPage() {
  const { items, removeFromCart, clearCart, updateQuantity } = useCart();
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoadingRates(true);
      const rates = await fetchExchangeRates();
      if (!ignore) {
        setExchangeRates(rates);
        setLoadingRates(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  // Normalize items to original shape { product, quantity }
  const cartItems = useMemo(() => items.map((it) => it.product ? it : { product: it, quantity: it.quantity || 1 }), [items]);
  const totals = useMemo(() => exchangeRates ? calculateCartTotals(cartItems, exchangeRates) : { USD: 0, CUP: 0, EUR: 0 }, [cartItems, exchangeRates]);

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0), [cartItems]);

  const handleIncrement = (productId, currentQuantity, maxStock) => {
    if (currentQuantity < maxStock) updateQuantity(productId, currentQuantity + 1);
  };
  const handleDecrement = (productId, currentQuantity) => {
    if (currentQuantity > 1) updateQuantity(productId, currentQuantity - 1);
  };
  const handleQuantityChange = (productId, value, maxStock) => {
    const newQ = parseInt(value) || 0;
    if (newQ >= 0 && newQ <= maxStock) updateQuantity(productId, newQ);
    else if (newQ > maxStock) updateQuantity(productId, maxStock);
  };
  const handleSendWhatsApp = () => {
    const message = generateWhatsAppCartMessage(cartItems, totals);
    const whatsappUrl = `https://wa.me/${CONTACT_INFO.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="container-page py-6">
        <h1 className="section-title mb-4">Tu carrito</h1>
        {cartItems.length === 0 ? (
          <div className="card p-6">
            <p className="mb-4">Tu carrito está vacío.</p>
            <Link href="/" className="btn-primary inline-block">Seguir comprando</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-700">Productos ({cartItems.length})</h2>
                <button onClick={clearCart} className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors">Limpiar todo</button>
              </div>

              {cartItems.map(({ product, quantity }) => (
                <div key={product.id} className="card p-4 hover:shadow-lg transition-all duration-200">
                  <div className="flex gap-3 items-start">
                    {product.image_url && (
                      <img src={product.image_url} alt={product.name} className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base mb-1">{product.name}</h3>
                          <p className="text-lg font-bold text-blue-600">{formatCurrency(product.price, product.currency)}</p>
                        </div>
                        <button onClick={() => removeFromCart(product.id)} className="btn-icon bg-red-50 hover:bg-red-100 text-red-600 flex-shrink-0 w-8 h-8" title="Eliminar">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">Cantidad:</span>
                        <div className="flex flex-col items-end space-y-1">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button onClick={() => handleDecrement(product.id, quantity)} disabled={quantity <= 1} className={`px-2 py-1 transition-colors rounded-l-lg ${quantity <= 1 ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`} title="Disminuir">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <input type="number" min="1" max={product.stock || 999} value={quantity} onChange={(e) => handleQuantityChange(product.id, e.target.value, product.stock || 999)} className="w-12 text-center py-1 border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                            <button onClick={() => handleIncrement(product.id, quantity, product.stock || 999)} disabled={quantity >= (product.stock || 999)} className={`px-2 py-1 transition-colors rounded-r-lg ${quantity >= (product.stock || 999) ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}`} title="Aumentar">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                          {product.stock && (
                            <span className={`text-xs ${quantity >= product.stock ? 'text-orange-600 font-semibold' : 'text-gray-500'}`}>
                              {quantity >= product.stock ? '¡Límite alcanzado!' : `${product.stock} disponibles`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Artículos:</span><span className="font-semibold text-gray-900">{totalItems}</span></div>
                  <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Productos únicos:</span><span className="font-semibold text-gray-900">{cartItems.length}</span></div>
                </div>
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Totales por moneda</h3>
                  {loadingRates ? (
                    <div className="flex items-center justify-center py-4"><div className="spinner"></div><span className="ml-2 text-sm text-gray-500">Cargando tasas...</span></div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2"><div className="flex items-center space-x-2"><span className="text-xl">🇺🇸</span><span className="text-sm font-medium text-gray-700">USD</span></div><span className="text-lg font-bold text-blue-600">{formatCurrency(totals.USD, 'USD')}</span></div>
                      <div className="flex justify-between items-center mb-2"><div className="flex items-center space-x-2"><span className="text-xl">🇨🇺</span><span className="text-sm font-medium text-gray-700">CUP</span></div><span className="text-lg font-bold text-blue-600">{formatCurrency(totals.CUP, 'CUP')}</span></div>
                      <div className="flex justify-between items-center"><div className="flex items-center space-x-2"><span className="text-xl">🇪🇺</span><span className="text-sm font-medium text-gray-700">EUR</span></div><span className="text-lg font-bold text-blue-600">{formatCurrency(totals.EUR, 'EUR')}</span></div>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <button onClick={handleSendWhatsApp} className="btn-secondary w-full"><span className="flex items-center justify-center space-x-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884"/></svg><span>Enviar pedido</span></span></button>
                  <button onClick={clearCart} className="btn-ghost w-full"><span className="flex items-center justify-center space-x-2"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg><span>Vaciar carrito</span></span></button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200"><div className="flex items-start space-x-2 text-xs text-gray-600"><svg className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg><p>Tu pedido será enviado por WhatsApp. Coordinaremos el pago y entrega.</p></div></div>
              </div>
              <div className="mt-4 card bg-green-50 p-4 border-green-200"><div className="flex items-start space-x-3"><svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884"/></svg><div><h3 className="text-sm font-semibold text-green-900 mb-1">¿Tienes dudas?</h3><p className="text-xs text-green-800">Estamos aquí para ayudarte. Contáctanos antes de hacer tu pedido.</p></div></div></div>
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}
