
import type { Product, Category, Review, Coupon, Attribute } from './types';
import { PlaceHolderImages } from './placeholder-images';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

const { firestore } = initializeFirebase();

const getReviews = async (productId: string): Promise<Review[]> => {
    if (!productId) return [];
    const reviewsCollection = collection(firestore, 'products', productId, 'reviews');
    const snapshot = await getDocs(query(reviewsCollection, orderBy('createdAt', 'desc')));
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
};

export async function getProducts(): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    const snapshot = await getDocs(productsCollection);
    if (snapshot.empty) {
        return [];
    }
    const products = await Promise.all(snapshot.docs.map(async (doc) => {
        const reviews = await getReviews(doc.id);
        return { id: doc.id, ...doc.data(), reviews } as Product;
    }));
    return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
    if (!id) return undefined;
    const productDocRef = doc(firestore, 'products', id);
    const snapshot = await getDoc(productDocRef);
    if (snapshot.exists()) {
        const reviews = await getReviews(id);
        return { id: snapshot.id, ...snapshot.data(), reviews } as Product;
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
    const reviews = await getReviews(doc.id);
    return { id: doc.id, ...doc.data(), reviews } as Product;
}

export async function getSaleProducts(): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    const q = query(productsCollection, where("salePrice", ">", 0));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
     const products = await Promise.all(snapshot.docs.map(async (doc) => {
        const reviews = await getReviews(doc.id);
        return { id: doc.id, ...doc.data(), reviews } as Product;
    }));
    return products;
}

export async function getFeaturedProducts(): Promise<Product[]> {
    const productsCollection = collection(firestore, 'products');
    const q = query(productsCollection, where("featured", "==", true));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return [];
    }
     const products = await Promise.all(snapshot.docs.map(async (doc) => {
        const reviews = await getReviews(doc.id);
        return { id: doc.id, ...doc.data(), reviews } as Product;
    }));
    return products;
}

export async function getCategories(): Promise<Category[]> {
    const categoriesCollection = collection(firestore, 'categories');
    const snapshot = await getDocs(categoriesCollection);
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function getAttributes(): Promise<Attribute[]> {
    if (!firestore) return [];
    const attributesCollection = collection(firestore, 'attributes');
    const snapshot = await getDocs(query(attributesCollection, orderBy('name')));
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attribute));
}

export async function getAttributeById(id: string): Promise<Attribute | null> {
    if (!firestore) return null;
    const docRef = doc(firestore, "attributes", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Attribute;
    }
    return null;
}


export async function getCoupons(): Promise<Coupon[]> {
    if (!firestore) return [];
    const couponsCollection = collection(firestore, 'coupons');
    const snapshot = await getDocs(query(couponsCollection, orderBy('expiresAt', 'desc')));
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Coupon));
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
    if (!firestore || !code) return null;
    const couponsCollection = collection(firestore, 'coupons');
    const q = query(couponsCollection, where("code", "==", code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        return null;
    }
    const couponDoc = snapshot.docs[0];
    return { id: couponDoc.id, ...couponDoc.data() } as Coupon;
}
