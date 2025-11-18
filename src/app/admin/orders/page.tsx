'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from '@/lib/utils';
import withAdminAuth from '@/components/withAdminAuth';

const mockOrders = [
    { id: "ORD001", customer: "John Doe", date: "2023-10-26", total: 45.98, status: "Shipped" },
    { id: "ORD002", customer: "Jane Smith", date: "2023-10-25", total: 12.50, status: "Processing" },
    { id: "ORD003", customer: "Bob Johnson", date: "2023-10-24", total: 124.00, status: "Delivered" },
    { id: "ORD004", customer: "Alice Williams", date: "2023-10-23", total: 8.99, status: "Cancelled" },
];

function AdminOrdersPage() {
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
                            {mockOrders.map(order => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.customer}</TableCell>
                                    <TableCell>{order.date}</TableCell>
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