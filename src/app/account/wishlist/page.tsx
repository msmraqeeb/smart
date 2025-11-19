
'use client';

import { useWishlist } from "@/context/wishlist-context";
import { ProductCard } from "@/components/product-card";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WishlistPage() {
    const { wishlistItems } = useWishlist();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Wishlist</CardTitle>
                <CardDescription>Products you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {wishlistItems.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
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
