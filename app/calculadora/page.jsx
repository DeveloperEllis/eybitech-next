"use client";
import { useEffect, useMemo, useState } from "react";
import { fetchExchangeRates, convertCurrency, getCurrencySymbol } from "../../lib/currencyConverter";
import { SOCIAL_SHARE_URLS } from "../../constants/appConstants";

export default function CalculatorPage() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const r = await fetchExchangeRates();
      if (mounted) { setRates(r); setLoading(false); }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handleAmount = (raw) => {
    const sanitized = raw.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    setAmount(sanitized);
  };

  const clearAll = () => { setAmount(""); };

  const handleShare = () => {
    if (!rates) return;
    const n = parseFloat(amount);
    const cupFromAmount = !isNaN(n) ? convertCurrency(n, currency, 'CUP', rates) : null;
    const usdToCup = Number(rates?.USD_TO_CUP ?? 0);
    const eurToCup = Number(rates?.EUR_TO_CUP ?? 0);
    let msg = "💱 Resultados de conversión (CUP)\n\n";
    if (cupFromAmount !== null) {
      msg += `${Number(n).toFixed(2)} ${currency} = ${Number(cupFromAmount).toFixed(2)} CUP\n\n`;
    }
    msg += `1 USD = ${usdToCup.toFixed(2)} CUP\n`;
    msg += `1 EUR = ${eurToCup.toFixed(2)} CUP`;
    const url = SOCIAL_SHARE_URLS.WHATSAPP(msg);
    window.open(url, '_blank');
  };

  const results = useMemo(() => {
    const n = parseFloat(amount);
    if (!rates || isNaN(n)) return [];
    const targets = ["USD", "CUP", "EUR"].filter((c) => c !== currency);
    return targets.map((t) => ({
      currency: t,
      value: convertCurrency(n, currency, t, rates),
    }));
  }, [amount, currency, rates]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">🧮 Calculadora de Cambio</h1>
          <p className="text-gray-600 mt-1">Ingresa un monto y elige la moneda.</p>
          <p className="text-xs text-gray-500 mt-1">Introduce la cantidad y las tasas de cambio se verán a continuación.</p>
        </div>

        <div className="card p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 gap-2">
            <span className="text-sm text-gray-500">Tasas actualizadas cada 5 minutos</span>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="px-3 py-1.5 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600">Compartir resultados</button>
              <button onClick={clearAll} className="btn-outline px-3 py-1.5 text-sm">Limpiar</button>
            </div>
          </div>

          {/* Input con dropdown de moneda */}
          <label className="text-sm font-medium text-gray-600 mb-2 block">Monto</label>
          <div className="w-full flex items-stretch gap-0 rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 overflow-x-hidden">
            <div className="px-3 flex items-center bg-gray-50 text-gray-700 font-semibold shrink-0">{getCurrencySymbol(currency)}</div>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleAmount(e.target.value)}
              className="flex-1 min-w-0 px-3 py-3 text-lg md:text-xl outline-none"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2 sm:px-3 py-3 bg-white text-gray-800 border-l border-gray-300 outline-none w-24 sm:w-36 shrink-0"
            >
              <option value="USD">USD</option>
              <option value="CUP">CUP</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Resultados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            {loading && (
              <div className="text-sm text-gray-500">Cargando tasas...</div>
            )}
            {!loading && results.length === 0 && (
              <div className="text-sm text-gray-500">Ingresa un monto para ver la conversión.</div>
            )}
            {results.map((r) => (
              <div key={r.currency} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <div className="text-gray-600">{currency} → {r.currency}</div>
                <div className="text-lg font-semibold">{getCurrencySymbol(r.currency)}{Number(r.value || 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
