'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
  useState,
} from 'react';
import { FirebaseApp } from 'firebase/app';
import { Auth, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseContextType {
  app: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(
  undefined
);

interface FirebaseProviderProps {
  children: ReactNode;
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

export function FirebaseProvider({
  children,
  app,
  auth,
  firestore,
}: FirebaseProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // If no user is signed in after state change, sign in anonymously.
      // This handles the initial load and sign-out cases.
      if (!currentUser) {
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed on state change:", error);
        });
      }
    });

    // Check initial state
    if (auth.currentUser) {
      setUser(auth.currentUser);
    } else {
      // If there's no current user on initial check, sign in anonymously.
      signInAnonymously(auth).catch((error) => {
        console.error("Initial anonymous sign-in failed:", error);
      });
    }

    return () => unsubscribe();
  }, [auth]);

  const contextValue = useMemo(
    () => ({
      app,
      auth,
      firestore,
      user,
    }),
    [app, auth, firestore, user]
  );

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  return useFirebase().app;
};

export const useAuth = (): { auth: Auth | null; user: User | null } => {
  const { auth, user } = useFirebase();
  return { auth, user };
};

export const useFirestore = (): Firestore | null => {
  return useFirebase().firestore;
};
