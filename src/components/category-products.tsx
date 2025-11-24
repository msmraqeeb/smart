
'use client';
import { ProductCard } from "@/components/product-card";
import { getProducts, getCategories } from "@/lib/data";
import type { Product, Category } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowRight } from "lucide-react";

// Helper function to get all descendant category slugs
const getDescendantCategorySlugs = (
  parentSlug: string,
  allCategories: Category[]
): string[] => {
  const parentCategory = allCategories.find((c) => c.slug === parentSlug);
  if (!parentCategory) {
    return [parentSlug];
  }

  let slugsToFilter = [parentSlug];
  const childrenToProcess: string[] = [parentCategory.id];
  
  while (childrenToProcess.length > 0) {
    const currentParentId = childrenToProcess.shift();
    const children = allCategories.filter((c) => c.parentId === currentParentId);
    for (const child of children) {
      slugsToFilter.push(child.slug);
      childrenToProcess.push(child.id);
    }
  }

  return slugsToFilter;
};

interface CategoryProductsProps {
  categorySlug: string;
  title: string;
}

export function CategoryProducts({ categorySlug, title }: CategoryProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchData = async () => {
        const [allProducts, allCategories] = await Promise.all([getProducts(), getCategories()]);
        
        const categorySlugs = getDescendantCategorySlugs(categorySlug, allCategories);
        const categoryProducts = allProducts.filter(p => categorySlugs.includes(p.category)).slice(0, 10);
        
        setProducts(categoryProducts);
        setCategories(allCategories);
        setLoading(false);
    };
    fetchData();
  }, [categorySlug]);

  if (loading && isClient) {
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
      return null;
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
