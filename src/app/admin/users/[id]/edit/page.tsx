'use client';

import { useRouter, useParams } from 'next/navigation';
import { useDoc } from '@/firebase';
import { doc, updateDoc, type Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import withAdminAuth from '@/components/withAdminAuth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const updateUserProfile = (db: Firestore, userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  updateDoc(userRef, data)
    .catch(async (serverError) => {
      const permissionError = new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: data,
      } satisfies SecurityRuleContext);
      errorEmitter.emit('permission-error', permissionError);
    });
};

function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { toast } = useToast();

  const firestore = useFirestore();
  const userProfileRef = React.useMemo(() => {
    if (!firestore || typeof id !== 'string') return null;
    return doc(firestore, 'users', id);
  }, [firestore, id]);

  const { data: initialProfile, loading } = useDoc(userProfileRef);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (initialProfile) {
      setUserProfile({
        name: initialProfile.billingAddress?.name || initialProfile.shippingAddress?.name || 'N/A',
        // In a real app, email would be stored on the user object itself. Here we just show it.
        email: 'user@example.com', // Placeholder, as email isn't in user profile
      });
    }
  }, [initialProfile]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userProfile) return;
    const { id, value } = e.target;
    setUserProfile({
      ...userProfile,
      [id]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || typeof id !== 'string' || !userProfile || !initialProfile) return;

    // Update both billing and shipping address names
    const updatedData = {
      ...initialProfile,
      billingAddress: {
        ...initialProfile.billingAddress,
        name: userProfile.name,
      },
      shippingAddress: {
        ...initialProfile.shippingAddress,
        name: userProfile.name,
      },
    };

    updateUserProfile(firestore, id, updatedData);

    toast({
      title: 'User Updated',
      description: `User profile for ${userProfile.name} has been updated.`,
    });
    router.push('/admin/users');
  };

  if (loading || !userProfile) {
    return <div>Loading...</div>;
  }
  
  if (id === 'admin_user') {
    return (
        <div className="container mx-auto px-4 py-8">
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="font-headline">Edit User</CardTitle>
                    <CardDescription>Cannot edit the default admin user.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" onClick={() => router.back()}>
                    Back to Users
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleSubmit}>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline">Edit User</CardTitle>
            <CardDescription>Update details for user ID: {id.substring(0,8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userProfile.name}
                onChange={handleProfileChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed from this panel.</p>
            </div>
             <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge variant="secondary">Customer</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

export default withAdminAuth(EditUserPage);
