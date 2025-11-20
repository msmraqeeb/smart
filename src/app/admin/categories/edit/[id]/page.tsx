
'use client';
import { CategoryForm } from '../../category-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function EditCategoryPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || typeof id !== 'string') return;
        const fetchCategory = async () => {
            setLoading(true);
            const docRef = doc(firestore, "categories", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCategory({ id: docSnap.id, ...docSnap.data() } as Category);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Category not found',
                });
                router.push('/admin/categories');
            }
            setLoading(false);
        };
        fetchCategory();
    }, [firestore, id, router, toast]);

    const handleSubmit = async (data: Omit<Category, 'id'>) => {
        if (!firestore || typeof id !== 'string') return;
        
        const dataToUpdate: Partial<Category> = { ...data };
        if (!data.parentId) {
            dataToUpdate.parentId = ''; // Or delete it, depending on desired db state
        }
        
        try {
            await updateDoc(doc(firestore, "categories", id), {
                ...dataToUpdate
            });
            toast({
                title: "Category Updated",
                description: `Category "${data.name}" has been successfully updated.`,
            });
            router.push('/admin/categories');
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: 'destructive',
                title: "Error updating category",
                description: "There was a problem updating the category. Please try again.",
            });
        }
    };

    if (loading || !category) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                         <Skeleton className="h-8 w-1/2" />
                         <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Edit Category</CardTitle>
                    <CardDescription>Update the details for "{category?.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    {category && <CategoryForm category={category} onSubmit={handleSubmit} />}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(EditCategoryPage);
