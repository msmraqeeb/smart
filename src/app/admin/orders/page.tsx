'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import withAdminAuth from '@/components/withAdminAuth';
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection } from "firebase/firestore";
import { useFirestore } from "@/firebase";

function AdminOrdersPage() {
    const firestore = useFirestore();
    const { data: orders, loading } = useCollection(firestore ? collection(firestore, 'orders') : null);

    if (loading) {
        return <div className="container mx-auto px-4 py-8">Loading orders...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-headline text-4xl font-bold mb-8">Manage Orders</h1>
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
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders?.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium truncate max-w-xs">{order.id}</TableCell>
                                    <TableCell>{order.customer.firstName} {order.customer.lastName}</TableCell>
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
