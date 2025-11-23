
'use client';
import { useRouter, useParams } from 'next/navigation';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import React from 'react';

export default function OrderDetailsPage() {
  const params = useParams();
  const { id } = params;

  const firestore = useFirestore();
  const orderRef = React.useMemo(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'orders', id);
  }, [firestore, id]);

  const { data: order, loading } = useDoc(orderRef);

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  const subtotal = order.total - (order.shippingCost || 0) + (order.discount || 0);

  return (
    <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                <div>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Order ID: #{order.id} - Placed on {order.createdAt?.toDate().toLocaleDateString()}</CardDescription>
                </div>
                <div>
                     <Badge 
                        variant={
                            order.status === 'Shipped' ? 'default' : 
                            order.status === 'Processing' ? 'secondary' :
                            order.status === 'Delivered' ? 'outline' :
                            'destructive'
                        }
                        className="text-base"
                    >
                        {order.status}
                    </Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4">
                {order.items.map((item: any, index: number) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="font-medium">{item.name}</p>
                                {item.variant?.attributes && (
                                    <p className="text-sm text-muted-foreground">{Object.values(item.variant.attributes).join(' / ')}</p>
                                )}
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p>{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2">
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">Subtotal</p>
                    <p>{formatCurrency(subtotal)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping ({order.shippingZone})</p>
                    <p>{formatCurrency(order.shippingCost)}</p>
                </div>
                {order.discount > 0 && (
                    <div className="flex justify-between text-primary">
                        <p>Discount {order.couponCode && `(${order.couponCode})`}</p>
                        <p>-{formatCurrency(order.discount)}</p>
                    </div>
                )}
                <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <p>Total</p>
                    <p>{formatCurrency(order.total)}</p>
                </div>
            </div>
            <Separator />
            <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <address className="not-italic text-muted-foreground">
                    {order.customer.fullName}<br/>
                    {order.customer.address}<br/>
                    {order.customer.area}, {order.customer.district}
                </address>
            </div>
        </CardContent>
    </Card>
  );
}
