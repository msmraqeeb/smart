
'use client';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getCategories } from '@/lib/data';
import type { Category } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


function AdminCategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
    const firestore = useFirestore();
    const { toast } = useToast();

    const fetchCategories = () => {
        getCategories().then(setCategories);
    };

    useEffect(() => {
        fetchCategories();
    }, []);
    
    const handleDelete = async () => {
        if (!categoryToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, "categories", categoryToDelete.id));
            toast({
                title: "Category Deleted",
                description: `"${categoryToDelete.name}" has been successfully deleted.`,
            });
            setCategoryToDelete(null);
            fetchCategories(); // Refetch categories after deletion
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting category",
                description: "There was a problem deleting the category. Please try again.",
            });
        }
    };

    const sortedCategories = useMemo(() => {
        const categoryMap = new Map(categories.map(c => [c.id, { ...c, children: [] as Category[] }]));
        const topLevelCategories: (Category & { children: Category[] })[] = [];

        categories.forEach(category => {
            if (category.parentId && categoryMap.has(category.parentId)) {
                categoryMap.get(category.parentId)?.children.push(categoryMap.get(category.id)!);
            } else {
                topLevelCategories.push(categoryMap.get(category.id)!);
            }
        });

        const flattened: Category[] = [];
        const flatten = (cats: (Category & { children: Category[] })[], depth = 0) => {
            cats.sort((a, b) => a.name.localeCompare(b.name));
            for (const cat of cats) {
                flattened.push({ ...cat, name: `${'— '.repeat(depth)}${cat.name}` });
                if (cat.children.length > 0) {
                    flatten(cat.children, depth + 1);
                }
            }
        };

        flatten(topLevelCategories);
        return flattened;
    }, [categories]);


    return (
        <div>
            <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the category
                            "{categoryToDelete?.name}". This may also affect products within this category.
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
                    <Link href="/admin/categories/new">Add New Category</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Categories</CardTitle>
                    <CardDescription>View, edit, or delete product categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedCategories.map(category => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <Image
                                            src={category.imageUrl}
                                            alt={category.name}
                                            width={40}
                                            height={40}
                                            data-ai-hint={category.imageHint}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.slug}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/categories/edit/${category.id}`}>Edit</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setCategoryToDelete(category)}
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

export default withAdminAuth(AdminCategoriesPage);
