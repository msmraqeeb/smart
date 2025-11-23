
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
import { Search, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategorySidebar } from '@/components/category-sidebar';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

const getAverageRating = (reviews: any[] | undefined) => {
  if (!reviews || reviews.length === 0) return 0;
  return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Get filter values from URL params
  const initialSearch = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);

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

  const { brands, maxPrice } = useMemo(() => {
    if (allProducts.length === 0) return { brands: [], maxPrice: 1000 };
    
    const brandsSet = new Set(allProducts.map(p => p.brand).filter(Boolean) as string[]);
    const max = Math.ceil(Math.max(...allProducts.map(p => p.price)));
    
    return {
      brands: Array.from(brandsSet).sort(),
      maxPrice: max > 0 ? max : 1000,
    };
  }, [allProducts]);

  // Effect to update URL when local state changes from user interaction
  const handleFilterChange = (key: string, value: string | string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // For array values (like brands), handle them specially
    if (Array.isArray(value)) {
        params.delete(key); // Clear existing values
        if (value.length > 0) {
            value.forEach(v => params.append(key, v));
        }
    } else {
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };
  
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts];
    const currentCategory = searchParams.get('category');
    const currentQuery = searchParams.get('q');
    const currentSort = searchParams.get('sort') || 'featured';
    const minPrice = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const selectedBrands = searchParams.getAll('brands');
    const selectedRating = searchParams.get('rating');

    // Filter by category (including sub-categories)
    if (currentCategory && currentCategory !== 'all') {
      const categorySlugsToFilter = getDescendantCategorySlugs(currentCategory, categories);
      products = products.filter(p => categorySlugsToFilter.includes(p.category));
    }

    // Filter by search query
    if (currentQuery) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(currentQuery.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(currentQuery.toLowerCase())) ||
        p.description.toLowerCase().includes(currentQuery.toLowerCase())
      );
    }
    
    // Filter by price
    if (minPrice) {
        products = products.filter(p => (p.salePrice || p.price) >= Number(minPrice));
    }
    if (maxPriceParam) {
        products = products.filter(p => (p.salePrice || p.price) <= Number(maxPriceParam));
    }

    // Filter by brand
    if (selectedBrands.length > 0) {
        products = products.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // Filter by rating
    if (selectedRating) {
        products = products.filter(p => getAverageRating(p.reviews) >= Number(selectedRating));
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
  }, [allProducts, categories, searchParams]);
  
  const currentCategorySlug = searchParams.get('category');
  const currentCategory = categories.find(c => c.slug === currentCategorySlug);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-8">
          <CategorySidebar categories={categories} />

          {/* Price Filter */}
          <div className="space-y-4">
            <h3 className="font-headline text-2xl font-bold">Price</h3>
            <Slider
                defaultValue={[maxPrice]}
                max={maxPrice}
                step={10}
                onValueChange={(value) => handleFilterChange('maxPrice', value[0].toString())}
            />
             <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatCurrency(0)}</span>
                <span>{formatCurrency(Number(searchParams.get('maxPrice') || maxPrice))}</span>
            </div>
          </div>
          
          {/* Brands Filter */}
           <div className="space-y-4">
            <h3 className="font-headline text-2xl font-bold">Brands</h3>
             <div className="space-y-2">
                {brands.map(brand => (
                    <div key={brand} className="flex items-center space-x-2">
                        <Checkbox 
                            id={`brand-${brand}`} 
                            checked={searchParams.getAll('brands').includes(brand)}
                            onCheckedChange={(checked) => {
                                const currentBrands = searchParams.getAll('brands');
                                const newBrands = checked 
                                    ? [...currentBrands, brand]
                                    : currentBrands.filter(b => b !== brand);
                                handleFilterChange('brands', newBrands);
                            }}
                        />
                        <Label htmlFor={`brand-${brand}`} className="font-normal">{brand}</Label>
                    </div>
                ))}
             </div>
           </div>

            {/* Ratings Filter */}
            <div className="space-y-4">
                <h3 className="font-headline text-2xl font-bold">Rating</h3>
                <div className="flex flex-col items-start gap-2">
                    {[4, 3, 2, 1].map(rating => (
                        <Button 
                            key={rating}
                            variant="link"
                            className="p-0 h-auto text-muted-foreground hover:text-primary"
                            onClick={() => handleFilterChange('rating', rating.toString())}
                        >
                            <div className="flex items-center gap-2">
                                {Array.from({length: 5}).map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted stroke-muted-foreground'}`}/>
                                ))}
                                <span className="text-sm">& up</span>
                            </div>
                        </Button>
                    ))}
                     <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 h-auto text-primary"
                        onClick={() => handleFilterChange('rating', '')}
                    >
                        Clear rating
                    </Button>
                </div>
            </div>

        </aside>
        <main className="md:col-span-3">
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
            
            <Select value={searchParams.get('sort') || 'featured'} onValueChange={(value) => handleFilterChange('sort', value)}>
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
        </main>
      </div>
    </div>
  );
}
