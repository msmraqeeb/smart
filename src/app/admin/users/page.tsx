'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockUsers = [
    { id: "USR001", name: "John Doe", email: "john.doe@example.com", joinDate: "2023-01-15", role: "Customer" },
    { id: "USR002", name: "Jane Smith", email: "jane.smith@example.com", joinDate: "2023-02-20", role: "Customer" },
    { id: "USR003", name: "Admin User", email: "admin@email.com", joinDate: "2023-01-01", role: "Admin" },
    { id: "USR004", name: "Bob Johnson", email: "bob.j@example.com", joinDate: "2023-05-10", role: "Customer" },
];

function AdminUsersPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="font-headline text-4xl font-bold mb-8">Manage Users</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Users</CardTitle>
                    <CardDescription>View and manage user accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.id}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminUsersPage);