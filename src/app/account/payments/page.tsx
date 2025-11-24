'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Payments</CardTitle>
                <CardDescription>Manage your payment methods and view transaction history.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <CreditCard className="mx-auto h-16 w-16 text-muted-foreground/30" />
                    <p className="mt-4">You have no saved payment methods.</p>
                    <p className="text-sm">Payment methods will be available to save during checkout.</p>
                </div>
            </CardContent>
        </Card>
    );
}
