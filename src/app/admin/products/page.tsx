
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/utils';
import { getProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';

function AdminProductsPage() {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const { toast } = useToast();
    const firestore = useFirestore();

    const fetchProducts = () => {
        getProducts().then(setProducts);
    }

    React.useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async () => {
        if (!productToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, "products", productToDelete.id));
            toast({
                title: "Product Deleted",
                description: `"${productToDelete.name}" has been successfully deleted.`,
            });
            setProductToDelete(null);
            fetchProducts();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting product",
                description: "There was a problem deleting the product. Please try again.",
            });
        }
    };


    return (
        <div className="container mx-auto px-4 py-8">
             <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                            "{productToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex justify-between items-center mb-8">
                <h1 className="font-headline text-4xl font-bold">Manage Products</h1>
                <Button asChild>
                    <Link href="/admin/products/new">Add New Product</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>View, edit, or delete products from the store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image 
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.id.substring(0,8)}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell className="capitalize">{product.category}</TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell className='text-right'>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setProductToDelete(product)}
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

export default withAdminAuth(AdminProductsPage);
