
'use client';
import { CouponForm } from '../coupon-form';
import withAdminAuth from '@/components/withAdminAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirestore } from '@/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function NewCouponPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (data: any) => {
        if (!firestore) return;
        try {
            await addDoc(collection(firestore, "coupons"), data);
            toast({
                title: "Coupon Created",
                description: `Coupon "${data.code}" has been successfully created.`,
            });
            router.push('/admin/coupons');
        } catch (error) {
            console.error("Error adding document: ", error);
            toast({
                variant: 'destructive',
                title: "Error creating coupon",
                description: "There was a problem creating the coupon. Please try again.",
            });
        }
    };

    return (
         <div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Coupon</CardTitle>
                    <CardDescription>Fill out the form below to add a new coupon to your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CouponForm onSubmit={handleSubmit} />
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(NewCouponPage);
