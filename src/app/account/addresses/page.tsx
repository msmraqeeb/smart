'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AccountAddressesPage() {
    // This is a placeholder. In a real app, you would fetch and display user addresses.
    const addresses = [
        {
            type: 'Billing address',
            name: 'John Doe',
            address: '123 Main St, Anytown, USA 12345'
        },
        {
            type: 'Shipping address',
            name: 'John Doe',
            address: '123 Main St, Anytown, USA 12345'
        }
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Addresses</CardTitle>
                <CardDescription>Manage your shipping and billing addresses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
               {addresses.map(addr => (
                    <Card key={addr.type}>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">{addr.type}</CardTitle>
                            <Button variant="link" className="p-0 h-auto">Edit</Button>
                        </CardHeader>
                        <CardContent>
                            <address className="not-italic text-muted-foreground">
                                {addr.name}<br/>
                                {addr.address}
                            </address>
                        </CardContent>
                    </Card>
               ))}
            </CardContent>
        </Card>
    );
}
