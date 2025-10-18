// Información de contacto y comunicación
export const CONTACT_INFO = {
  WHATSAPP_NUMBER: '+5358408409',
  PHONE_NUMBER: '+5358408409',
  EMAIL: 'eybtech@gmail.com',
  LOCATION: 'Trinidad, Cuba',
  BUSINESS_HOURS: '8:00 AM - 8:00 PM (Lun-Sáb)',
};

// URLs y enlaces
function createValidURL(url) {
  if (!url) return 'http://localhost:3000';
  
  // Si ya es una URL válida completa
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url); // Validar que es una URL válida
      return url;
    } catch {
      return 'http://localhost:3000';
    }
  }
  
  // Si es solo un dominio, agregar https://
  try {
    new URL(`https://${url}`); // Validar que es válida
    return `https://${url}`;
  } catch {
    return 'http://localhost:3000';
  }
}

const APP_URL = createValidURL(process.env.NEXT_PUBLIC_APP_URL);
export const URLS = {
  WEBSITE: APP_URL.replace(/\/$/, ''),
  FACEBOOK_PAGE: 'https://facebook.com/eybitech',
  TWITTER_HANDLE: '@eybitech',
  INSTAGRAM_HANDLE: '@eybitech',
};

// Información de la empresa
export const BUSINESS_INFO = {
  NAME: 'Eybitech',
  SLOGAN: 'Tu tienda de tecnología y electrónica en Cuba',
  DESCRIPTION: 'Venta de productos electrónica, tecnológicos y accesorios de calidad',
  FOUNDATION_YEAR: '2025',
};

// Configuración de la tienda
export const STORE_CONFIG = {
  DEFAULT_CURRENCY: 'USD',
  SHIPPING_METHODS: ['Recogida en tienda', 'Envío a domicilio'],
  PAYMENT_METHODS: ['Efectivo', 'Transferencia', 'Tarjeta'],
  MIN_ORDER_AMOUNT: 10,
  DEFAULT_TAX_RATE: 0.12,
};

// Mensajes predefinidos para compartir
export const SHARE_MESSAGES = {
  WHATSAPP_TEMPLATE: (product) => {
    const hasOffer = product.original_price && product.discount_percentage > 0;
    const originalPrice = hasOffer ? parseFloat(product.original_price) : null;
    const currentPrice = parseFloat(product.price);
    const savings = hasOffer ? originalPrice - currentPrice : 0;
    
    if (hasOffer) {
      return `🔥 ¡OFERTA ESPECIAL en ${BUSINESS_INFO.NAME}! 🔥

🔖 ${product.id}
📱 *${product.name}*
💥 ${product.discount_percentage}% DE DESCUENTO
💰 Antes: ${originalPrice} ${product.currency}
💲 Ahora: ${currentPrice} ${product.currency}
🎉 ¡Ahorras ${savings.toFixed(2)} ${product.currency}!

¡No te lo pierdas! 🛒`;
    } else {
      return `¡Hola! 👋 Me interesa este producto de ${BUSINESS_INFO.NAME}: 

🔖  ${product.id}
📱 *${product.name}*
💰 Precio: ${product.price} ${product.currency}
          `;
    }
  },

  SOCIAL_SHARE_TEMPLATE: (product) => {
    const hasOffer = product.original_price && product.discount_percentage > 0;
    if (hasOffer) {
      const savings = parseFloat(product.original_price) - parseFloat(product.price);
      return `🔥 ¡${product.discount_percentage}% OFF! ${product.name} - Ahora ${product.price} ${product.currency} (Ahorra ${savings.toFixed(2)} ${product.currency}) en ${BUSINESS_INFO.NAME}`;
    } else {
      return `¡Mira este producto en ${BUSINESS_INFO.NAME}! ${product.name} - ${product.price} ${product.currency}`;
    }
  },
};

// Temas y colores de la marca
export const BRAND_THEME = {
  PRIMARY_COLOR: '#2563eb', // blue-600
  SECONDARY_COLOR: '#22c55e', // green-500
  ACCENT_COLOR: '#f59e0b', // amber-500
  TEXT_COLOR: '#111827', // gray-900
  BACKGROUND_COLOR: '#f9fafb', // gray-50
};

// Configuración técnica
export const TECHNICAL_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  CACHE_DURATION: 24 * 60 * 60 * 1000,
  API_TIMEOUT: 10000,
  ITEMS_PER_PAGE: 12,
};

// Categorías de productos
export const PRODUCT_CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Accesorios',
  'Tablets',
  'Smartwatches',
  'Audio',
  'Gaming',
  'Almacenamiento',
];

// Estados de envío
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Mensajes de notificación
export const NOTIFICATIONS = {
  CART_ADDED: 'Producto agregado al carrito',
  CART_REMOVED: 'Producto eliminado del carrito',
  LINK_COPIED: '¡Enlace copiado al portapapeles!',
  ORDER_SUCCESS: '¡Pedido realizado con éxito!',
  ERROR_GENERAL: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
};

// URLs de redes sociales para compartir
export const SOCIAL_SHARE_URLS = {
  WHATSAPP: (text) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  FACEBOOK: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  TWITTER: (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
};

// Resolver: obtiene settings desde Supabase y combina con defaults.
// Acepta un callback opcional que recibe (defaults, settings) y debe devolver el shape que quieras consumir.
export async function getResolvedAppConstants(mapper) {
  // Import lazy to avoid cyclic deps on build tools
  const { getStoreSettings } = await import("../lib/settings/getStoreSettings.js");
  const settings = await getStoreSettings();

  const defaults = {
    CONTACT_INFO,
    URLS,
    BUSINESS_INFO,
    STORE_CONFIG,
    BRAND_THEME,
    TECHNICAL_CONFIG,
    PRODUCT_CATEGORIES,
    ORDER_STATUS,
    NOTIFICATIONS,
    SOCIAL_SHARE_URLS,
  };

  if (typeof mapper === 'function') {
    try {
      return mapper(defaults, settings);
    } catch {
      return { ...defaults, settings };
    }
  }
  return { ...defaults, settings };
}
