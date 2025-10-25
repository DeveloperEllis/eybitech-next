"use client";
import { useEffect, useState } from 'react';
import { useCart } from './cart/CartProvider';
import { useRouter } from 'next/navigation';
import CountdownTimer from './CountdownTimer';
import { CONTACT_INFO, SHARE_MESSAGES, BUSINESS_INFO, URLS, SOCIAL_SHARE_URLS, NOTIFICATIONS, getResolvedAppConstants } from '../constants/appConstants';

export default function ProductInfoClient({ product }) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const router = useRouter();
  const [whats, setWhats] = useState(CONTACT_INFO.WHATSAPP_NUMBER);
  const [storeName, setStoreName] = useState(BUSINESS_INFO.NAME);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      try {
        const merged = await getResolvedAppConstants((defaults, settings) => ({
          whatsapp: settings.whatsapp || defaults.CONTACT_INFO.WHATSAPP_NUMBER,
          name: settings.store_name || defaults.BUSINESS_INFO.NAME,
        }));
        setWhats(merged.whatsapp);
        setStoreName(merged.name);
      } catch {}
    })();
  }, []);

  const getProductUrl = () => `${URLS.WEBSITE}/product/${product.id}`;
  
  const handleShareWhatsApp = () => {
    const productUrl = getProductUrl();
    
    // Calcular información de ofertas
    const hasOffer = product.original_price && product.discount_percentage > 0;
    const originalPrice = hasOffer ? parseFloat(product.original_price) : null;
    const currentPrice = parseFloat(product.price);
    const savings = hasOffer ? originalPrice - currentPrice : 0;
    
    let shareText = '';
    if (hasOffer) {
      shareText = `🔥 ¡OFERTA IMPERDIBLE en ${storeName}! 🔥\n\n` +
                  `📱 *${product.name}*\n` +
                  `💥 ${product.discount_percentage}% DE DESCUENTO\n` +
                  `💰 Antes: ${originalPrice} ${product.currency}\n` +
                  `💲 Ahora: ${currentPrice} ${product.currency}\n` +
                  `🎉 ¡Ahorras ${savings.toFixed(2)} ${product.currency}!\n\n` +
                  `¡No te lo pierdas! Ver más detalles:\n${productUrl}`;
   } else {
      shareText = `¡Mira este producto en ${BUSINESS_INFO.NAME}! 🛒\n\n📱 *${product.name}*\n💰 ${product.price} ${product.currency}\n\n${productUrl}`;
    }
    
    const whatsappUrl = SOCIAL_SHARE_URLS.WHATSAPP(shareText);
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };
  const handleShareFacebook = () => {
    const productUrl = getProductUrl();
    const facebookUrl = SOCIAL_SHARE_URLS.FACEBOOK(productUrl);
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };
  const handleShareTwitter = () => {
    const productUrl = getProductUrl();
    const text = SHARE_MESSAGES.SOCIAL_SHARE_TEMPLATE(product);
    const twitterUrl = SOCIAL_SHARE_URLS.TWITTER(text, productUrl);
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };
  const handleCopyLink = () => {
    const productUrl = getProductUrl();
    navigator.clipboard.writeText(productUrl).then(() => alert(NOTIFICATIONS.LINK_COPIED));
    setShowShareMenu(false);
  };
  const handleWhatsApp = () => {
    const message = SHARE_MESSAGES.WHATSAPP_TEMPLATE(product);
    const whatsappUrl = `https://wa.me/${(whats || CONTACT_INFO.WHATSAPP_NUMBER).replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const hasDiscount = product.original_price && product.discount_percentage > 0;
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const finalPrice = parseFloat(product.price);

  return (
    <div className="flex flex-col">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {product.is_on_sale && product.original_price && product.discount_percentage > 0 && (
          <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-black px-4 py-2 rounded-full shadow-lg animate-pulse">🔥 -{product.discount_percentage}%</span>
        )}
        {product.is_new_in_box && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-black px-4 py-2 rounded-full shadow-lg">📦 NUEVO</span>
        )}
        {product.is_featured && (
          <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-sm font-black px-4 py-2 rounded-full shadow-lg">⭐ DESTACADO</span>
        )}
      </div>

      <div className="mb-4">
        {hasDiscount ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl sm:text-4xl font-black text-green-600">{finalPrice.toFixed(2)}</span>
              <span className="text-xl text-green-600 font-bold">{product.currency}</span>
              <span className="bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full animate-pulse">-{product.discount_percentage}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg text-gray-500 line-through decoration-red-500 decoration-2">{originalPrice?.toFixed(2)} {product.currency}</span>
              <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">Ahorra {(originalPrice - finalPrice).toFixed(2)} {product.currency}</span>
            </div>
          </div>
        ) : (
          <div>
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">{product.price}</span>
            <span className="text-lg text-gray-500 ml-2">{product.currency}</span>
          </div>
        )}
      </div>

      {product.is_on_sale && product.sale_end_date && (
        <div className="mb-4">
          <CountdownTimer endDate={product.sale_end_date} onExpire={() => window.location.reload()} />
        </div>
      )}

      <div className="mb-3 space-y-2">
        {product.stock > 0 ? (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${product.stock > 10 ? 'bg-green-100 text-green-700' : product.stock > 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'}`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              <span className="text-sm font-semibold">{product.stock > 10 ? 'En stock' : product.stock > 5 ? 'Pocas unidades' : '¡Últimas unidades!'}</span>
            </div>
            <span className="text-sm text-gray-600">({product.stock} {product.stock === 1 ? 'unidad disponible' : 'unidades disponibles'})</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg inline-flex">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <span className="text-sm font-semibold">Agotado</span>
          </div>
        )}
      </div>

      {product.views_count > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          <span><span className="font-semibold">{product.views_count}</span> {product.views_count === 1 ? 'persona ha visto' : 'personas han visto'} este producto</span>
        </div>
      )}

      {product.review_url && (
        <div className="mb-4">
          <a href={product.review_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
            <span>Ver demostración del producto</span>
          </a>
        </div>
      )}

      {product.description && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Descripción</h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
      )}

      {product.external_link && (
        <div className="mb-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3 mb-3">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">🌎 ¡También disponible internacionalmente!</h3>
              <p className="text-xs text-gray-700 mb-3">Compra este producto desde {product.external_link_label || 'tiendas internacionales'} con envío a cualquier parte del mundo.</p>
              <a href={product.external_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                <span>Comprar en {product.external_link_label || 'tienda internacional'}</span>
              </a>
              <p className="text-xs text-gray-600 mt-2 text-center">🔒 Compra segura con protección al comprador</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2 mt-auto">
        <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${product.stock === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'}`}>
          <span>{product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}</span>
        </button>
        <button onClick={handleWhatsApp} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
          <span>WhatsApp</span>
        </button>
      </div>

      <div className="mt-4">
        <button onClick={() => setShowShareMenu(true)} className="btn-outline w-full">Compartir</button>
      </div>

      {showShareMenu && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareMenu(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl">
            <div className="flex flex-col items-center pt-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900">Compartir producto</h3>
              <p className="text-sm text-gray-500 mt-1 px-4 text-center truncate max-w-full">{product.name}</p>
            </div>
            <div className="p-4 pb-safe">
              <button onClick={handleShareWhatsApp} className="w-full px-5 py-4 text-left hover:bg-green-50 flex items-center space-x-4 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center"><svg viewBox="0 0 448 512" className="w-6 h-6 text-green-600 fill-current"><path d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6zm97.2-131.8c-5.3-2.6-31.4-15.4-36.2-17.2-4.8-1.7-8.3-2.6-11.8 2.6-3.5 5.3-13.6 17.2-16.7 20.7-3.1 3.5-6.2 4-11.5 1.3-31.2-15.6-51.5-27.9-72.2-63.1-5.5-9.5 5.5-8.8 15.6-29.2 1.7-3.5.9-6.6-.4-9.2-1.3-2.6-11.8-28.5-16.2-39-4.3-10.3-8.7-8.9-11.8-9.1-3-.2-6.6-.2-10.1-.2-3.5 0-9.2 1.3-14 6.6-4.8 5.3-18.4 18-18.4 43.9 0 25.9 18.9 51 21.6 54.6 2.6 3.5 37.2 56.7 90.1 79.4 33.5 14.4 46.6 15.6 63.3 13.1 10.2-1.5 31.4-12.8 35.8-25.2 4.4-12.4 4.4-23 3.1-25.3-1.3-2.3-4.9-3.7-10.2-6.3z"/></svg></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">WhatsApp</p>
                  <p className="text-sm text-gray-500 truncate">Compartir por WhatsApp</p>
                </div>
              </button>
              <button onClick={handleShareFacebook} className="w-full px-5 py-4 text-left hover:bg-blue-50 flex items-center space-x-4 rounded-xl mt-2">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center"><svg viewBox="0 0 320 512" className="w-6 h-6 text-blue-600 fill-current"><path d="M279.14 288l14.22-92.66h-88.91V127.53c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.09 44.38-121.09 124.72v70.62H22.89V288h81.38v224h100.2V288z"/></svg></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">Facebook</p>
                  <p className="text-sm text-gray-500 truncate">Publicar en Facebook</p>
                </div>
              </button>
              <button onClick={handleShareTwitter} className="w-full px-5 py-4 text-left hover:bg-sky-50 flex items-center space-x-4 rounded-xl mt-2">
                <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center"><svg viewBox="0 0 512 512" className="w-6 h-6 text-sky-600 fill-current"><path d="M389.2 48h70.6L305.6 224.2 480 464H343.6L233.4 318.6 106.5 464H35.8L200.7 275.5 32 48h139l99.2 130.4L389.2 48zM365.4 421.8h39.1L151.1 88h-42L365.4 421.8z"/></svg></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">X (Twitter)</p>
                  <p className="text-sm text-gray-500 truncate">Tuitear este producto</p>
                </div>
              </button>
              <button onClick={handleCopyLink} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center space-x-4 rounded-xl border-t border-gray-100 mt-2 pt-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center"><span className="text-gray-600 text-xl">🔗</span></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">Copiar enlace</p>
                  <p className="text-sm text-gray-500 truncate">Copiar al portapapeles</p>
                </div>
              </button>
              <button onClick={() => setShowShareMenu(false)} className="w-full mt-4 px-5 py-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
