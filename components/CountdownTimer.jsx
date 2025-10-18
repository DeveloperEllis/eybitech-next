"use client";
import { useState, useEffect } from 'react';

export default function CountdownTimer({ endDate, onExpire }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire && onExpire();
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [endDate, onExpire]);

  if (timeLeft.expired) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-xl p-4 shadow-2xl animate-pulse-slow">
      <div className="flex items-center justify-center space-x-2 mb-3">
        <svg className="w-6 h-6 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <h3 className="text-white font-bold text-lg uppercase tracking-wider">⚡ ¡OFERTA POR TIEMPO LIMITADO!</h3>
        <svg className="w-6 h-6 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-3 text-center">
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 border-2 border-white border-opacity-30">
          <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-xs sm:text-sm font-semibold text-white mt-1 uppercase">Días</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 border-2 border-white border-opacity-30">
          <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs sm:text-sm font-semibold text-white mt-1 uppercase">Horas</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 border-2 border-white border-opacity-30">
          <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs sm:text-sm font-semibold text-white mt-1 uppercase">Min</div>
        </div>
        <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 border-2 border-white border-opacity-30">
          <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs sm:text-sm font-semibold text-white mt-1 uppercase">Seg</div>
        </div>
      </div>
      <div className="mt-3 text-center"><p className="text-white text-sm font-semibold">🔥 ¡Aprovecha esta oferta antes de que expire!</p></div>
    </div>
  );
}
