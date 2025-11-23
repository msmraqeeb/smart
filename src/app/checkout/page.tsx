

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
import { useEffect, useState, useMemo } from "react";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, type Firestore } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { format } from 'date-fns';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locations } from "@/lib/locations";
import { getCouponByCode, getCoupons } from "@/lib/data";
import type { Coupon } from "@/lib/types";


const saveOrder = (db: Firestore, orderId: string, orderData: any): Promise<void> => {
  const orderRef = doc(db, "orders", orderId);
  return setDoc(orderRef, orderData)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: orderRef.path,
        operation: 'create',
        requestResourceData: orderData,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
      throw serverError;
    });
};


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useAuth();
  
  const userProfileRef = useMemo(() => {
      if (!firestore || !user) return null;
      return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile } = useDoc(userProfileRef);

  const [customerInfo, setCustomerInfo] = useState({
    fullName: '',
    address: '',
    district: '',
    mobileNumber: '',
    email: '',
    area: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const INSIDE_DHAKA_COST = 80;
  const OUTSIDE_DHAKA_COST = 150;
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingZone, setShippingZone] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);


  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/");
    }
  }, [cartItems, router]);

  useEffect(() => {
    if (user) {
        const preferredAddress = userProfile?.shippingAddress || userProfile?.billingAddress;
        setCustomerInfo(prev => ({
            ...prev,
            fullName: user.displayName || preferredAddress?.name || '',
            email: user.email || '',
            address: preferredAddress?.address || '',
            mobileNumber: preferredAddress?.mobile || '',
        }));
    }
  }, [user, userProfile]);
  
  useEffect(() => {
    if (customerInfo.district === 'Dhaka') {
        setShippingCost(INSIDE_DHAKA_COST);
        setShippingZone('Inside Dhaka');
    } else if (customerInfo.district) {
        setShippingCost(OUTSIDE_DHAKA_COST);
        setShippingZone('Outside Dhaka');
    } else {
        setShippingCost(0);
        setShippingZone(null);
    }
  }, [customerInfo.district]);

    // Auto-apply best coupon
  useEffect(() => {
    const findAndApplyBestCoupon = async () => {
        if (appliedCoupon) return; // Don't auto-apply if one is already manually applied
        
        const allCoupons = await getCoupons();
        const now = new Date();

        const validCoupons = allCoupons.filter(coupon => {
            const is_active = coupon.status === 'active';
            const not_expired = !coupon.expiresAt || coupon.expiresAt.toDate() >= now;
            const meets_min_spend = !coupon.minSpend || cartTotal >= coupon.minSpend;
            return is_active && not_expired && meets_min_spend;
        });

        if (validCoupons.length === 0) return;

        let bestCoupon: Coupon | null = null;
        let maxDiscount = 0;

        for (const coupon of validCoupons) {
            let currentDiscount = 0;
            if (coupon.discountType === 'fixed') {
                currentDiscount = coupon.discountValue;
            } else if (coupon.discountType === 'percentage') {
                currentDiscount = (cartTotal * coupon.discountValue) / 100;
            }

            if (currentDiscount > maxDiscount) {
                maxDiscount = currentDiscount;
                bestCoupon = coupon;
            }
        }

        if (bestCoupon && maxDiscount > 0) {
            setAppliedCoupon(bestCoupon);
            setCouponDiscount(maxDiscount);
            setCouponCode(bestCoupon.code);
            toast({
                title: "Best Deal Applied!",
                description: `We've automatically applied the coupon "${bestCoupon.code}" to save you ${formatCurrency(maxDiscount)}.`,
            });
        }
    };

    if (cartTotal > 0) {
        findAndApplyBestCoupon();
    }
  }, [cartTotal, appliedCoupon]);

  const subTotal = cartTotal;
  const grandTotal = subTotal + shippingCost - couponDiscount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCustomerInfo(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setCustomerInfo(prev => ({ 
        ...prev, 
        [id]: value,
        // Reset area when district changes
        ...(id === 'district' && { area: '' })
    }));
  }

  const handleApplyCoupon = async () => {
    if (!couponCode) {
        setCouponError("Please enter a coupon code.");
        return;
    }
    setCouponError(null);
    const coupon = await getCouponByCode(couponCode);
    if (!coupon) {
        setCouponError("Invalid coupon code.");
        setAppliedCoupon(null);
        setCouponDiscount(0);
        return;
    }

    if (coupon.status !== 'active') {
        setCouponError("This coupon is no longer active.");
        return;
    }

    if (coupon.expiresAt && coupon.expiresAt.toDate() < new Date()) {
        setCouponError("This coupon has expired.");
        return;
    }

    if (coupon.minSpend && subTotal < coupon.minSpend) {
        setCouponError(`You must spend at least ${formatCurrency(coupon.minSpend)} to use this coupon.`);
        return;
    }

    let discount = 0;
    if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
    } else if (coupon.discountType === 'percentage') {
        discount = (subTotal * coupon.discountValue) / 100;
    }
    
    setCouponDiscount(discount);
    setAppliedCoupon(coupon);
    toast({
        title: "Coupon Applied",
        description: `You've saved ${formatCurrency(discount)}!`
    });
  };
  
   const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponDiscount(0);
    setCouponError(null);
    toast({
        title: 'Coupon Removed',
        variant: 'destructive',
    });
  };


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
        fullName: customerInfo.fullName,
        address: customerInfo.address,
        district: customerInfo.district,
        area: customerInfo.area,
        mobileNumber: customerInfo.mobileNumber,
        email: customerInfo.email,
      },
      items: cartItems.map(item => ({
        id: item.product.id,
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subTotal: subTotal,
      shippingCost: shippingCost,
      shippingZone: shippingZone,
      discount: couponDiscount,
      couponCode: appliedCoupon?.code || null,
      total: grandTotal,
      status: "Processing",
      createdAt: new Date(),
      userId: user?.uid || null,
      paymentMethod,
    };

    try {
        await saveOrder(firestore, orderId, orderData);

        toast({
            title: "Order Placed!",
            description: "Thank you for your purchase. Redirecting...",
        });

        // Don't clear cart here, do it on confirmation page
        router.push(`/order-confirmation?orderId=${orderId}`);

    } catch (error) {
        console.error("Failed to place order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
        });
    }
  }

  const selectedDistrict = locations.find(loc => loc.district === customerInfo.district);

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-headline text-4xl font-bold mb-8 text-center">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-6">
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
                      <Label htmlFor="district">District/Zilla</Label>
                      <Select onValueChange={(value) => handleSelectChange('district', value)} value={customerInfo.district} required>
                          <SelectTrigger id="district">
                              <SelectValue placeholder="Select a District/Zilla" />
                          </SelectTrigger>
                          <SelectContent>
                              {locations.map(loc => (
                                  <SelectItem key={loc.district} value={loc.district}>{loc.district}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="area">Area</Label>
                      <Select onValueChange={(value) => handleSelectChange('area', value)} value={customerInfo.area} required disabled={!customerInfo.district}>
                          <SelectTrigger id="area">
                              <SelectValue placeholder="Select an Area" />
                          </SelectTrigger>
                          <SelectContent>
                             {selectedDistrict?.areas.map(area => (
                                 <SelectItem key={area} value={area}>{area}</SelectItem>
                             ))}
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
          </Card>
          <Card>
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
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {cartItems.map(item => (
                        <div key={item.product.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Image src={item.product.imageUrls?.[0] || item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p>{formatCurrency(item.product.price * item.quantity)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="coupon-code">Have a Coupon?</Label>
                        <div className="flex space-x-2">
                            <Input 
                                id="coupon-code" 
                                placeholder="Enter coupon code" 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                disabled={!!appliedCoupon}
                            />
                             {appliedCoupon ? (
                                <Button type="button" variant="destructive" onClick={handleRemoveCoupon}>Remove</Button>
                            ) : (
                                <Button type="button" onClick={handleApplyCoupon}>Apply</Button>
                            )}
                        </div>
                        {couponError && <p className="text-sm text-destructive">{couponError}</p>}
                    </div>

                    <Separator />
                    <div className="flex justify-between">
                        <p>Subtotal</p>
                        <p>{formatCurrency(subTotal)}</p>
                    </div>
                     <div className="flex justify-between">
                        <p>Shipping ({shippingZone || 'Select district'})</p>
                        <p>{formatCurrency(shippingCost)}</p>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-primary">
                            <p>Discount ({appliedCoupon.code})</p>
                            <p>-{formatCurrency(couponDiscount)}</p>
                        </div>
                    )}
                    <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <p>Total</p>
                        <p>{formatCurrency(grandTotal)}</p>
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




