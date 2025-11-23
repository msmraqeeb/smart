'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts } from "@/lib/data";
import { Product } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

export function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts().then(products => {
        setFeaturedProducts(products);
        setLoading(false);
    });
  }, []);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-3xl font-bold relative">
            Today's Hot Sale
            <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
        </h2>
        <Button asChild variant="link" className="text-primary">
            <Link href="/products">
                VIEW ALL ITEMS <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center gap-4">
            <Skeleton className="w-full md:w-1/2 lg:w-1/4 h-80" />
            <Skeleton className="w-full md:w-1/2 lg:w-1/4 h-80 hidden md:block" />
            <Skeleton className="w-full md:w-1/2 lg:w-1/4 h-80 hidden lg:block" />
            <Skeleton className="w-full md:w-1/2 lg:w-1/4 h-80 hidden lg:block" />
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="md:basis-1/2 lg:basis-1/4 pl-2"
              >
                <div className="p-1">
                  <ProductCard product={product} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      )}
    </section>
  );
}
