'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState, useEffect, useMemo } from "react";
import { useAuth, useFirestore, useDoc } from "@/firebase";
import { doc, setDoc, type Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

type Address = {
    name: string;
    address: string;
    mobile: string;
};

const defaultAddress: Address = {
    name: '',
    address: '',
    mobile: ''
};

const saveUserAddresses = (db: Firestore, userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  setDoc(userRef, data, { merge: true })
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
};

export default function AccountAddressesPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const userProfileRef = useMemo(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, loading } = useDoc(userProfileRef);

    const [billingAddress, setBillingAddress] = useState<Address>(defaultAddress);
    const [shippingAddress, setShippingAddress] = useState<Address>(defaultAddress);

    const [editBilling, setEditBilling] = useState(false);
    const [editShipping, setEditShipping] = useState(false);

    const [tempBilling, setTempBilling] = useState<Address>(billingAddress);
    const [tempShipping, setTempShipping] = useState<Address>(shippingAddress);

    useEffect(() => {
        if (userProfile) {
            setBillingAddress(userProfile.billingAddress || defaultAddress);
            setShippingAddress(userProfile.shippingAddress || defaultAddress);
            setTempBilling(userProfile.billingAddress || defaultAddress);
            setTempShipping(userProfile.shippingAddress || defaultAddress);
        }
    }, [userProfile]);

    const handleSaveBilling = () => {
        if (!firestore || !user) return;
        saveUserAddresses(firestore, user.uid, { billingAddress: tempBilling });
        setBillingAddress(tempBilling);
        setEditBilling(false);
        toast({ title: "Billing address saved!" });
    };

    const handleCancelBilling = () => {
        setTempBilling(billingAddress);
        setEditBilling(false);
    };
    
    const handleSaveShipping = () => {
        if (!firestore || !user) return;
        saveUserAddresses(firestore, user.uid, { shippingAddress: tempShipping });
        setShippingAddress(tempShipping);
        setEditShipping(false);
        toast({ title: "Shipping address saved!" });
    };

    const handleCancelShipping = () => {
        setTempShipping(shippingAddress);
        setEditShipping(false);
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Addresses</CardTitle>
                    <CardDescription>Manage your shipping and billing addresses.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Loading addresses...</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Billing address</CardTitle>
                        {!editBilling && <Button variant="link" className="p-0 h-auto" onClick={() => { setTempBilling(billingAddress); setEditBilling(true); }}>Edit</Button>}
                    </CardHeader>
                    {editBilling ? (
                        <>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="billingName">Full Name</Label>
                                    <Input id="billingName" value={tempBilling.name} onChange={(e) => setTempBilling({...tempBilling, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingAddress">Address</Label>
                                    <Input id="billingAddress" value={tempBilling.address} onChange={(e) => setTempBilling({...tempBilling, address: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="billingMobile">Mobile Number</Label>
                                    <Input id="billingMobile" type="tel" value={tempBilling.mobile} onChange={(e) => setTempBilling({...tempBilling, mobile: e.target.value})} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={handleCancelBilling}>Cancel</Button>
                                <Button onClick={handleSaveBilling}>Save</Button>
                            </CardFooter>
                        </>
                    ) : (
                        <CardContent>
                            {billingAddress.name ? (
                                <address className="not-italic text-muted-foreground">
                                    {billingAddress.name}<br/>
                                    {billingAddress.address}<br/>
                                    {billingAddress.mobile}
                                </address>
                            ) : (
                                <p className="text-muted-foreground">You have not set up a billing address yet.</p>
                            )}
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Shipping address</CardTitle>
                         {!editShipping && <Button variant="link" className="p-0 h-auto" onClick={() => { setTempShipping(shippingAddress); setEditShipping(true); }}>Edit</Button>}
                    </CardHeader>
                     {editShipping ? (
                        <>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="shippingName">Full Name</Label>
                                    <Input id="shippingName" value={tempShipping.name} onChange={(e) => setTempShipping({...tempShipping, name: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shippingAddress">Address</Label>
                                    <Input id="shippingAddress" value={tempShipping.address} onChange={(e) => setTempShipping({...tempShipping, address: e.target.value})} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="shippingMobile">Mobile Number</Label>
                                    <Input id="shippingMobile" type="tel" value={tempShipping.mobile} onChange={(e) => setTempShipping({...tempShipping, mobile: e.target.value})} />
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2">
                                <Button variant="ghost" onClick={handleCancelShipping}>Cancel</Button>
                                <Button onClick={handleSaveShipping}>Save</Button>
                            </CardFooter>
                        </>
                    ) : (
                        <CardContent>
                             {shippingAddress.name ? (
                                <address className="not-italic text-muted-foreground">
                                    {shippingAddress.name}<br/>
                                    {shippingAddress.address}<br/>
                                    {shippingAddress.mobile}
                                </address>
                             ) : (
                                <p className="text-muted-foreground">You have not set up a shipping address yet.</p>
                             )}
                        </CardContent>
                    )}
                </Card>
            </CardContent>
        </Card>
    );
}
