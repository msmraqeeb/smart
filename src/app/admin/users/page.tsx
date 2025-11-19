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
            // Placeholder email, might be overwritten by order data
            const userEmail = `${profile.id.substring(0,8)}@example.com`;
            if (!userMap.has(profile.id)) {
                 userMap.set(profile.id, {
                    id: profile.id,
                    name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                    email: userEmail, // This might be a placeholder
                    joinDate: 'N/A', 
                    role: 'Customer',
                });
            }
        });

        // Process users from orders, adding or updating info
        orders?.forEach((order: any) => {
            const customerEmail = order.customer?.email;
            const userId = order.userId;

            if (userId) {
                const existingUser = userMap.get(userId);
                if (existingUser) {
                    // Update existing user with more accurate info from order
                    const orderDate = order.createdAt?.toDate();
                    const updatedUser = { ...existingUser };

                    if (customerEmail) {
                        updatedUser.email = customerEmail;
                    }
                     if (order.customer.fullName && (updatedUser.name === 'N/A' || !updatedUser.name)) {
                        updatedUser.name = order.customer.fullName;
                    }

                    if (orderDate && (updatedUser.joinDate === 'N/A' || new Date(updatedUser.joinDate) > orderDate)) {
                        updatedUser.joinDate = orderDate.toLocaleDateString();
                    }
                    userMap.set(userId, updatedUser);

                } else if(customerEmail) {
                     // Add new user from order if not present in profiles
                    userMap.set(userId, {
                        id: userId,
                        name: order.customer.fullName,
                        email: customerEmail,
                        joinDate: order.createdAt?.toDate().toLocaleDateString() || 'N/A',
                        role: 'Customer',
                    });
                }
            }
        });

        // Re-key by email to remove duplicates from profiles that now have a real email from orders
        const finalUserMap = new Map<string, User>();
        userMap.forEach(user => {
            // The admin user doesn't have a normal UID, so we key it by its email
            const key = user.role === 'Admin' ? user.email : user.id;
            // Prioritize users who have a real email and name
            const existing = finalUserMap.get(key);
            if (!existing || (user.email.includes('@') && !existing.email.includes('@'))) {
                finalUserMap.set(key, user);
            }
        });


        return Array.from(finalUserMap.values());

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
