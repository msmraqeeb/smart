
'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getAttributes } from '@/lib/data';
import type { Attribute } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

function AdminAttributesPage() {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();

    const fetchAttributes = () => {
        getAttributes().then(setAttributes);
    };

    useEffect(() => {
        fetchAttributes();
    }, []);
    
    const handleDelete = async () => {
        if (!attributeToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, "attributes", attributeToDelete.id));
            toast({
                title: "Attribute Deleted",
                description: `"${attributeToDelete.name}" has been successfully deleted.`,
            });
            setAttributeToDelete(null);
            fetchAttributes();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting attribute",
                description: "There was a problem deleting the attribute. Please try again.",
            });
        }
    };

    return (
        <div>
            <AlertDialog open={!!attributeToDelete} onOpenChange={(open) => !open && setAttributeToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the attribute
                            "{attributeToDelete?.name}". Products using this may be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex justify-between items-center mb-6">
                <div>
                   {/* Title is now in the layout header */}
                </div>
                <Button asChild>
                    <Link href="/admin/attributes/new">Add New Attribute</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Attributes</CardTitle>
                    <CardDescription>Manage global attributes like Color or Size for your products.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Values</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attributes.map(attribute => (
                                <TableRow key={attribute.id}>
                                    <TableCell className='font-semibold'>{attribute.name}</TableCell>
                                    <TableCell>
                                        <div className='flex flex-wrap gap-1'>
                                            {attribute.values.map(value => (
                                                <Badge key={value} variant='secondary'>{value}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/attributes/edit/${attribute.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setAttributeToDelete(attribute)}
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
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminAttributesPage);
