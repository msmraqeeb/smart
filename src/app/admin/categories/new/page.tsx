
'use client';
import { CategoryForm } from '../category-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Category } from '@/lib/types';

function NewCategoryPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: Omit<Category, 'id'>) => {
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, "categories"), data);
            toast({
                title: "Category Created",
                description: `Category "${data.name}" has been successfully created.`,
            });
            router.push('/admin/categories');
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "Error creating category",
                description: "There was a problem creating the category. Please try again.",
            });
        }
    };

    return (
         <div className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Add New Category</CardTitle>
                    <CardDescription>Fill out the form below to add a new category to your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CategoryForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(NewCategoryPage);
