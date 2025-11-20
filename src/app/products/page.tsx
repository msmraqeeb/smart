
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

  // Effect to update local state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchQuery(searchParams.get('q') || '');
    setSortOrder(searchParams.get('sort') || 'featured');
  }, [searchParams]);

  // Effect to update URL when local state changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    if (selectedCategory !== 'all') {
      params.set('category', selectedCategory);
    }
    if (sortOrder !== 'featured') {
        params.set('sort', sortOrder);
    }
    
    // Using router.replace to avoid adding to browser history for filters
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedCategory, sortOrder, pathname, router]);


  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];

    // Filter by category
    if (selectedCategory !== 'all') {
      products = products.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortOrder) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'featured':
      default:
        // 'featured' sort can be complex, for now we can just show them first
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return products;
  }, [allProducts, selectedCategory, searchQuery, sortOrder]);
  
  const currentCategory = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="container mx-auto px-4 py-8">
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
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
                 <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={setSortOrder}>
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
}
