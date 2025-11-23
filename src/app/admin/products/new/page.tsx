
'use client';
import { ProductForm } from '../product-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Product, Attribute } from '@/lib/types';
import { getAttributes } from '@/lib/data';
import { useEffect, useState } from 'react';


function NewProductPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [globalAttributes, setGlobalAttributes] = useState<Attribute[]>([]);

    useEffect(() => {
        getAttributes().then(setGlobalAttributes);
    }, []);

    const handleSubmit = async (data: Omit<Product, 'id' | 'reviews' | 'imageUrl' | 'imageHint'> & {imageUrls: string[]}) => {
        if (!firestore) return;
        try {
            // Update global attributes with new options if any
            if (data.attributes && data.attributes.length > 0) {
                for (const prodAttr of data.attributes) {
                    const globalAttr = globalAttributes.find(ga => ga.name === prodAttr.name);
                    if (globalAttr) {
                        const newOptions = prodAttr.options.filter(opt => !globalAttr.values.includes(opt));
                        if (newOptions.length > 0) {
                            const attrRef = doc(firestore, "attributes", globalAttr.id);
                            await updateDoc(attrRef, {
                                values: arrayUnion(...newOptions)
                            });
                        }
                    }
                }
            }

            const docRef = await addDoc(collection(firestore, "products"), {
                ...data,
                createdAt: serverTimestamp() 
            });
            toast({
                title: "Product Created",
                description: `Product "${data.name}" has been successfully created.`,
            });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "Error creating product",
                description: "There was a problem creating the product. Please try again.",
            });
        }
    };

    return (
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                    <CardDescription>Fill out the form below to add a new product to your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ProductForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(NewProductPage);
