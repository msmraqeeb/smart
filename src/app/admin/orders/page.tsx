
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import withAdminAuth from '@/components/withAdminAuth';
import { useCollection } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pencil } from "lucide-react";

function AdminOrdersPage() {
    const firestore = useFirestore();
    
    const ordersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: orders, loading } = useCollection(ordersCollection);

    if (loading) {
        return (
             <div>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>View and manage all customer orders.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map((order: any) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer?.fullName}</TableCell>
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
                                        <Button asChild variant="outline" size="icon">
                                            <Link href={`/admin/orders/${order.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                                <span className="sr-only">Edit Order</span>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminOrdersPage);
