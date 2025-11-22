
'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCollection, useFirestore, useAuth } from "@/firebase";
import { collection, doc, deleteDoc, type Firestore } from "firebase/firestore";
import React from "react";
import Link from "next/link";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import { deleteUser as deleteAuthUser } from '@/ai/flows/delete-user';


type User = {
    id: string;
    name: string;
    email: string;
    joinDate: string;
    role: string;
};

const deleteUserDocument = (db: Firestore, userId: string) => {
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
    const { auth } = useAuth();
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
        if (!userProfiles || !orders) return [];
    
        const userMap = new Map<string, User>();
    
        // Hardcode admin user
        userMap.set('admin_user', {
            id: 'admin_user',
            name: 'Admin User',
            email: 'admin@email.com',
            joinDate: 'N/A',
            role: 'Admin',
        });

        // Add users from user profiles (this covers users who've signed up and saved an address but not ordered)
        userProfiles.forEach((profile: any) => {
            if (!profile.id) return;
            const joinDate = profile.createdAt?.toDate().toLocaleDateString() || 'N/A';
            userMap.set(profile.id, {
                id: profile.id,
                name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                email: 'N/A', // Email is not in the profile, will be filled by orders
                joinDate: joinDate,
                role: 'Customer',
            });
        });
    
        // Add/update users from orders, as they are a primary data source for email and name
        orders.forEach((order: any) => {
            if (order.userId) {
                const joinDate = order.createdAt?.toDate().toLocaleDateString() || 'N/A';
                const existingUser = userMap.get(order.userId);

                if (existingUser) {
                    // If user exists, update their info if it's missing
                    if (!existingUser.name || existingUser.name === 'N/A') {
                        existingUser.name = order.customer.fullName;
                    }
                    if (!existingUser.email || existingUser.email === 'N/A') {
                        existingUser.email = order.customer.email;
                    }
                } else {
                    // If user doesn't exist, create them
                     userMap.set(order.userId, {
                        id: order.userId,
                        name: order.customer.fullName,
                        email: order.customer.email,
                        joinDate: joinDate,
                        role: 'Customer',
                    });
                }
            }
        });
        
        return Array.from(userMap.values());

    }, [orders, userProfiles]);
    
    const handleDelete = async () => {
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
        
        try {
            // Delete from Firebase Auth (simulated)
            await deleteAuthUser({ uid: userToDelete.id });

            // Delete from Firestore 'users' collection
            deleteUserDocument(firestore, userToDelete.id);
            
            toast({
                title: 'User Deleted',
                description: `${userToDelete.name} has been deleted from Authentication and Firestore.`
            });
        } catch(e: any) {
            toast({
                variant: 'destructive',
                title: 'Error deleting user',
                description: e.message || 'Could not delete user.'
            });
        } finally {
            setUserToDelete(null);
        }
    }

    const loading = ordersLoading || usersLoading;

    return (
        <div>
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user account for '{userToDelete?.name}' and all associated data (profile, etc.). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

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
