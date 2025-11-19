
import type { Product, Category, Review } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

const reviews: Review[] = [];

export async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    const snapshot = await getDocs(productsCollection);
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

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    if (!slug) return undefined;
    const productsCollection = collection(firestore, 'products');
    const q = query(productsCollection, where("slug", "==", slug));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return undefined;
    }
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data(), reviews: reviews } as Product;
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
