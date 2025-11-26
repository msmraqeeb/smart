'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = allProducts
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 10); // Limit to 10 results
      setFilteredProducts(filtered);
      setShowResults(true);
    } else {
      setFilteredProducts([]);
      setShowResults(false);
    }
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
  }

  return (
    <div className="relative" ref={searchContainerRef}>
      <form onSubmit={handleSearchSubmit} className="flex w-full">
        <div className="relative flex-grow">
          <Input
            type="search"
            placeholder="Type Your Products..."
            className="rounded-r-none border shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-black pr-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(searchQuery.trim().length > 1)}
          />
          {searchQuery && (
            <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                onClick={clearSearch}
            >
                <X className="h-4 w-4"/>
            </Button>
          )}
        </div>
        <Button type="submit" className="rounded-l-none bg-accent text-accent-foreground hover:bg-accent/90">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {showResults && filteredProducts.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg z-50 border max-h-96 overflow-y-auto">
          <ul className="divide-y">
            {filteredProducts.map(product => (
              <li key={product.id}>
                <Link 
                    href={`/products/${product.slug}`} 
                    className="flex items-center gap-4 p-3 hover:bg-muted/50"
                    onClick={() => setShowResults(false)}
                >
                  <Image 
                    src={product.imageUrls?.[0] || product.imageUrl} 
                    alt={product.name} 
                    width={48} 
                    height={48} 
                    className="rounded-md object-cover" 
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-sm text-gray-800">{product.name}</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-sm font-bold text-primary">
                            {formatCurrency(product.salePrice || product.price)}
                        </p>
                        {product.salePrice && (
                            <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(product.price)}
                            </p>
                        )}
                    </div>
                    {product.brand && <p className="text-xs text-muted-foreground">{product.brand}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
