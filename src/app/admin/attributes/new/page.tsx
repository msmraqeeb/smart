
'use client';
import { AttributeForm } from '../attribute-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Attribute } from '@/lib/types';

function NewAttributePage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: Omit<Attribute, 'id'>) => {
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, "attributes"), data);
            toast({
                title: "Attribute Created",
                description: `Attribute "${data.name}" has been successfully created.`,
            });
            router.push('/admin/attributes');
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "Error creating attribute",
                description: "There was a problem creating the attribute. Please try again.",
            });
        }
    };

    return (
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Attribute</CardTitle>
                    <CardDescription>Fill out the form below to add a new global attribute.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AttributeForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(NewAttributePage);
