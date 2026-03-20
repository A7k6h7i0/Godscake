"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "gods_cake_cart";

export type CartItem = {
  cakeId?: string;
  menuItemId?: string;
  bakeryId: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageUrl?: string;
};

type CartContextValue = {
  items: CartItem[];
  total: number;
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  bakeryId: string | null;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setItems(parsed);
        } catch {
          setItems([]);
        }
      }
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    if (!item?.bakeryId || (!item?.cakeId && !item?.menuItemId)) return;
    
    // Use cakeId or menuItemId as the unique identifier
    const itemId = item.cakeId || item.menuItemId;
    if (!itemId) return;
    
    setItems((prev) => {
      // Keep cart scoped to one bakery at a time for simpler checkout rules.
      const existingBakery = prev[0]?.bakeryId;
      const scoped = existingBakery && existingBakery !== item.bakeryId ? [] : prev;
      const found = scoped.find((x) => (x.cakeId || x.menuItemId) === itemId);
      if (found) {
        return scoped.map((x) => ((x.cakeId || x.menuItemId) === itemId ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...scoped, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => (item.cakeId || item.menuItemId) !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(itemId);
    setItems((prev) => prev.map((item) => ((item.cakeId || item.menuItemId) === itemId ? { ...item, quantity } : item)));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const bakeryId = items.length ? items[0].bakeryId : null;

  const value = useMemo(
    () => ({ items, total, addToCart, removeFromCart, updateQuantity, clearCart, bakeryId }),
    [items, total, bakeryId]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
};
