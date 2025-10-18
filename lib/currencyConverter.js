import { supabase } from './supabase/browserClient';

let exchangeRatesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const FALLBACK_RATES = {
  USD_TO_CUP: 120,
  USD_TO_EUR: 0.92,
  EUR_TO_USD: 1.09,
  EUR_TO_CUP: 130,
  CUP_TO_USD: 0.0083,
  CUP_TO_EUR: 0.0077,
};

export const fetchExchangeRates = async () => {
  try {
    const now = Date.now();
    if (exchangeRatesCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION)) {
      return exchangeRatesCache;
    }

    const { data, error } = await supabase
      .from('exchange_rates')
      .select('currency_from, currency_to, rate');

    if (error) {
      console.error('Error obteniendo tasas de cambio:', error);
      return FALLBACK_RATES;
    }

    const rates = {};
    data.forEach(item => {
      const key = `${item.currency_from}_TO_${item.currency_to}`;
      rates[key] = parseFloat(item.rate);
    });

    exchangeRatesCache = rates;
    cacheTimestamp = now;
    return rates;
  } catch (err) {
    console.error('Error al consultar exchange_rates:', err);
    return FALLBACK_RATES;
  }
};

export const convertCurrency = (amount, fromCurrency, toCurrency, rates = null) => {
  if (fromCurrency === toCurrency) return amount;
  const RATES = rates || FALLBACK_RATES;
  let amountInUSD = amount;
  if (fromCurrency === 'CUP') amountInUSD = amount * RATES.CUP_TO_USD;
  else if (fromCurrency === 'EUR') amountInUSD = amount * RATES.EUR_TO_USD;
  if (toCurrency === 'USD') return amountInUSD;
  if (toCurrency === 'CUP') return amountInUSD * RATES.USD_TO_CUP;
  if (toCurrency === 'EUR') return amountInUSD * RATES.USD_TO_EUR;
  return amount;
};

export const calculateCartTotals = (cartItems, rates = null) => {
  let totalUSD = 0;
  let totalCUP = 0;
  let totalEUR = 0;
  cartItems.forEach((item) => {
    // Support two shapes: {product, quantity} or flat items from CartProvider
    const price = (item.product?.price ?? item.price) || 0;
    const qty = item.quantity || 1;
    const currency = item.product?.currency || item.currency || 'USD';
    const itemTotal = price * qty;
    totalUSD += convertCurrency(itemTotal, currency, 'USD', rates);
    totalCUP += convertCurrency(itemTotal, currency, 'CUP', rates);
    totalEUR += convertCurrency(itemTotal, currency, 'EUR', rates);
  });
  return { USD: totalUSD, CUP: totalCUP, EUR: totalEUR };
};

export const formatCurrency = (amount, currency) => {
  const symbols = { USD: '$', CUP: '₱', EUR: '€' };
  const symbol = symbols[currency] || currency;
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
};

export const getCurrencySymbol = (currency) => {
  const symbols = { USD: '$', CUP: '₱', EUR: '€' };
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
