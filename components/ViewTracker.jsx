"use client";
import { useEffect, useRef } from 'react';

export default function ViewTracker({ productId }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Solo ejecutar una vez por sesión
    if (hasTracked.current || !productId) return;
    
    const trackView = async () => {
      try {
        // Verificar si ya vimos este producto en esta sesión
        const sessionKey = `viewed_${productId}`;
        const alreadyViewed = sessionStorage.getItem(sessionKey);
        
        if (alreadyViewed) return;
        
        // Esperar un poco para evitar bots (usuario debe estar al menos 2 segundos)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Incrementar vista
        const response = await fetch('/api/increment-view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        });
        
        if (response.ok) {
          // Marcar como visto en esta sesión
          sessionStorage.setItem(sessionKey, 'true');
          hasTracked.current = true;
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [productId]);

  return null; // Este componente no renderiza nada
}
