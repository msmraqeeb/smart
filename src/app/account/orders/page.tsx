'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import { useCollection, useAuth, useFirestore } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountOrdersPage() {
    const firestore = useFirestore();
    const { user } = useAuth();
    
    const ordersCollection = React.useMemo(() => {
        if (!firestore || !user) return null;
        return query(
          collection(firestore, 'orders'),
          where('userId', '==', user.uid)
        );
    }, [firestore, user]);

    const { data: orders, loading } = useCollection(ordersCollection);

    if (loading) {
        return <p>Loading orders...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Orders</CardTitle>
                <CardDescription>View the history of your purchases.</CardDescription>
            </CardHeader>
            <CardContent>
                 {orders && orders.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                    <TableCell>{formatCurrency(order.total)}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={
                                                order.status === 'Shipped' ? 'default' : 
                                                order.status === 'Processing' ? 'secondary' :
                                                order.status === 'Delivered' ? 'outline' :
                                                'destructive'
                                            }
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                     <TableCell>
                                        <Button asChild variant="outline" size="sm">
                                            <Link href={`/account/orders/${order.id}`}>
                                                View Order
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>You haven't placed any orders yet.</p>
                        <Button asChild className="mt-4">
                            <Link href="/products">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
