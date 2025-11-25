'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search } from 'lucide-react';

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full">
      <Input
        type="search"
        placeholder="Type Your Products..."
        className="rounded-r-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-black"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button type="submit" className="rounded-l-none bg-accent text-accent-foreground hover:bg-accent/90">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </form>
  );
}
