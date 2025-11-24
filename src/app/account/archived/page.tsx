'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Archive } from "lucide-react";

export default function ArchivedOrdersPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Archived Orders</CardTitle>
                <CardDescription>View your past archived orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-8">
                    <Archive className="mx-auto h-16 w-16 text-muted-foreground/30" />
                    <p className="mt-4">You have no archived orders.</p>
                </div>
            </CardContent>
        </Card>
    );
}
