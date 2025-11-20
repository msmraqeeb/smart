
'use client';
import { ProductForm } from '../product-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';


function NewProductPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: Omit<Product, 'id' | 'reviews'>) => {
        if (!firestore) return;
        try {
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
         <div className="container mx-auto px-4 py-8">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Add New Product</CardTitle>
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
