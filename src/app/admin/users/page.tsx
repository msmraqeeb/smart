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

    const { data: orders, loading: ordersLoading } = useCollection(ordersCollection);
    const { data: userProfiles, loading: usersLoading } = useCollection(usersCollection);

    const users = React.useMemo(() => {
        if (!userProfiles && !orders) return [];

        const userMap = new Map<string, User>();
        const deletedUserIds = new Set<string>();

        // Identify deleted users first (present in orders but not in profiles)
        const profileIds = new Set(userProfiles?.map(p => p.id));
        orders?.forEach((order: any) => {
            if (order.userId && !profileIds.has(order.userId)) {
                 // This check is important. If a user exists in orders but not in profiles,
                 // it might be a new user who hasn't saved an address yet.
                 // We only consider them 'deleted' if they *once* had a profile.
                 // For this logic, we will assume if they are not in userProfiles they might be deleted
                 // or just haven't saved a profile. The current structure makes it hard to be certain.
                 // A better approach would be a `deleted` flag.
                 // For now, we'll rely on the `userProfiles` as the source of truth for active users.
            }
        });

        // Add admin user
        userMap.set('admin_user', { 
            id: 'admin_user', 
            name: 'Admin User', 
            email: 'admin@email.com', 
            joinDate: 'N/A', 
            role: 'Admin' 
        });

        // Process users from user profiles
        userProfiles?.forEach((profile: any) => {
            userMap.set(profile.id, {
                id: profile.id,
                name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                email: 'N/A', // Will be updated from orders if available
                joinDate: 'N/A', 
                role: 'Customer',
            });
        });

        // Process users from orders, adding or updating info
        orders?.forEach((order: any) => {
            if (order.userId) {
                const existingUser = userMap.get(order.userId);
                if (existingUser) {
                    // Update user with info from their most recent order if it's more complete
                    if (order.customer.email && (existingUser.email === 'N/A' || !existingUser.email)) {
                        existingUser.email = order.customer.email;
                    }
                    if (order.customer.fullName && (existingUser.name === 'N/A' || !existingUser.name)) {
                        existingUser.name = order.customer.fullName;
                    }
                    const orderDate = order.createdAt?.toDate();
                    if (orderDate) {
                        const existingDate = existingUser.joinDate === 'N/A' ? null : new Date(existingUser.joinDate);
                        if (!existingDate || orderDate < existingDate) {
                            existingUser.joinDate = orderDate.toLocaleDateString();
                        }
                    }
                } else if (!userMap.has(order.userId)) {
                    // This user only exists in orders, create a record for them
                     userMap.set(order.userId, {
                        id: order.userId,
                        name: order.customer.fullName,
                        email: order.customer.email,
                        joinDate: order.createdAt?.toDate().toLocaleDateString() || 'N/A',
                        role: 'Customer',
                    });
                }
            }
        });

        // If userProfiles are loaded, only show users that are in that list (plus admin)
        if (userProfiles) {
            const activeUserIds = new Set(userProfiles.map(p => p.id));
            activeUserIds.add('admin_user');
            
            const filteredUsers: User[] = [];
            userMap.forEach((user, id) => {
                if (activeUserIds.has(id)) {
                    filteredUsers.push(user);
                }
            });
            return filteredUsers;
        }

        return Array.from(userMap.values());

    }, [orders, userProfiles]);
    
    const handleDelete = () => {
        if (!userToDelete || !firestore) return;

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
