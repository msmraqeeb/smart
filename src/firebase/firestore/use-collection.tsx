'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  limitToLast,
  doc,
  getDoc,
  DocumentData,
  Query,
  CollectionReference,
} from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';

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
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query, options?.idField, options?.snapshotListenOptions]);

  return { data, loading, error };
}
