"use client";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'eybitech_cart_v1';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const addToCart = (product, qty = 1) => {
    if (!product?.id) return;
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.product?.id === product.id || it.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        const current = next[idx];
        const currentQty = current.quantity || 1;
        const maxStock = product.stock ?? current.product?.stock ?? 999;
        const newQty = Math.min(currentQty + qty, maxStock);
        next[idx] = { ...current, product: current.product || product, quantity: newQty };
        return next;
      }
      return [...prev, { product, quantity: Math.min(qty, product.stock ?? 999) }];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((it) => (it.product?.id || it.id) !== id));
  const clearCart = () => setItems([]);

  const updateQuantity = (id, quantity) => {
    setItems((prev) => prev.map((it) => {
      const pid = it.product?.id || it.id;
      if (pid !== id) return it;
      const maxStock = it.product?.stock ?? 999;
      const q = Math.max(0, Math.min(quantity, maxStock));
      return { ...it, quantity: q };
    }).filter((it) => (it.quantity || 0) > 0));
  };

  const total = useMemo(() => items.reduce((acc, it) => acc + (((it.product?.price ?? it.price) || 0) * (it.quantity || 1)), 0), [items]);
  const count = useMemo(() => items.reduce((acc, it) => acc + (it.quantity || 1), 0), [items]);

  const value = useMemo(() => ({ items, addToCart, removeFromCart, clearCart, updateQuantity, total, count }), [items, total, count]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
