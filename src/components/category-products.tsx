
'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/data";
import { Product } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

interface CategoryProductsProps {
  categorySlug: string;
  title: string;
}

export function CategoryProducts({ categorySlug, title }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(allProducts => {
        const categoryProducts = allProducts.filter(p => p.category === categorySlug).slice(0, 10);
        setProducts(categoryProducts);
        setLoading(false);
    });
  }, [categorySlug]);

  if (loading) {
      return (
         <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <h2 className="font-headline text-3xl font-bold relative">
                    {title}
                     <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
                </h2>
                <Button asChild variant="link" className="text-primary">
                    <Link href={`/products?category=${categorySlug}`}>
                        VIEW ALL ITEMS <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                ))}
            </div>
         </section>
      );
  }

  if (products.length === 0) {
      return null; // Don't render the section if there are no products
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-3xl font-bold relative">
            {title}
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
        </h2>
        <Button asChild variant="link" className="text-primary">
            <Link href={`/products?category=${categorySlug}`}>
                VIEW ALL ITEMS <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product) => (
              <ProductCard key={product.id} product={product} />
          ))}
      </div>
    </section>
  );
}
