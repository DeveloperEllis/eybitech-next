"use client";
import { useState, useEffect } from 'react';
import { fetchExchangeRates } from '../lib/currencyConverter';

export default function ExchangeRateBanner() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRates = async () => {
      const exchangeRates = await fetchExchangeRates();
      setRates(exchangeRates);
      setLoading(false);
    };
    loadRates();
    const interval = setInterval(loadRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !rates) {
    return (
      <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-pulse text-xl">💱</div>
            <span className="text-sm font-medium">Cargando tasas de cambio...</span>
          </div>
        </div>
      </div>
    );
  }

  const usdToCup = rates.USD_TO_CUP?.toFixed(2) || '120.00';
  const eurToCup = rates.EUR_TO_CUP?.toFixed(2) || '130.00';
  const usdToEur = rates.USD_TO_EUR?.toFixed(4) || '0.9200';

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white py-3.5 overflow-hidden relative shadow-md">
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 20s linear infinite; }
      `}</style>
      <div className="marquee-track flex items-center whitespace-nowrap" style={{ width: '200%' }}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="flex items-center space-x-3 px-8">
              <span className="text-2xl">🇺🇸</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base">1 USD</span>
                <span className="text-yellow-300 font-bold">=</span>
                <span className="font-bold text-yellow-300 text-lg">{usdToCup}</span>
                <span className="font-semibold text-base">CUP</span>
              </div>
              <span className="text-2xl">🇨🇺</span>
            </div>
            <div className="text-blue-300 mx-4 text-lg">●</div>
            <div className="flex items-center space-x-3 px-8">
              <span className="text-2xl">🇪🇺</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base">1 EUR</span>
                <span className="text-yellow-300 font-bold">=</span>
                <span className="font-bold text-yellow-300 text-lg">{eurToCup}</span>
                <span className="font-semibold text-base">CUP</span>
              </div>
              <span className="text-2xl">🇨🇺</span>
            </div>
            <div className="text-blue-300 mx-4 text-lg">●</div>
            <div className="flex items-center space-x-3 px-8">
              <span className="text-2xl">🇺🇸</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-base">1 USD</span>
                <span className="text-yellow-300 font-bold">=</span>
                <span className="font-bold text-yellow-300 text-lg">{usdToEur}</span>
                <span className="font-semibold text-base">EUR</span>
              </div>
              <span className="text-2xl">🇪🇺</span>
            </div>
            <div className="text-blue-300 mx-4 text-lg">●</div>
          </div>
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-blue-600 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-blue-600 to-transparent pointer-events-none"></div>
    </div>
  );
}
