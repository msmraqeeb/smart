
'use client';
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/utils';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import withAdminAuth from '@/components/withAdminAuth';
import { MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { doc, deleteDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Helper function to get all descendant category slugs
const getDescendantCategorySlugs = (
    parentSlug: string,
    allCategories: Category[]
): string[] => {
  const parentCategory = allCategories.find((c) => c.slug === parentSlug);
  if (!parentCategory) {
    return [parentSlug];
  }

  let slugsToFilter = [parentSlug];
  const childrenToProcess: string[] = [parentCategory.id];
  
  while (childrenToProcess.length > 0) {
    const currentParentId = childrenToProcess.shift();
    const children = allCategories.filter((c) => c.parentId === currentParentId);
    for (const child of children) {
      slugsToFilter.push(child.slug);
      childrenToProcess.push(child.id);
    }
  }

  return slugsToFilter;
};

function AdminProductsPage() {
    const [allProducts, setAllProducts] = React.useState<Product[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortOrder, setSortOrder] = useState('created-desc');

    const { toast } = useToast();
    const firestore = useFirestore();

    const fetchProductsAndCategories = () => {
        setLoading(true);
        Promise.all([getProducts(), getCategories()]).then(([products, categoriesData]) => {
            const sorted = products.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return bTime - aTime;
            });
            setAllProducts(sorted);
            setCategories(categoriesData);
            setLoading(false);
        });
    }

    React.useEffect(() => {
        fetchProductsAndCategories();
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
            fetchProductsAndCategories(); // Refetch products
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Error deleting product",
                description: "There was a problem deleting the product. Please try again.",
            });
        }
    };
    
    const filteredAndSortedProducts = useMemo(() => {
        let products = [...allProducts];

        // Filter by category
        if (selectedCategory && selectedCategory !== 'all') {
            const categorySlugsToFilter = getDescendantCategorySlugs(selectedCategory, categories);
            products = products.filter(p => categorySlugsToFilter.includes(p.category));
        }

        // Filter by search query (name)
        if (searchQuery) {
            products = products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sort products
        switch (sortOrder) {
            case 'price-asc':
                products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
                break;
            case 'price-desc':
                products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
                break;
            case 'created-desc':
            default:
                // Already sorted by date descending on fetch
                break;
        }

        return products;
    }, [allProducts, searchQuery, selectedCategory, sortOrder, categories]);

    const sortedCategoriesForFilter = useMemo(() => {
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  {/* Title is now in the layout header */}
                </div>
                <Button asChild>
                    <Link href="/admin/products/new">Add New Product</Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>View, edit, or delete products from the store.</CardDescription>
                     <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Filter by name..."
                                className="pl-8 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Filter by category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {sortedCategoriesForFilter.map(cat => (
                                    <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={sortOrder} onValueChange={setSortOrder}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="created-desc">Newest</SelectItem>
                                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Image</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className='text-right'>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading products...</TableCell>
                                </TableRow>
                            ) : filteredAndSortedProducts.length > 0 ? (
                                filteredAndSortedProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image 
                                            src={product.imageUrls?.[0] || product.imageUrl}
                                            alt={product.name}
                                            width={40}
                                            height={40}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.sku || 'N/A'}</TableCell>
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
                            ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No products found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

export default withAdminAuth(AdminProductsPage);
