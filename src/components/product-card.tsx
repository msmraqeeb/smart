
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { ShoppingCart, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  const isInWishlist = wishlistItems.some((item) => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const hasSalePrice = product.salePrice && product.salePrice > 0;
  const displayPrice = hasSalePrice ? product.salePrice : product.price;


  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.slug}`} className="block">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            data-ai-hint={product.imageHint}
            className="aspect-square w-full object-cover"
          />
        </Link>
        <Button 
          size="icon" 
          variant="ghost" 
          className="absolute top-2 right-2 rounded-full h-8 w-8 bg-background/70 hover:bg-background"
          onClick={handleWishlistToggle}
        >
          <Heart className={cn("h-4 w-4", isInWishlist ? "text-red-500 fill-red-500" : "text-muted-foreground")} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        {hasSalePrice && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md">
                SALE
            </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{product.brand}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <p className="text-lg font-semibold text-primary">{formatCurrency(displayPrice!)}</p>
            {hasSalePrice && (
                <p className="text-sm font-medium text-muted-foreground line-through">{formatCurrency(product.price)}</p>
            )}
          </div>
          <Button size="sm" onClick={() => addToCart(product, 1)} className="w-full sm:w-auto">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
