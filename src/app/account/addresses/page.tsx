'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";

type Address = {
    name: string;
    address: string;
    mobile: string;
};

export default function AccountAddressesPage() {
    const [billingAddress, setBillingAddress] = useState<Address>({
        name: 'John Doe',
        address: '123 Main St, Anytown, USA 12345',
        mobile: '+1 (555) 123-4567'
    });
    const [shippingAddress, setShippingAddress] = useState<Address>({
        name: 'John Doe',
        address: '123 Main St, Anytown, USA 12345',
        mobile: '+1 (555) 555-5555'
    });

    const [editBilling, setEditBilling] = useState(false);
    const [editShipping, setEditShipping] = useState(false);

    const [tempBilling, setTempBilling] = useState<Address>(billingAddress);
    const [tempShipping, setTempShipping] = useState<Address>(shippingAddress);

    const handleSaveBilling = () => {
        setBillingAddress(tempBilling);
        setEditBilling(false);
    };

    const handleCancelBilling = () => {
        setTempBilling(billingAddress);
        setEditBilling(false);
    };
    
    const handleSaveShipping = () => {
        setShippingAddress(tempShipping);
        setEditShipping(false);
    };

    const handleCancelShipping = () => {
        setTempShipping(shippingAddress);
        setEditShipping(false);
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Addresses</CardTitle>
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
                            <address className="not-italic text-muted-foreground">
                                {billingAddress.name}<br/>
                                {billingAddress.address}<br/>
                                {billingAddress.mobile}
                            </address>
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
                            <address className="not-italic text-muted-foreground">
                                {shippingAddress.name}<br/>
                                {shippingAddress.address}<br/>
                                {shippingAddress.mobile}
                            </address>
                        </CardContent>
                    )}
                </Card>
            </CardContent>
        </Card>
    );
}
