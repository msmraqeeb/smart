'use client';

import { useRouter, useParams } from 'next/navigation';
import { useDoc } from '@/firebase';
import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import withAdminAuth from '@/components/withAdminAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import React, { useEffect, useState } from 'react';

const updateOrder = (db: Firestore, orderId: string, data: { status: string }) => {
  const orderRef = doc(db, 'orders', orderId);
  updateDoc(orderRef, data)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: orderRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
};

function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const firestore = useFirestore();
  const orderRef = React.useMemo(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'orders', id);
  }, [firestore, id]);

  const { data: order, loading } = useDoc(orderRef);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || typeof id !== 'string' || !status) return;
    
    updateOrder(firestore, id, { status });

    toast({
      title: 'Order Updated',
      description: `Order ${id} has been updated.`,
    });
    router.push('/admin/orders');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline">Edit Order</CardTitle>
            <CardDescription>Update the status for order #{order.id}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Order Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAdminAuth(EditOrderPage);
