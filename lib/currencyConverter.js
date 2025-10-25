import { supabase } from './supabase/browserClient';

let exchangeRatesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const BASE_CURRENCY = 'CUP'; // La moneda pivote para todas las conversiones

// Tasas de reserva reestructuradas: Moneda -> Tasa a CUP
const FALLBACK_RATES = {
  // Estos valores simulan los datos de tu tabla: [Moneda] -> [CUP]
  USD: 250.00,
  EUR: 270.50,
  MLC: 24.00,
  GBP: 310.00,
  ZEL: 248.00, // Tasa de Zelle a CUP (valor de reserva)
  CLA: 245.00, // Tasa de Tarjeta Clásica a CUP (valor de reserva)
  CUP: 1.00, // Tasa de la base a sí misma
};

/**
 * Normaliza la tasa de conversión entre dos monedas (A a B) usando BASE_CURRENCY (CUP) como pivote.
 * Fórmula: Rate(A -> B) = [Rate(A -> CUP)] / [Rate(B -> CUP)]
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {object} ratesMap - El mapa de tasas normalizado (Moneda: Tasa_a_CUP)
 * @returns {number} La tasa de conversión.
 */
const getConversionRate = (fromCurrency, toCurrency, ratesMap) => {
  if (fromCurrency === toCurrency) return 1;

  const rateA_to_CUP = ratesMap[fromCurrency];
  const rateB_to_CUP = ratesMap[toCurrency];

  // Si no existe la tasa, la conversión es imposible
  if (!rateA_to_CUP || !rateB_to_CUP || rateA_to_CUP <= 0 || rateB_to_CUP <= 0) {
    console.warn(`Tasa faltante para conversión cruzada: ${fromCurrency} o ${toCurrency}.`);
    return 0; 
  }

  return rateA_to_CUP / rateB_to_CUP;
};

/**
 * Obtiene las tasas desde Supabase, las normaliza a un mapa (Moneda: Tasa_a_CUP) y usa caché.
 * La consulta se filtra para obtener solo las tasas que tienen 'CUP' como destino.
 */
export const fetchExchangeRates = async () => {
  try {
    const now = Date.now();
    if (exchangeRatesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return exchangeRatesCache;
    }

    // CRÍTICO: Filtramos para asegurarnos de que solo obtenemos tasas al CUP.
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency_from, currency_to, rate')
      .eq('currency_to', BASE_CURRENCY);

    if (error) {
      console.error('Error obteniendo tasas de cambio desde Supabase:', error);
      // Incluimos FALLBACK_RATES con ZEL y CLA
      return FALLBACK_RATES;
    }

    // NORMALIZACIÓN: Crear un mapa { "USD": 250.00, "EUR": 270.50, ... }
    const rates = {};
    data.forEach(item => {
      // Usamos currency_from como clave y rate como valor (tasa a CUP)
      rates[item.currency_from] = parseFloat(item.rate);
    });

    // Añadir la tasa base
    rates[BASE_CURRENCY] = 1.00; 

    exchangeRatesCache = rates;
    cacheTimestamp = now;
    return rates;
  } catch (err) {
    console.error('Error al consultar exchange_rates (usando fallback):', err);
    // Incluimos FALLBACK_RATES con ZEL y CLA
    return FALLBACK_RATES;
  }
};

/**
 * Convierte un monto entre cualquier par de divisas usando la lógica de pivote CUP.
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {object} rates - El mapa de tasas normalizado {Moneda: Tasa_a_CUP}.
 * @returns {number} El monto convertido.
 */
export const convertCurrency = (amount, fromCurrency, toCurrency, rates = null) => {
  const RATES = rates || FALLBACK_RATES;
  const rate = getConversionRate(fromCurrency, toCurrency, RATES);
  return amount * rate;
};

export const calculateCartTotals = (cartItems, rates = null) => {
  let totalUSD = 0;
  let totalCUP = 0;
  let totalEUR = 0;
  // Agregamos total para otra moneda popular para demostrar la extensibilidad
  let totalGBP = 0; 

  cartItems.forEach((item) => {
    const price = (item.product?.price ?? item.price) || 0;
    const qty = item.quantity || 1;
    const currency = item.product?.currency || item.currency || 'USD';
    const itemTotal = price * qty;
    
    // Las conversiones ahora usan la nueva lógica universal
    totalUSD += convertCurrency(itemTotal, currency, 'USD', rates);
    totalCUP += convertCurrency(itemTotal, currency, 'CUP', rates);
    totalEUR += convertCurrency(itemTotal, currency, 'EUR', rates);
    totalGBP += convertCurrency(itemTotal, currency, 'GBP', rates); // Cálculo para GBP
  });
  
  return { USD: totalUSD, CUP: totalCUP, EUR: totalEUR, GBP: totalGBP };
};

export const formatCurrency = (amount, currency) => {
  const symbols = { 
    USD: '$', 
    CUP: '₱', 
    EUR: '€', 
    GBP: '£', 
    MLC: 'MLC', 
    ZEL: 'ZEL', 
    CLA: 'CLA', 
    BRL: 'R$' 
  };
  const symbol = symbols[currency] || currency;
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
};

export const getCurrencySymbol = (currency) => {
  const symbols = { 
    USD: '$', 
    CUP: '₱', 
    EUR: '€', 
    GBP: '£', 
    MLC: 'MLC', 
    ZEL: 'ZEL', 
    CLA: 'CLA', 
    BRL: 'R$' 
  };
  return symbols[currency] || currency;
};


export const generateWhatsAppCartMessage = (cartItems, totals) => {
  let message = `🛒 *PEDIDO DESDE EYBITECH*\n\n`;
  message += `📅 Fecha: ${new Date().toLocaleDateString('es-ES')}\n`;
  message += `🕐 Hora: ${new Date().toLocaleTimeString('es-ES')}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  cartItems.forEach((item, index) => {
    const product = item.product || item; // support both shapes
    const quantity = item.quantity || 1;
    const subtotal = (product.price || 0) * quantity;
    message += `*${index + 1}. ${product.name}*\n`;
    message += `   📦 ID: ${product.id}\n`;
    if (product.description) {
      const shortDesc = product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description;
      message += `   📝 ${shortDesc}\n`;
    }
    message += `   💰 Precio unitario: ${formatCurrency(product.price, product.currency)}\n`;
    message += `   🔢 Cantidad: ${quantity}\n`;
    message += `   💵 Subtotal: ${formatCurrency(subtotal, product.currency)}\n\n`;
  });
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `💳 *TOTALES*\n\n`;
  message += `🇺🇸 USD: ${formatCurrency(totals.USD, 'USD')}\n`;
  message += `🇨🇺 CUP: ${formatCurrency(totals.CUP, 'CUP')}\n`;
  message += `🇪🇺 EUR: ${formatCurrency(totals.EUR, 'EUR')}\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📱 *¿Cómo deseas proceder con el pago?*\n\n`;
  message += `¡Gracias por tu compra! 🎉`;
  return message;
};
