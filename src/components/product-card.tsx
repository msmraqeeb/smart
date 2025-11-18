import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={400}
            height={400}
            data-ai-hint={product.imageHint}
            className="aspect-square w-full object-cover"
          />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <CardTitle className="font-headline text-lg">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">{product.brand}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex w-full items-center justify-between">
          <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
          <Button asChild size="sm">
            <Link href={`/products/${product.id}`}>View</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
