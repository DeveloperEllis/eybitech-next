'use client';
import { useEffect, useMemo, useState } from "react";
// Mantenemos la importación de la lógica externa
import { fetchExchangeRates, convertCurrency, getCurrencySymbol } from "../../lib/currencyConverter";
import { SOCIAL_SHARE_URLS } from "../../constants/appConstants";

// --- METADATOS LOCALES (PARA LA INTERFAZ DE USUARIO) ---
// Definimos las monedas que queremos mostrar en la UI.
const ALL_DISPLAY_CURRENCIES = [
  "USD", "CUP", "EUR", "MLC", "GBP", "CAD", "MXN", "BRL", "ZEL", "CLA"
];
// Mapeo de códigos de moneda a emojis de bandera
const CURRENCY_FLAGS = {
    USD: "🇺🇸", // Dólar Estadounidense
    CUP: "🇨🇺", // Peso Cubano
    EUR: "🇪🇺", // Euro (Usamos la bandera de la UE)
    MLC: "💳", // Moneda Libremente Convertible (Usamos un emoji de tarjeta)
    GBP: "🇬🇧", // Libra Esterlina
    CAD: "🇨🇦", // Dólar Canadiense
    MXN: "🇲🇽", // Peso Mexicano
    BRL: "🇧🇷", // Real Brasileño
    ZEL: "🌱", // Placeholder para monedas no estándar/ficticias
    CLA: "✨", // Placeholder para monedas no estándar/ficticias
};

/**
 * Obtiene el emoji de la bandera para un código de moneda dado.
 * @param {string} code - Código de la moneda (ej: 'USD').
 * @returns {string} Emoji de la bandera o un placeholder.
 */
const getCurrencyFlag = (code) => CURRENCY_FLAGS[code.toUpperCase()] || "💰";

// --- FORMATO DE NÚMERO ---
// Función para formatear el valor a mostrar. Usamos Intl.NumberFormat para mejor UX.
const formatValue = (value, currency) => {
    const num = Number(value || 0);
    // Si la cantidad es muy grande o la conversión resulta en Infinity/NaN, mostramos un error
    if (isNaN(num) || !isFinite(num)) return "N/A";

    // Formatea usando el estilo de moneda del locale 'es-ES'
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

// Función auxiliar para obtener la tasa 1:1, utilizada en la lógica de compartir
const getRateValue = (from, to, rates) => {
    try {
        // Asume que convertCurrency puede manejar la conversión de 1 unidad.
        const rate = convertCurrency(1, from, to, rates);
        return (rate !== null && isFinite(rate) && rate > 0) ? rate : null;
    } catch (error) {
        // En caso de error de conversión o datos faltantes
        return null;
    }
}

// --------------------------------------------------------

export default function CalculatorPage() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      // Cargamos las tasas usando la función externa.
      const r = await fetchExchangeRates();
      if (mounted) {
        setRates(r);
        setLoading(false);
      }
    };
    load();
    // Mantenemos el intervalo de recarga de 5 minutos
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handleAmount = (raw) => {
    // Permite solo números, puntos y reemplaza comas por puntos.
    const sanitized = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    setAmount(sanitized);
  };

  const clearAll = () => { setAmount(""); };

  const results = useMemo(() => {
    const n = parseFloat(amount);
    if (!rates || isNaN(n) || n <= 0) return []; // No mostrar resultados si el monto es inválido o cero

    // Convertir a todas las demás monedas
    const targets = ALL_DISPLAY_CURRENCIES.filter((c) => c !== currency);

    return targets.map((t) => ({
      currency: t,
      // Usamos la función de conversión externa
      value: convertCurrency(n, currency, t, rates),
    }));
  }, [amount, currency, rates]);


  // La función getRateValue y las constantes CURRENCY_FLAGS, ALL_DISPLAY_CURRENCIES
// se asume que están en el contexto global del componente.

