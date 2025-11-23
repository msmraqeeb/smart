
'use client';
import { CouponForm } from '../../coupon-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { Coupon } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function EditCouponPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const { toast } = useToast();
    const [coupon, setCoupon] = useState<Coupon | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || typeof id !== 'string') return;
        const fetchCoupon = async () => {
            setLoading(true);
            const docRef = doc(firestore, "coupons", id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setCoupon({ id: docSnap.id, ...docSnap.data() } as Coupon);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Coupon not found',
                });
                router.push('/admin/coupons');
            }
            setLoading(false);
        };
        fetchCoupon();
    }, [firestore, id, router, toast]);

    const handleSubmit = async (data: any) => {
        if (!firestore || typeof id !== 'string') return;
        try {
            await updateDoc(doc(firestore, "coupons", id), data);
            toast({
                title: "Coupon Updated",
                description: `Coupon "${data.code}" has been successfully updated.`,
            });
            router.push('/admin/coupons');
        } catch (error) {
            console.error("Error updating document: ", error);
            toast({
                variant: 'destructive',
                title: "Error updating coupon",
                description: "There was a problem updating the coupon. Please try again.",
            });
        }
    };

    if (loading || !coupon) {
        return (
            <div>
                <Card>
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
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Coupon</CardTitle>
                    <CardDescription>Update the details for "{coupon?.code}".</CardDescription>
                </CardHeader>
                <CardContent>
                    {coupon && <CouponForm coupon={coupon} onSubmit={handleSubmit} />}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(EditCouponPage);
