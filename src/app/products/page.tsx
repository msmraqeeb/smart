

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { getProducts, getCategories } from '@/lib/data';
import type { Product, Category } from '@/lib/types';
import { ProductCard } from '@/components/product-card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategorySidebar } from '@/components/category-sidebar';

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Get filter values from URL params
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const initialSort = searchParams.get('sort') || 'featured';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOrder, setSortOrder] = useState(initialSort);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setAllProducts(productsData);
      setCategories(categoriesData);
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Effect to update local state when URL params change (e.g. browser back/forward)
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setSortOrder(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  // Effect to update URL when local state changes from user interaction
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // When category changes, reset to first page if pagination were implemented
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];
    const currentCategory = searchParams.get('category');
    const currentQuery = searchParams.get('q');
    const currentSort = searchParams.get('sort') || 'featured';

    // Filter by category
    if (currentCategory && currentCategory !== 'all') {
      products = products.filter(p => p.category === currentCategory);
    }

    // Filter by search query
    if (currentQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(currentQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(currentQuery.toLowerCase())
      );
    }

    // Sort products
    switch (currentSort) {
      case 'price-asc':
        products.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case 'featured':
      default:
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return products;
  }, [allProducts, searchParams]);
  
  const currentCategorySlug = searchParams.get('category');
  const currentCategory = categories.find(c => c.slug === currentCategorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <CategorySidebar categories={categories} />
        </div>
        <div className="md:col-span-3">
          <div className="mb-8">
            <h1 className="font-headline text-4xl font-bold">
              {currentCategory ? currentCategory.name : 'All Products'}
            </h1>
            <p className="text-muted-foreground mt-2">Browse our collection of high-quality products.</p>
          </div>

          <div className="mb-8 flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Input 
                placeholder="Search products..." 
                className="pl-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleFilterChange('q', searchQuery)}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>
            
            <Select value={sortOrder} onValueChange={(value) => handleFilterChange('sort', value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">No Products Found</h2>
                <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
