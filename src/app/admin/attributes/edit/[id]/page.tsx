
'use client';
import { AttributeForm } from '../../attribute-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Attribute } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getAttributeById } from '@/lib/data';

function EditAttributePage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [attribute, setAttribute] = useState<Attribute | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id !== 'string') return;
        const fetchAttribute = async () => {
            setLoading(true);
            const fetchedAttribute = await getAttributeById(id);
            if (fetchedAttribute) {
                setAttribute(fetchedAttribute);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Attribute not found',
                });
                router.push('/admin/attributes');
            }
            setLoading(false);
        };
        fetchAttribute();
    }, [id, router, toast]);

    const handleSubmit = async (data: Omit<Attribute, 'id'>) => {
        if (!firestore || typeof id !== 'string') return;
        try {
            await updateDoc(doc(firestore, "attributes", id), data);
            toast({
                title: "Attribute Updated",
                description: `Attribute "${data.name}" has been successfully updated.`,
            });
            router.push('/admin/attributes');
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: 'destructive',
                title: "Error updating attribute",
                description: "There was a problem updating the attribute. Please try again.",
            });
        }
    };

    if (loading || !attribute) {
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
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Attribute</CardTitle>
                    <CardDescription>Update the details for "{attribute?.name}".</CardDescription>
                </CardHeader>
                <CardContent>
                    {attribute && <AttributeForm attribute={attribute} onSubmit={handleSubmit} />}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(EditAttributePage);
