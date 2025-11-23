
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { CartItem, Product, ProductVariant } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number, variant?: ProductVariant) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const getInitialCartState = (): CartItem[] => {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const savedCart = window.localStorage.getItem('getmart-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error("Failed to read cart from localStorage", error);
        return [];
    }
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    setCartItems(getInitialCartState());
  }, []);

  useEffect(() => {
    if (isClient) {
        try {
            window.localStorage.setItem('getmart-cart', JSON.stringify(cartItems));
        } catch (error) {
            console.error("Failed to save cart to localStorage", error);
        }
    }
  }, [cartItems, isClient]);

  const addToCart = (product: Product, quantity: number, variant?: ProductVariant) => {
    setCartItems((prevItems) => {
      const cartItemId = variant ? `${product.id}-${variant.id}` : product.id;
      const existingItem = prevItems.find(
        (item) => item.id === cartItemId
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevItems, { id: cartItemId, product, quantity, variant }];
    });

    let toastDescription = `${quantity} x ${product.name}`;
    if (variant) {
        toastDescription += ` (${Object.values(variant.attributes).join(' / ')})`
    }
    
    toast({
      title: "Item added to cart",
      description: toastDescription,
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== cartItemId)
    );
    toast({
      title: "Item removed from cart",
      variant: "destructive",
    });
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = (cartItems || []).reduce(
    (total, item) => {
        const itemPrice = item.variant?.price || item.product.price;
        return total + itemPrice * item.quantity;
    },
    0
  );

  const itemCount = (cartItems || []).reduce(
    (count, item) => count + item.quantity,
    0
  );

  const value = {
    cartItems: cartItems || [],
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    itemCount: isClient ? itemCount : 0,
    isCartOpen,
    setIsCartOpen,
  };

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
