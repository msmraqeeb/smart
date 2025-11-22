
'use client';
import { ProductForm } from '../../product-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductById } from '@/lib/data';

function EditProductPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') return;
        const fetchProduct = async () => {
            setLoading(true);
            const fetchedProduct = await getProductById(id);

            if (fetchedProduct) {
                setProduct(fetchedProduct);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Product not found',
                });
                router.push('/admin/products');
            }
            setLoading(false);
        };
        fetchProduct();
    }, [id, router, toast]);

    const handleSubmit = async (data: Omit<Product, 'id' | 'reviews' | 'imageUrl' | 'imageHint'> & {imageUrls: string[]}) => {
        if (!firestore || typeof id !== 'string') return;
        try {
            await updateDoc(doc(firestore, "products", id), data as any);
            toast({
                title: "Product Updated",
                description: `Product "${data.name}" has been successfully updated.`,
            });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: 'destructive',
                title: "Error updating product",
                description: "There was a problem updating the product. Please try again.",
            });
        }
    };

    if (loading) {
        return (
            <div>
                <Card>
                    <CardHeader>
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product</CardTitle>
                    <CardDescription>Update the details for "{product?.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    {product && <ProductForm product={product} onSubmit={handleSubmit} />}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(EditProductPage);
