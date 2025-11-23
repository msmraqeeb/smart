
'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import React, { Suspense, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCart } from '@/context/cart-context';

function OrderConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { clearCart } = useCart();

  const firestore = useFirestore();
  const orderRef = React.useMemo(() => {
    if (!firestore || !orderId) return null;
    return doc(firestore, 'orders', orderId);
  }, [firestore, orderId]);

  const { data: order, loading } = useDoc(orderRef);

  useEffect(() => {
    if (orderId) {
      clearCart();
    }
  }, [orderId, clearCart]);

  React.useEffect(() => {
    if (!loading && !order && orderId) {
      // If we have an orderId but find no order after loading, maybe it's still being created.
      // We could add a small delay and retry or redirect. For now, we redirect.
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  }, [loading, order, orderId, router]);


  if (loading || !orderId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <Skeleton className="h-12 w-12 mx-auto rounded-full" />
            <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-32 mx-auto" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold">Order not found</h1>
            <p className="text-muted-foreground">Redirecting to homepage...</p>
        </div>
    )
  }

  const subtotal = order.total - (order.shippingCost || 0);

  return (
    <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold">Thank You For Your Order!</CardTitle>
                <CardDescription className="text-lg">Your order has been placed successfully.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="text-xl font-mono font-semibold">{order.id}</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <h3 className="font-semibold mb-2">Shipping To</h3>
                        <address className="not-italic text-muted-foreground">
                            {order.customer.fullName}<br/>
                            {order.customer.address}<br/>
                            {order.customer.area}, {order.customer.district}<br />
                            {order.customer.mobileNumber}
                        </address>
                    </div>
                     <div className="text-left md:text-right">
                        <h3 className="font-semibold mb-2">Order Details</h3>
                        <div className="text-muted-foreground space-y-1">
                            <p>Date: {order.createdAt?.toDate().toLocaleDateString()}</p>
                            <p>Payment: {order.paymentMethod.toUpperCase()}</p>
                            <div className='flex items-center justify-start md:justify-end gap-2'>Status: <Badge variant={order.status === 'Processing' ? 'secondary' : 'default'}>{order.status}</Badge></div>
                        </div>
                    </div>
                </div>
                
                <Separator />
                
                <div>
                     <h3 className="font-semibold mb-4 flex items-center gap-2"><Package className="h-5 w-5" />Order Summary</h3>
                    <div className="space-y-2">
                        {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                                <p>{formatCurrency(item.price * item.quantity)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                
                <Separator />

                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p>{formatCurrency(subtotal)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-muted-foreground">Shipping</p>
                        <p>{formatCurrency(order.shippingCost)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-base">
                        <p>Total</p>
                        <p>{formatCurrency(order.total)}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <p className="text-xs text-muted-foreground text-center">You will receive an email confirmation shortly. Thank you for shopping with us!</p>
                <Button asChild className="w-full">
                    <Link href="/products">Continue Shopping</Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrderConfirmationContent />
        </Suspense>
    )
}