const handleShare = () => {
    if (!rates) return;
    const n = parseFloat(amount);

    let msg = "💱 **Resultados de Conversión**\n\n";

    // 1. Conversión Directa (si el monto es válido)
    if (!isNaN(n) && n > 0) {
        msg += `📈 *Monto Inicial: ${Number(n).toFixed(2)} ${currency} ${getCurrencyFlag(currency)}*\n`;

        // Incluir solo los resultados calculados
        results.forEach(r => {
            if (r.value !== null && !isNaN(r.value)) {
                msg += `   ➡️ ${r.currency} ${getCurrencyFlag(r.currency)}: ${Number(r.value).toFixed(2)}\n`;
            }
        });
        msg += "\n";
    }

    // 2. Tasas 1:1 (Todas vs. CUP y referencias)
    msg += "📊 **Tasas de Referencia (1 unidad)**\n";

    // a) Tasa de la moneda seleccionada a CUP (si no es CUP)
    if (currency !== 'CUP') {
         const rateToCup = getRateValue(currency, 'CUP', rates);
         if (rateToCup !== null) {
            msg += `1 ${currency} ${getCurrencyFlag(currency)} = ${rateToCup.toFixed(2)} CUP ${getCurrencyFlag('CUP')}\n`;
         }
    }

    // b) Tasa de USD, EUR, MLC, y GBP a CUP (como referencia estándar), 
    //    evitando duplicar si la moneda base ya fue listada arriba.
    const referenceCurrencies = ["USD", "EUR", "MLC", "GBP"];

    referenceCurrencies.forEach(refCode => {
        // Solo incluimos la referencia si NO es la moneda base (currency) y NO es CUP.
        if (refCode !== currency && refCode !== 'CUP') {
             // Asumimos que las tasas clave están disponibles como 'XXX_TO_CUP' o 'XXX'
             const key = `${refCode}_TO_CUP`;
             const rateToCup = Number(rates?.[key] ?? rates?.[refCode] ?? 0); 

             if (rateToCup > 0) {
                 msg += `1 ${refCode} ${getCurrencyFlag(refCode)} = ${rateToCup.toFixed(2)} CUP ${getCurrencyFlag('CUP')}\n`;
             } else {
                 // Si no está en el formato clave, intentamos calcular 1:1
                 const calculatedRate = getRateValue(refCode, 'CUP', rates);
                 if (calculatedRate !== null) {
                     msg += `1 ${refCode} ${getCurrencyFlag(refCode)} = ${calculatedRate.toFixed(2)} CUP ${getCurrencyFlag('CUP')}\n`;
                 }
             }
        }
    });

    // c) Incluir las tasas 1:1 de la moneda seleccionada a OTRAS monedas (las no-referencias)
    const primaryReferences = ["CUP", "USD", "EUR", "MLC", "GBP"];
    const otherTargets = ALL_DISPLAY_CURRENCIES.filter(c => 
        c !== currency && !primaryReferences.includes(c)
    );

    // 3. Atribución Final
    msg += "\n---\n";
    msg += "Sacado de: https://eybitech.com/calculadora";

    // Codificar el mensaje para la URL de WhatsApp
    const url = SOCIAL_SHARE_URLS.WHATSAPP(msg);
    window.open(url, '_blank');
};

  const availableCurrencies = ALL_DISPLAY_CURRENCIES;

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Conversor Monedas          </h1>
          <p className="text-gray-600 mt-2">
            Calcula la tasa de cambio en tiempo real para múltiples monedas.
          </p>
        </div>

        {/* --- TARJETA PRINCIPAL DE CALCULADORA --- */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 md:p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-5 border-b pb-4">
            <span className={`text-sm font-medium ${loading ? 'text-orange-500' : 'text-green-600'} flex items-center`}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Cargando...
                </>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Tasas actualizadas
                </span>
              )}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={handleShare} disabled={!rates || parseFloat(amount) <= 0} className="px-3 py-1.5 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition duration-200 shadow-md disabled:bg-indigo-300">
                Compartir
              </button>
              <button onClick={clearAll} className="p-2 text-gray-500 hover:text-red-500 transition duration-150 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Input de Monto y Selector de Moneda */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Monto a Convertir</label>
            <div className="flex bg-gray-50 rounded-xl overflow-hidden border border-gray-300">
              {/* Selector de Moneda (Más grande y visible) */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-4 py-3 bg-gray-200 text-gray-800 text-base font-semibold outline-none appearance-none border-r border-gray-300 cursor-pointer transition duration-150 hover:bg-gray-300"
              >
                {availableCurrencies.map((code) => (
                  <option key={code} value={code}>
                    {getCurrencyFlag(code)} {code}
                  </option>
                ))}
              </select>

              {/* Input */}
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmount(e.target.value)}
                className="flex-1 min-w-0 px-4 py-3 text-2xl font-mono text-gray-900 bg-gray-50 outline-none focus:ring-0 placeholder-gray-400"
              />
            </div>
          </div>

          {/* --- Resultados de Conversión --- */}
          <h2 className="text-xl font-bold text-gray-800 mb-4 pt-2 border-t">Resultados en otras monedas</h2>

          <div className="grid grid-cols-1 gap-3">
            {loading && (
              <div className="text-center text-gray-500 p-4 border border-dashed rounded-xl">Buscando las mejores tasas...</div>
            )}
            {!loading && results.length === 0 && parseFloat(amount) > 0 && (
              <div className="text-center text-red-500 bg-red-50 p-3 border border-red-200 rounded-xl">Error: No se pudieron calcular las tasas.</div>
            )}
            {!loading && results.length === 0 && (parseFloat(amount) <= 0 || amount === "") && (
               <div className="text-center text-gray-500 p-4 border border-dashed rounded-xl">Ingresa un monto para ver todas las conversiones disponibles.</div>
            )}

            {results.map((r) => (
              <div key={r.currency} className="bg-white border border-gray-100 rounded-xl p-3 md:p-4 flex items-center justify-between transition duration-200 hover:shadow-lg hover:border-indigo-300">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getCurrencyFlag(r.currency)}</span>
                  <div>
                    <div className="text-xs font-semibold text-gray-500">
                        {currency} →
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                       {r.currency}
                    </div>
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-indigo-700">
                  {/* Usamos la función de formato mejorada */}
                  {formatValue(r.value, r.currency)}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* --- Fin Tarjeta Principal --- */}

      </main>
    </div>
  );
}