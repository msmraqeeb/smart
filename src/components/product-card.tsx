
'use client';

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  if (!product) return null;

  const hasSalePrice = product.salePrice && product.salePrice > 0;
  const displayPrice = hasSalePrice ? product.salePrice : product.price;

  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl;

  const calculateDiscountPercentage = () => {
    if (!hasSalePrice || !product.price || product.price <= 0) return 0;
    return Math.round(((product.price - product.salePrice!) / product.price) * 100);
  };

  const discountPercentage = calculateDiscountPercentage();

  return (
    <Card className="group h-full flex flex-col rounded-lg overflow-hidden transition-all shadow-sm">
        <Link href={`/products/${product.slug}`} className="block bg-white p-4 relative overflow-hidden">
            <Image
                src={primaryImageUrl}
                alt={product.name}
                width={200}
                height={200}
                className="aspect-square w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {discountPercentage > 0 && (
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">{discountPercentage}%</Badge>
            )}
        </Link>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start">
                <div>
                     <div className="flex items-baseline gap-2">
                        <p className="text-md font-semibold text-primary">{formatCurrency(displayPrice!)}</p>
                        {hasSalePrice && (
                            <p className="text-sm font-medium text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-foreground h-10 overflow-hidden">
                        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                            {product.name}
                        </Link>
                    </p>
                </div>
                 <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-9 h-9 flex-shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product, 1);
                    }}
                >
                    <ShoppingCart className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
