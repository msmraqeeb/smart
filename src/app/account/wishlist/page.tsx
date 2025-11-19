
'use client';

import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
                <CardDescription>Products you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
                {wishlistItems.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Add to Cart</TableHead>
                                <TableHead className="text-right">Remove</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {wishlistItems.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="hidden md:table-cell">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={64}
                                            height={64}
                                            data-ai-hint={product.imageHint}
                                            className="rounded-md object-cover"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <Link href={`/products/${product.slug}`} className="hover:underline">
                                            {product.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            onClick={() => addToCart(product, 1)}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => removeFromWishlist(product.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove from wishlist</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <Heart className="mx-auto h-16 w-16 text-muted-foreground/30" />
                        <p className="mt-4">Your wishlist is empty.</p>
                        <p className="text-sm">Click the heart on a product to save it here.</p>
                        <Button asChild className="mt-4">
                            <Link href="/products">Find Products</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
