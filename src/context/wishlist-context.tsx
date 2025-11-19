
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { Product } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface WishlistContextType {
  wishlistItems: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isClient: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const getInitialWishlistState = (): Product[] => {
    if (typeof window === "undefined") {
        return [];
    }
    try {
        const savedWishlist = window.localStorage.getItem('getmart-wishlist');
        return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
        console.error("Failed to read wishlist from localStorage", error);
        return [];
    }
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  useEffect(() => {
    setIsClient(true);
    setWishlistItems(getInitialWishlistState());
  }, []);

  // Sync localStorage with firestore on user change
  useEffect(() => {
    const syncWishlist = async () => {
      if (user && firestore) {
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const firestoreWishlistIds: string[] = userDoc.data()?.wishlist || [];
        const localWishlistIds = getInitialWishlistState().map(p => p.id);

        const combinedIds = [...new Set([...firestoreWishlistIds, ...localWishlistIds])];

        if (combinedIds.length > 0) {
            // This is a simplified sync. For a real app, you might want more complex logic.
            // Here we are just merging and overwriting.
            const allProducts = await import('@/lib/data').then(m => m.getProducts());
            const combinedWishlistProducts = allProducts.filter(p => combinedIds.includes(p.id));
            
            setWishlistItems(combinedWishlistProducts);
            await setDoc(userRef, { wishlist: combinedIds }, { merge: true });
        }
      }
    };
    if (isClient) {
      syncWishlist();
    }
  }, [user, firestore, isClient]);


  useEffect(() => {
    if (isClient) {
        try {
            window.localStorage.setItem('getmart-wishlist', JSON.stringify(wishlistItems));
            if (user && firestore) {
                const userRef = doc(firestore, 'users', user.uid);
                const wishlistIds = wishlistItems.map(item => item.id);
                setDoc(userRef, { wishlist: wishlistIds }, { merge: true });
            }
        } catch (error) {
            console.error("Failed to save wishlist", error);
        }
    }
  }, [wishlistItems, isClient, user, firestore]);

  const addToWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      if (prevItems.some(item => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
    toast({
      title: "Added to wishlist",
      description: `${product.name} has been saved.`,
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlistItems((prevItems) =>
      prevItems.filter((item) => item.id !== productId)
    );
    toast({
      title: "Removed from wishlist",
      variant: "destructive",
    });
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isClient,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
