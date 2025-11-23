
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
import { Plus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setOrder({
          ...initialOrder,
          discount: initialOrder.discount || 0, // Ensure discount is a number
      });
    }
  }, [initialOrder]);

  useEffect(() => {
    getProducts().then(setAllProducts);
  }, []);
  
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

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!order) return;
    const { id, value } = e.target;
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
        setOrder({ ...order, [id]: numericValue });
    } else if (value === '') {
         setOrder({ ...order, [id]: 0 });
    }
  }

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
    
    setOrder({
        ...order,
        items: newItems,
    });
  };

  const removeItem = (itemIndex: number) => {
    if (!order) return;
    const newItems = order.items.filter((_: any, index: number) => index !== itemIndex);
    setOrder({
        ...order,
        items: newItems,
    });
  };

  const addItem = (product: Product) => {
    if (!order) return;
    
    // Check if item already exists
    const existingItem = order.items.find((item: any) => item.id === product.id);
    if(existingItem) {
        toast({
            variant: "destructive",
            title: "Item already in order",
            description: `${product.name} is already part of this order.`
        });
        return;
    }

    const newItem = {
        id: product.id,
        name: product.name,
        quantity: 1,
        price: product.price
    };
    const newItems = [...order.items, newItem];

    setOrder({
        ...order,
        items: newItems,
    });
    setIsAddProductDialogOpen(false);
    toast({
        title: "Item Added",
        description: `${product.name} has been added to the order.`
    })
  };

  const subtotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)
  }, [order?.items]);

  const total = useMemo(() => {
      if (!order) return 0;
      return subtotal + (order.shippingCost || 0) - (order.discount || 0);
  }, [order, subtotal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || typeof id !== 'string' || !order) return;
    
    // Create a copy of the order and remove the id field before saving
    const orderToSave = { 
        ...order,
        subTotal: subtotal,
        total: total,
     };
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
    <div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Order</CardTitle>
            <CardDescription>Update details for order #{order.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Customer Information */}
            <section>
              <h3 className="font-headline text-xl mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={order.customer.fullName} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={order.customer.email} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input id="mobileNumber" type="tel" value={order.customer.mobileNumber} onChange={handleCustomerChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={order.customer.address} onChange={handleCustomerChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="district">District/Zilla</Label>
                  <Input id="district" value={order.customer.district} onChange={handleCustomerChange} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" value={order.customer.area} onChange={handleCustomerChange} />
                </div>
              </div>
            </section>
            
            <Separator />

            {/* Order Items */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-headline text-xl">Order Items</h3>
                     <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Add Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Add Product to Order</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[60vh]">
                                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
                                    {allProducts.map(product => (
                                        <Card key={product.id}>
                                            <CardHeader className="p-0">
                                                <Image src={product.imageUrl} alt={product.name} width={200} height={200} className="w-full aspect-square object-cover rounded-t-lg" />
                                            </CardHeader>
                                            <CardContent className="p-4">
                                                <h4 className='font-semibold'>{product.name}</h4>
                                                <p className='text-sm text-muted-foreground'>{formatCurrency(product.price)}</p>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0">
                                                <Button className="w-full" type="button" onClick={() => addItem(product)}>Add to Order</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>
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
                    {order.items.length === 0 && (
                        <div className='text-center text-muted-foreground border-2 border-dashed rounded-lg p-8'>
                            <p>No items in this order. Click "Add Item" to begin.</p>
                        </div>
                    )}
                </div>
                 <div className="mt-6 space-y-4 max-w-sm ml-auto">
                    <div className='flex justify-between items-center'>
                        <Label>Subtotal</Label>
                        <p className='font-medium'>{formatCurrency(subtotal)}</p>
                    </div>
                     <div className='flex justify-between items-center gap-4'>
                        <Label htmlFor="shippingCost">Shipping Cost</Label>
                        <Input id="shippingCost" type="number" step="0.01" value={order.shippingCost} onChange={handleNumericChange} className="w-28" />
                    </div>
                     <div className='flex justify-between items-center gap-4'>
                        <Label htmlFor="discount">Discount</Label>
                        <Input id="discount" type="number" step="0.01" value={order.discount} onChange={handleNumericChange} className="w-28" />
                    </div>
                    <Separator />
                    <div className='flex justify-between items-center text-lg font-bold'>
                        <p>Total</p>
                        <p>{formatCurrency(total)}</p>
                    </div>
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
