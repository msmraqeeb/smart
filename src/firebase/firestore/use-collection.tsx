'use client';
import { useState, useEffect } from 'react';
import {
  onSnapshot,
  Query,
} from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

interface Options {
  idField?: string;
  snapshotListenOptions?: {
    includeMetadataChanges: boolean;
  };
}

export function useCollection<T>(
  query: Query<T> | null,
  options?: Options
): { data: (T & { id: string })[] | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<(T & { id: string })[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!query) {
      setData(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot) => {
        const docs = snapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as T & { id: string })
        );
        setData(docs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        if (err.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                // @ts-ignore internal property
                path: query.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
            setError(permissionError);
        } else {
            console.error(err);
            setError(err);
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, options?.idField, options?.snapshotListenOptions]);

  return { data, loading, error };
}
