'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/data";
import { FeaturedProducts } from "@/components/featured-products";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-16 rounded-lg bg-green-100/50 p-8 text-center shadow-lg dark:bg-green-900/20">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
          Welcome to GetMart
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
          Freshness delivered to your doorstep. Explore our curated selection of
          high-quality products.
        </p>
        <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link href="/products">Shop Now</Link>
        </Button>
      </section>

      <FeaturedProducts />

      <section>
        <h2 className="font-headline mb-8 text-3xl font-bold text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link href={`/products?category=${category.slug}`} key={category.id}>
              <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="p-0">
                   <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={400}
                      height={300}
                      data-ai-hint={category.imageHint}
                      className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                    />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="font-headline text-xl text-center">
                    {category.name}
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                   <Button variant="link" className="w-full text-primary">
                      Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                   </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
