

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
import { doc, setDoc, serverTimestamp, type Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


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
    fullName: '',
    address: '',
    city: '',
    district: '',
    mobileNumber: '',
    email: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [id]: value }));
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;

    // Generate the custom order ID
    const datePrefix = format(new Date(), 'yyMMdd');
    const sequenceNumber = Math.floor(1000 + Math.random() * 9000).toString();
    const orderId = `${datePrefix}${sequenceNumber}`;

    const orderData = {
      id: orderId,
      customer: {
        firstName: customerInfo.fullName.split(' ')[0] || '',
        lastName: customerInfo.fullName.split(' ').slice(1).join(' ') || '',
        ...customerInfo
      },
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
      paymentMethod,
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
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="John Doe" value={customerInfo.fullName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" placeholder="123 Main St" value={customerInfo.address} onChange={handleInputChange} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Select onValueChange={(value) => handleSelectChange('city', value)} value={customerInfo.city}>
                        <SelectTrigger id="city">
                            <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dhaka">Dhaka</SelectItem>
                            <SelectItem value="chittagong">Chittagong</SelectItem>
                            <SelectItem value="sylhet">Sylhet</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select onValueChange={(value) => handleSelectChange('district', value)} value={customerInfo.district}>
                        <SelectTrigger id="district">
                            <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="dhaka">Dhaka</SelectItem>
                            <SelectItem value="gazipur">Gazipur</SelectItem>
                            <SelectItem value="narayanganj">Narayanganj</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input id="mobileNumber" type="tel" placeholder="+8801234567890" value={customerInfo.mobileNumber} onChange={handleInputChange} required />
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
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod">Cash on Delivery</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online">Online Payment</Label>
                    </div>
                </RadioGroup>

                {paymentMethod === 'online' && (
                     <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
                        <div className="space-y-2">
                            <Label htmlFor="card-number">Card Number</Label>
                            <Input id="card-number" placeholder="**** **** **** 1234" required={paymentMethod === 'online'} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="expiry-date">Expiry Date</Label>
                                <Input id="expiry-date" placeholder="MM / YY" required={paymentMethod === 'online'} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cvc">CVC</Label>
                                <Input id="cvc" placeholder="123" required={paymentMethod === 'online'} />
                            </div>
                        </div>
                    </div>
                )}
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
