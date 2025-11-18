'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // In a Next.js development environment, throwing an error here will
      // display it in the development overlay, which is great for debugging.
      if (process.env.NODE_ENV === 'development') {
        // We throw the error so Next.js can catch it and show the overlay.
        // The error includes all the context needed to debug the security rule.
        throw error;
      } else {
        // In production, you might want to log this to a service like Sentry,
        // or display a generic error message to the user.
        console.error("Firestore Permission Error:", error.message);
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  // This component does not render anything to the DOM.
  return null;
}
