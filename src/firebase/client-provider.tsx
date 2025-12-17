
'use client';
import { ReactNode } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

let firebase_app: ReturnType<typeof initializeFirebase>;

export function FirebaseClientProvider({
  children,
}: FirebaseClientProviderProps) {
  if (!firebase_app) {
    firebase_app = initializeFirebase();
  }
  return (
    <FirebaseProvider
      app={firebase_app.app}
      auth={firebase_app.auth}
      firestore={firebase_app.firestore}
      storage={firebase_app.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
