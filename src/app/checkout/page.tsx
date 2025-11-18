

"use client";

import { useCart } from "@/context/cart-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { doc, setDoc, collection, serverTimestamp, type Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';


const saveOrder = (db: Firestore, orderId: string, orderData: any) => {
  const orderRef = doc(db, "orders", orderId);
  setDoc(orderRef, orderData)
    .then(() => {
        // This part runs on success.
    })
    .catch(async (serverError) => {
      // Create the rich, contextual error asynchronously.
      const permissionError = new FirestorePermissionError({
        path: orderRef.path,
        operation: 'create',
        requestResourceData: orderData,
      } satisfies SecurityRuleContext);

      // Emit the error with the global error emitter
      errorEmitter.emit('permission-error', permissionError);
    });
};


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    email: '',
  });

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [id]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    // Generate the custom order ID
    const datePrefix = format(new Date(), 'yyMMdd');
    // Using a random 4-digit number for simplicity. A sequential number would require a transaction or a Cloud Function to be safe from race conditions.
    const sequenceNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `${datePrefix}${sequenceNumber}`;

    const orderData = {
      id: orderId, // Storing the ID in the document as well
      customer: customerInfo,
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      total: cartTotal,
      status: "Processing",
      createdAt: serverTimestamp(),
      userId: user?.uid || null,
    };

    saveOrder(firestore, orderId, orderData);

    toast({
      title: "Order Placed!",
      description: "Thank you for your purchase. Your order is being processed.",
    });
    clearCart();
    router.push("/");
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold mb-8 text-center">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" value={customerInfo.firstName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" value={customerInfo.lastName} onChange={handleInputChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" value={customerInfo.address} onChange={handleInputChange} required />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Anytown" value={customerInfo.city} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input id="zip" placeholder="12345" value={customerInfo.zip} onChange={handleInputChange} required />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={customerInfo.email} onChange={handleInputChange} required />
            </div>
          </CardContent>
           <CardHeader className="pt-0">
            <CardTitle className="font-headline text-2xl">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="**** **** **** 1234" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <Input id="expiry-date" placeholder="MM / YY" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Input id="cvc" placeholder="123" required />
                </div>
              </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p>{formatCurrency(item.product.price * item.quantity)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>{formatCurrency(cartTotal)}</p>
                    </div>
                     <div className="flex justify-between">
                        <p>Shipping</p>
                        <p>FREE</p>
                    </div>
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>{formatCurrency(cartTotal)}</p>
                    </div>
                </CardContent>
            </Card>
            <Button type="submit" size="lg" className="w-full text-lg">
                Place Order
            </Button>
        </div>
      </form>
    </div>
  );
}
