
'use client';

import React, { createContext, useContext, ReactNode, useMemo } from "react";
import { useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";

interface StoreSettings {
    logoUrl: string;
    storeName: string;
    address: string;
    contactNumber: string;
    email: string;
    social: {
        facebook: string;
        twitter: string;
        instagram: string;
    };
    slideBanners: string[];
    sideBanners: string[];
}

interface SettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const firestore = useFirestore();

  const settingsRef = useMemo(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'storeDetails');
  }, [firestore]);

  const { data: settings, loading } = useDoc<StoreSettings>(settingsRef);
  
  const value = {
    settings,
    loading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
