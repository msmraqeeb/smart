'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import React from "react";

type User = {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    role: string;
};

function AdminUsersPage() {
    const firestore = useFirestore();
    const ordersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'orders');
    }, [firestore]);

    const { data: orders, loading } = useCollection(ordersCollection);

    const users = React.useMemo(() => {
        if (!orders) return [];
        
        const customerMap = new Map<string, User>();

        orders.forEach((order: any) => {
            const customerEmail = order.customer?.email;
            if (customerEmail && !customerMap.has(customerEmail)) {
                customerMap.set(customerEmail, {
                    id: order.userId || customerEmail,
                    name: order.customer.fullName,
                    email: customerEmail,
                    joinDate: order.createdAt?.toDate().toLocaleDateString() || 'N/A',
                    role: customerEmail === 'admin@email.com' ? 'Admin' : 'Customer',
                });
            }
        });

        // Add admin user if not already in the list from orders
        if (!customerMap.has('admin@email.com')) {
             customerMap.set('admin@email.com', { 
                id: 'admin_user', 
                name: 'Admin User', 
                email: 'admin@email.com', 
                joinDate: 'N/A', 
                role: 'Admin' 
            });
        }

        return Array.from(customerMap.values());

    }, [orders]);


    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-headline text-4xl font-bold mb-8">Manage Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage user accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading users...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>First Order</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.id.substring(0,6)}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.joinDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminUsersPage);
