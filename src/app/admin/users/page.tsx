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
import { onIdTokenChanged, type User as AuthUser } from "firebase/auth";


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

        // Add users from profiles (users who have saved an address)
        userProfiles.forEach((profile: any) => {
            const creationTime = auth?.currentUser?.metadata?.creationTime;
            userMap.set(profile.id, {
                id: profile.id,
                name: profile.billingAddress?.name || profile.shippingAddress?.name || 'N/A',
                email: 'N/A',
                joinDate: creationTime ? new Date(creationTime).toLocaleDateString() : 'N/A',
                role: 'Customer',
            });
        });

        // Add/update users from orders
        orders.forEach((order: any) => {
            if (order.userId) {
                const existingUser = userMap.get(order.userId);
                if (existingUser) {
                    // If email is missing, update it from order
                    if (order.customer.email && (existingUser.email === 'N/A' || !existingUser.email)) {
                        existingUser.email = order.customer.email;
                    }
                     // If name is missing, update it from order
                    if (order.customer.fullName && (existingUser.name === 'N/A' || !existingUser.name)) {
                        existingUser.name = order.customer.fullName;
                    }
                } else {
                    // This will add users who have ordered but might not have a profile saved
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
        
        // This is the final, permanent fix:
        // We ensure that we are not filtering out any user that exists in our userMap,
        // which now correctly contains users from all sources.
        return Array.from(userMap.values());

    }, [orders, userProfiles, auth]);
    
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
            // Delete from Firebase Auth
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
        <div className="container mx-auto px-4 py-8">
            <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the user account and all associated data (profile, etc.). This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete User</AlertDialogAction>
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
