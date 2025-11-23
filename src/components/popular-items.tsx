
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getFeaturedProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { ProductCard } from './product-card';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

// Function to shuffle an array
const shuffleArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function PopularItems() {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedProducts().then(products => {
      const shuffled = shuffleArray(products);
      setPopularProducts(shuffled.slice(0, 8));
      setLoading(false);
    });
  }, []);

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="font-headline text-3xl font-bold relative">
          Popular Items
          <span className="absolute -bottom-2 left-0 w-16 h-1 bg-primary"></span>
        </h2>
        <Button asChild variant="link" className="text-primary">
          <Link href="/products">
            VIEW ALL ITEMS <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Skeleton className="lg:col-span-1 md:col-span-3 sm:col-span-2 row-span-2 h-full min-h-[300px]" />
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="relative rounded-lg overflow-hidden lg:col-span-1 md:col-span-3 sm:col-span-2 row-span-2 group cursor-pointer">
              <Image 
                src="https://grocery-admin.getcommerce.xyz/category_images/sl1hp1758524209.png"
                alt="Promotion"
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="woman fruits"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-white font-headline">Products</h3>
                </div>
                 <div>
                    <Button variant="secondary" asChild className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full">
                      <Link href="/products">Shop Now <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                 </div>
              </div>
          </div>
          {popularProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
