"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from './cart/CartProvider';
import { CONTACT_INFO, SHARE_MESSAGES, BUSINESS_INFO, URLS, SOCIAL_SHARE_URLS, NOTIFICATIONS } from '../constants/appConstants';
import { LoadingSpinner } from './LoadingComponents';

export default function ProductCard({ product, onAddToCart }) {
  const router = useRouter();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const { addToCart } = useCart();

  // Reset loading state cuando el componente se desmonta
  useEffect(() => {
    return () => {
      setIsNavigating(false);
    };
  }, []);

  const originalPrice = product.original_price ? parseFloat(product.original_price) : parseFloat(product.price);
  const finalPrice = parseFloat(product.price);
  const discountPercentage = product.discount_percentage || 0;
  const hasDiscount = product.original_price && discountPercentage > 0;
  const savings = hasDiscount ? originalPrice - finalPrice : 0;

  const getProductUrl = () => `${URLS.WEBSITE}/product/${product.id}`;

  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const productUrl = getProductUrl();
    
    let shareText = '';
    if (hasDiscount) {
      shareText = `🔥 ¡OFERTA IMPERDIBLE en ${BUSINESS_INFO.NAME}! 🔥\n\n` +
                  `📱 *${product.name}*\n` +
                  `💥 ${discountPercentage}% DE DESCUENTO\n` +
                  `💰 Antes: ${originalPrice} ${product.currency}\n` +
                  `💲 Ahora: ${finalPrice} ${product.currency}\n` +
                  `🎉 ¡Ahorras ${savings.toFixed(2)} ${product.currency}!\n\n` +
                  `¡No te lo pierdas! Ver más detalles:\n${productUrl}`;
    } else {
      shareText = `¡Mira este producto en ${BUSINESS_INFO.NAME}! 🛒\n\n📱 *${product.name}*\n💰 ${product.price} ${product.currency}\n\n${productUrl}`;
    }
    
    const whatsappUrl = SOCIAL_SHARE_URLS.WHATSAPP(shareText);
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  };
  const handleShareFacebook = (e) => {
    e.stopPropagation();
    const productUrl = getProductUrl();
    const facebookUrl = SOCIAL_SHARE_URLS.FACEBOOK(productUrl);
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };
  
  const handleShareTwitter = (e) => {
    e.stopPropagation();
    const productUrl = getProductUrl();
    const text = SHARE_MESSAGES.SOCIAL_SHARE_TEMPLATE(product);
    const twitterUrl = SOCIAL_SHARE_URLS.TWITTER(text, productUrl);
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };
  const handleCopyLink = (e) => {
    e.stopPropagation();
    const productUrl = getProductUrl();
    navigator.clipboard.writeText(productUrl).then(() => alert(NOTIFICATIONS.LINK_COPIED));
    setShowShareMenu(false);
  };
  const handleWhatsApp = () => {
    const message = SHARE_MESSAGES.WHATSAPP_TEMPLATE(product);
    const whatsappUrl = `https://wa.me/${CONTACT_INFO.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  const handleNavigate = () => {
    setIsNavigating(true);
    
    // Timeout de seguridad para resetear el loading si algo sale mal
    const timeoutId = setTimeout(() => {
      setIsNavigating(false);
    }, 5000);
    
    try {
      router.push(`/product/${product.id}`);
    } catch (error) {
      console.error('Error navigating to product:', error);
      setIsNavigating(false);
      clearTimeout(timeoutId);
    }
  };

  const outOfStock = Number(product?.stock) === 0;
  const isOnSale = Boolean(product?.is_on_sale) || (product?.original_price && (product?.discount_percentage || 0) > 0);
  const isNew = Boolean(product?.is_new_in_box);

  return (
  <div className="card flex flex-col h-full cursor-pointer relative p-0" onClick={handleNavigate}>
      {/* Loading overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl border border-gray-200 shadow-lg">
          <div className="flex flex-col items-center space-y-3 p-6 bg-white rounded-lg shadow-sm">
            <LoadingSpinner size="medium" showText={false} />
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium">Cargando detalles</p>
              <p className="text-xs text-gray-500">Por favor espera...</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute top-2 right-2 z-10">
        <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(!showShareMenu); }} className="btn-icon bg-white/90 hover:bg-white shadow-md" title="Compartir producto">
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>

      {showShareMenu && (
        <div className="fixed inset-0 z-50" onClick={(e) => e.stopPropagation()}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareMenu(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center pt-3 pb-4 border-b border-gray-200">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
              <h3 className="text-lg font-bold text-gray-900">Compartir producto</h3>
              <p className="text-sm text-gray-500 mt-1 px-4 text-center truncate max-w-full">{product.name}</p>
            </div>
            <div className="p-4 pb-safe">
              <button onClick={handleShareWhatsApp} className="w-full px-5 py-4 text-left hover:bg-green-50 flex items-center space-x-4 rounded-xl">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 448 512" className="w-6 h-6 text-green-600 fill-current"><path d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6zm97.2-131.8c-5.3-2.6-31.4-15.4-36.2-17.2-4.8-1.7-8.3-2.6-11.8 2.6-3.5 5.3-13.6 17.2-16.7 20.7-3.1 3.5-6.2 4-11.5 1.3-31.2-15.6-51.5-27.9-72.2-63.1-5.5-9.5 5.5-8.8 15.6-29.2 1.7-3.5.9-6.6-.4-9.2-1.3-2.6-11.8-28.5-16.2-39-4.3-10.3-8.7-8.9-11.8-9.1-3-.2-6.6-.2-10.1-.2-3.5 0-9.2 1.3-14 6.6-4.8 5.3-18.4 18-18.4 43.9 0 25.9 18.9 51 21.6 54.6 2.6 3.5 37.2 56.7 90.1 79.4 33.5 14.4 46.6 15.6 63.3 13.1 10.2-1.5 31.4-12.8 35.8-25.2 4.4-12.4 4.4-23 3.1-25.3-1.3-2.3-4.9-3.7-10.2-6.3z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">WhatsApp</p>
                  <p className="text-sm text-gray-500 truncate">Compartir por WhatsApp</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={handleShareFacebook} className="w-full px-5 py-4 text-left hover:bg-blue-50 flex items-center space-x-4 rounded-xl mt-2">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 320 512" className="w-6 h-6 text-blue-600 fill-current"><path d="M279.14 288l14.22-92.66h-88.91V127.53c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.09 44.38-121.09 124.72v70.62H22.89V288h81.38v224h100.2V288z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">Facebook</p>
                  <p className="text-sm text-gray-500 truncate">Publicar en Facebook</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={handleShareTwitter} className="w-full px-5 py-4 text-left hover:bg-sky-50 flex items-center space-x-4 rounded-xl mt-2">
                <div className="flex-shrink-0 w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center">
                  <svg viewBox="0 0 512 512" className="w-6 h-6 text-sky-600 fill-current"><path d="M389.2 48h70.6L305.6 224.2 480 464H343.6L233.4 318.6 106.5 464H35.8L200.7 275.5 32 48h139l99.2 130.4L389.2 48zM365.4 421.8h39.1L151.1 88h-42L365.4 421.8z"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base">X (Twitter)</p>
                  <p className="text-sm text-gray-500 truncate">Tuitear este producto</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={handleCopyLink} className="w-full px-5 py-4 text-left hover:bg-gray-50 flex items-center space-x-4 rounded-xl border-t border-gray-100 mt-2 pt-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <span className="text-gray-600 text-xl">🔗</span>
                </div>
                <div className="flex-1 min-w-0">s
                  <p className="font-semibold text-gray-900 text-base">Copiar enlace</p>
                  <p className="text-sm text-gray-500 truncate">Copiar al portapapeles</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button onClick={(e) => { e.stopPropagation(); setShowShareMenu(false); }} className="w-full mt-4 px-5 py-4 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {product.image_url && (
        <div className={`relative overflow-hidden bg-gray-50`}>
          {outOfStock ? (
            <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">Agotado</span>
          ) : (
            <>
              {isOnSale && (
                <span className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm">🔥 Oferta{discountPercentage ? ` -${discountPercentage}%` : ''}</span>
              )}
              {isNew && (
                <span className={`absolute ${isOnSale ? 'top-8 sm:top-10' : 'top-2'} left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] sm:text-xs font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-sm`}>✨ Nuevo</span>
              )}
            </>
          )}
          <img src={product.image_url} alt={product.name} className="w-full h-40 sm:h-44 md:h-48 object-cover hover:scale-105 transition-transform duration-200" />
        </div>
      )}

      <div className="p-4 flex flex-col flex-1">
        {product.is_featured && (
          <div className="mb-1 text-yellow-500 flex items-center gap-1 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.034a1 1 0 00-1.175 0l-2.802 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span className="font-medium">Destacado</span>
          </div>
        )}
        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
        <div className="mt-2 flex items-center space-x-2">
          <span className="text-xl font-bold text-gray-900">{finalPrice} {product.currency}</span>
          {hasDiscount && (
            <>
              <span className="text-sm line-through text-gray-400">{originalPrice} {product.currency}</span>
              <span className="text-sm font-semibold text-green-600">-{discountPercentage}%</span>
            </>
          )}
        </div>
        {hasDiscount && (
          <div className="text-xs text-green-700 mt-1">Ahorra {savings.toFixed(2)} {product.currency}</div>
        )}
        <div className="mt-auto pt-3">
          {outOfStock ? (
            <div className="w-full h-10 flex items-center justify-center bg-red-100 text-red-700 font-semibold rounded-lg">Agotado</div>
          ) : (
            <div className="flex gap-2">
              <button
            className={`flex-1 btn-primary h-10 flex items-center justify-center gap-2 ${outOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={outOfStock}
            onClick={(e) => { e.stopPropagation(); if (outOfStock) return; (onAddToCart ? onAddToCart(product) : addToCart(product, 1)); }}
            title={outOfStock ? 'Agotado' : 'Añadir al carrito'}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            
          </button>
              <button
            className={`flex-1 h-10 flex items-center justify-center ${outOfStock ? 'opacity-50 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg px-3 transition-colors`}
            disabled={outOfStock}
            onClick={(e) => { e.stopPropagation(); if (outOfStock) return; handleWhatsApp(); }}
            title={outOfStock ? 'Agotado' : 'Consultar por WhatsApp'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current">
              <path d="M380.9 97.1C339 55.1 283.2 32 224.9 32c-116.1 0-210 93.9-210 210 0 37 9.7 73.1 28.1 105L0 480l137.9-42.7c30.8 16.8 65.6 25.6 101.1 25.6h.1c116.1 0 210-93.9 210-210 .1-58.3-22.9-114.1-64.2-156.8zM224.9 438.7h-.1c-32.2 0-63.7-8.6-91.2-24.9l-6.5-3.9-81.8 25.3 26.1-79.7-4.1-6.6c-17.4-28.1-26.6-60.6-26.6-93.8 0-97.4 79.2-176.6 176.6-176.6 47.1 0 91.3 18.3 124.6 51.6 33.3 33.4 51.6 77.6 51.5 124.7 0 97.4-79.2 176.6-176.5 176.6zm97.2-131.8c-5.3-2.6-31.4-15.4-36.2-17.2-4.8-1.7-8.3-2.6-11.8 2.6-3.5 5.3-13.6 17.2-16.7 20.7-3.1 3.5-6.2 4-11.5 1.3-31.2-15.6-51.5-27.9-72.2-63.1-5.5-9.5 5.5-8.8 15.6-29.2 1.7-3.5.9-6.6-.4-9.2-1.3-2.6-11.8-28.5-16.2-39-4.3-10.3-8.7-8.9-11.8-9.1-3-.2-6.6-.2-10.1-.2-3.5 0-9.2 1.3-14 6.6-4.8 5.3-18.4 18-18.4 43.9 0 25.9 18.9 51 21.6 54.6 2.6 3.5 37.2 56.7 90.1 79.4 33.5 14.4 46.6 15.6 63.3 13.1 10.2-1.5 31.4-12.8 35.8-25.2 4.4-12.4 4.4-23 3.1-25.3-1.3-2.3-4.9-3.7-10.2-6.3z"/>
            </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
