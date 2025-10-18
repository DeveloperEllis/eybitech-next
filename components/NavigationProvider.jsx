"use client";
import { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export function NavigationProvider({ children }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState(null);

  const startNavigation = (target) => {
    setNavigationTarget(target);
    setIsNavigating(true);
  };

  const endNavigation = () => {
    setIsNavigating(false);
    setNavigationTarget(null);
  };

  return (
    <NavigationContext.Provider value={{
      isNavigating,
      navigationTarget,
      startNavigation,
      endNavigation
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}