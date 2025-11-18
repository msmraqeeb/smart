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
      <h2 className="font-headline mb-8 text-3xl font-bold text-center">
        Featured Products
      </h2>
      {loading ? (
        <div className="flex justify-center gap-4">
            <Skeleton className="w-full md:w-1/2 lg:w-1/3 h-96" />
            <Skeleton className="w-full md:w-1/2 lg:w-1/3 h-96 hidden md:block" />
            <Skeleton className="w-full md:w-1/2 lg:w-1/3 h-96 hidden lg:block" />
        </div>
      ) : (
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem
                key={product.id}
                className="md:basis-1/2 lg:basis-1/3"
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
