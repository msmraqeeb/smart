'use client';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import withAdminAuth from '@/components/withAdminAuth';
import { Truck } from 'lucide-react';

function ShippingPage() {
    const [insideDhaka, setInsideDhaka] = useState('80');
    const [outsideDhaka, setOutsideDhaka] = useState('150');
    const { toast } = useToast();

    const handleSave = () => {
        // In a real app, you'd save this to a database.
        // For now, we'll just show a success message.
        console.log({
            insideDhakaCost: parseFloat(insideDhaka),
            outsideDhakaCost: parseFloat(outsideDhaka)
        });
        toast({
            title: "Settings Saved",
            description: "Shipping costs have been updated."
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Truck className="h-10 w-10 text-primary" />
                <div>
                    <h1 className="font-headline text-4xl font-bold">Shipping & Delivery</h1>
                    <p className="text-muted-foreground">Manage your shipping costs and methods.</p>
                </div>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>Shipping Costs</CardTitle>
                    <CardDescription>Set the delivery fees for different zones.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                        <div>
                            <Label htmlFor="inside-dhaka" className="font-semibold">Inside Dhaka</Label>
                            <p className="text-sm text-muted-foreground">Standard delivery charge for orders within Dhaka metropolitan area.</p>
                        </div>
                        <Input
                            id="inside-dhaka"
                            type="number"
                            value={insideDhaka}
                            onChange={(e) => setInsideDhaka(e.target.value)}
                            className="w-32"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                        <div>
                            <Label htmlFor="outside-dhaka" className="font-semibold">Outside Dhaka</Label>
                            <p className="text-sm text-muted-foreground">Standard delivery charge for orders outside of Dhaka.</p>
                        </div>
                        <Input
                            id="outside-dhaka"
                            type="number"
                            value={outsideDhaka}
                            onChange={(e) => setOutsideDhaka(e.target.value)}
                            className="w-32"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button onClick={handleSave}>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default withAdminAuth(ShippingPage);