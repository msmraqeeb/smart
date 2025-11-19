'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useAuth, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";

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

    const usersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: orders, loading: ordersLoading } = useCollection(ordersCollection);
    const { data: userProfiles, loading: usersLoading } = useCollection(usersCollection);

    const users = React.useMemo(() => {
        if (!orders && !userProfiles) return [];
        
        const userMap = new Map<string, User>();

        // Add admin user first
        userMap.set('admin@email.com', { 
            id: 'admin_user', 
            name: 'Admin User', 
            email: 'admin@email.com', 
            joinDate: 'N/A', 
            role: 'Admin' 
        });

        // Process users from user profiles (users who have saved addresses)
        userProfiles?.forEach((profile: any) => {
             // A real app would have email on the user profile object
            const userEmail = profile.billingAddress?.email || profile.shippingAddress?.email || `${profile.id.substring(0,5)}@example.com`;
            if (!userMap.has(userEmail)) {
                 userMap.set(userEmail, {
                    id: profile.id,
                    name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                    email: userEmail,
                    joinDate: 'N/A', // Join date isn't stored on profile, would need backend logic
                    role: 'Customer',
                });
            }
        });

        // Process users from orders, adding or updating info
        orders?.forEach((order: any) => {
            const customerEmail = order.customer?.email;
            if (customerEmail) {
                const existingUser = userMap.get(customerEmail);
                if (existingUser) {
                    // If user exists, update join date if it's from an earlier order
                     const orderDate = order.createdAt?.toDate();
                     if (orderDate && (existingUser.joinDate === 'N/A' || new Date(existingUser.joinDate) > orderDate)) {
                        userMap.set(customerEmail, { ...existingUser, joinDate: orderDate.toLocaleDateString() });
                    }
                } else {
                     // Add new user from order if not present
                    userMap.set(customerEmail, {
                        id: order.userId || customerEmail,
                        name: order.customer.fullName,
                        email: customerEmail,
                        joinDate: order.createdAt?.toDate().toLocaleDateString() || 'N/A',
                        role: 'Customer',
                    });
                }
            }
        });

        return Array.from(userMap.values());

    }, [orders, userProfiles]);

    const loading = ordersLoading || usersLoading;

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
                                    <TableHead>Joined</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.id.substring(0,8)}</TableCell>
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