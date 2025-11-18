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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import React, { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


const updateOrder = (db: Firestore, orderId: string, data: any) => {
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

  const { data: initialOrder, loading } = useDoc(orderRef);
  const [order, setOrder] = useState<any | null>(null);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialOrder]);
  
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!order) return;
    const { id, value } = e.target;
    setOrder({
        ...order,
        customer: {
            ...order.customer,
            [id]: value,
        }
    });
  };

  const handleItemChange = (itemIndex: number, field: string, value: string | number) => {
    if (!order) return;
    const newItems = [...order.items];
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    if (field === 'quantity' || field === 'price') {
        if (!isNaN(numericValue) && numericValue >= 0) {
            newItems[itemIndex] = { ...newItems[itemIndex], [field]: numericValue };
        }
    } else {
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    }
    
    const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    setOrder({
        ...order,
        items: newItems,
        total: newTotal
    });
  };

  const removeItem = (itemIndex: number) => {
    if (!order) return;
    const newItems = order.items.filter((_: any, index: number) => index !== itemIndex);
    const newTotal = newItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    setOrder({
        ...order,
        items: newItems,
        total: newTotal,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || typeof id !== 'string' || !order) return;
    
    // Create a copy of the order and remove the id field before saving
    const orderToSave = { ...order };
    delete orderToSave.id;

    updateOrder(firestore, id, orderToSave);

    toast({
      title: 'Order Updated',
      description: `Order #${id} has been updated.`,
    });
    router.push('/admin/orders');
  };

  if (loading || !order) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Edit Order</CardTitle>
            <CardDescription>Update details for order #{order.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Customer Information */}
            <section>
              <h3 className="font-headline text-xl mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={order.customer.firstName} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={order.customer.lastName} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={order.customer.email} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={order.customer.address} onChange={handleCustomerChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={order.customer.city} onChange={handleCustomerChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input id="zip" value={order.customer.zip} onChange={handleCustomerChange} />
                </div>
              </div>
            </section>
            
            <Separator />

            {/* Order Items */}
            <section>
                <h3 className="font-headline text-xl mb-4">Order Items</h3>
                <div className="space-y-4">
                    {order.items.map((item: any, index: number) => (
                        <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 rounded-md border p-4">
                           <div className='flex-1'>
                             <Label>Product Name</Label>
                             <p className='font-medium'>{item.name}</p>
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor={`quantity-${index}`}>Quantity</Label>
                                <Input 
                                    id={`quantity-${index}`} 
                                    type="number" 
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                    className="w-24"
                                />
                           </div>
                           <div className="space-y-2">
                                <Label htmlFor={`price-${index}`}>Price</Label>
                                <Input 
                                    id={`price-${index}`} 
                                    type="number" 
                                    step="0.01"
                                    value={item.price}
                                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                    className="w-28"
                                />
                           </div>
                            <div className="ml-auto">
                                <Button variant="destructive" size="icon" type="button" onClick={() => removeItem(index)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className='sr-only'>Remove Item</span>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 text-right">
                    <p className="text-lg font-bold">Total: {formatCurrency(order.total)}</p>
                </div>
            </section>

            <Separator />

            {/* Order Status */}
            <section>
                 <h3 className="font-headline text-xl mb-4">Order Status</h3>
                 <div className="max-w-xs">
                    <Label htmlFor="status">Status</Label>
                    <Select value={order.status} onValueChange={(value) => setOrder({...order, status: value})}>
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
            </section>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default withAdminAuth(EditOrderPage);
