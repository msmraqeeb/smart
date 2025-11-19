'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore } from "@/firebase";
import { collection, doc, deleteDoc, type Firestore } from "firebase/firestore";
import React from "react";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

type User = {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    role: string;
};

const deleteUser = (db: Firestore, userId: string) => {
    const userRef = doc(db, 'users', userId);
    deleteDoc(userRef)
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
}

function AdminUsersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const [userToDelete, setUserToDelete] = React.useState<User | null>(null);
    
    const ordersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'orders');
    }, [firestore]);

    const usersCollection = React.useMemo(() => {
        if (!firestore) return null;
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: orders, loading: ordersLoading, error: ordersError } = useCollection(ordersCollection);
    const { data: userProfiles, loading: usersLoading, error: usersError } = useCollection(usersCollection);

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
            const userEmail = `${profile.id.substring(0,8)}@example.com`; // Placeholder
            if (!userMap.has(profile.id)) {
                 userMap.set(profile.id, {
                    id: profile.id,
                    name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                    email: userEmail,
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
        
        const finalUserMap = new Map<string, User>();
        userMap.forEach(user => {
            const key = user.role === 'Admin' ? user.email : user.id;
            const existing = finalUserMap.get(key);
            if (!existing || (user.email.includes('@') && !existing.email.includes('@'))) {
                 finalUserMap.set(key, user);
            } else if (existing && !existing.email.includes('@') && user.email.includes('@')) {
                 finalUserMap.set(key, user);
            }
        });


        return Array.from(finalUserMap.values());

    }, [orders, userProfiles]);
    
    const handleDelete = () => {
        if (!userToDelete || !firestore) return;

        // Prevent deleting the admin user
        if (userToDelete.id === 'admin_user') {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'The admin user cannot be deleted.'
            });
            setUserToDelete(null);
            return;
        }
        
        deleteUser(firestore, userToDelete.id);
        
        toast({
            title: 'User Deleted',
            description: `${userToDelete.name} has been deleted.`
        });
        setUserToDelete(null);
    }

    const loading = ordersLoading || usersLoading;

    return (
        <div className="container mx-auto px-4 py-8">
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user's profile data (like saved addresses). It will not delete their orders. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
                                                    <Button variant="ghost" size="icon" disabled={user.id === 'admin_user'}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/users/${user.id}/edit`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => setUserToDelete(user)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
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
