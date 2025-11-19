
import type { Product, Category, Review } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

const reviews: Review[] = [
    {
      id: '1',
      author: 'Alice',
      date: '2024-05-20T10:00:00Z',
      rating: 5,
      text: 'So crisp and delicious! Best apples I\'ve had in a long time. Will definitely buy again.',
    },
    {
      id: '2',
      author: 'Bob',
      date: '2024-05-18T14:30:00Z',
      rating: 4,
      text: 'Great quality apples. A bit pricey but worth it for the organic quality. Recommended.',
       reply: {
        author: 'GetMart',
        date: '2024-05-19T09:00:00Z',
        text: 'Thanks Bob! We\'re glad you enjoyed them.'
      }
    },
     {
      id: '3',
      author: 'Charlie',
      date: '2024-05-15T12:00:00Z',
      rating: 3,
      text: 'They were okay. Not as crisp as I was expecting, but still decent flavor.',
    }
  ];

export async function getProducts(filters?: { category?: string }): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    let q = query(productsCollection);
    if (filters?.category) {
        q = query(productsCollection, where("category", "==", filters.category));
    }
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), reviews: reviews } as Product));
}

export async function getProductById(id: string): Promise<Product | undefined> {
    const productDoc = doc(firestore, 'products', id);
    const snapshot = await getDoc(productDoc);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data(), reviews: reviews } as Product;
    }
    return undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    const q = query(productsCollection, where("featured", "==", true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), reviews: reviews } as Product));
}

export async function getCategories(): Promise<Category[]> {
    const categoriesCollection = collection(firestore, 'categories');
    const snapshot = await getDocs(categoriesCollection);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}
