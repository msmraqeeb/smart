'use client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/firebase";
import { updateProfile, updatePassword } from "firebase/auth";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AccountProfilePage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await updateProfile(user, { displayName: name });
            toast({ title: "Profile updated successfully!" });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error updating profile", description: error.message });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Passwords do not match" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ variant: "destructive", title: "Password must be at least 6 characters long" });
            return;
        }
        try {
            await updatePassword(user, newPassword);
            toast({ title: "Password updated successfully!" });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error updating password", description: "This is a sensitive operation and requires recent login. Please log out and log back in to change your password." });
        }
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Login & Security</CardTitle>
                    <CardDescription>Update your name, email, and password.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={email} disabled />
                             <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                        </div>
                         <div className="flex justify-end">
                            <Button type="submit">Save Name</Button>
                        </div>
                    </form>
                 </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password Change</CardTitle>
                </CardHeader>
                 <form onSubmit={handlePasswordChange}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit">Update Password</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
