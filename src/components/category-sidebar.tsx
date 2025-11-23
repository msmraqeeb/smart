
'use client';

import { useMemo } from 'react';
import type { Category } from '@/lib/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface CategorySidebarProps {
  categories: Category[];
  onCategoryChange: (selectedSlugs: string[]) => void;
}

const CategoryItem = ({
  category,
  onCategoryChange,
  selectedCategories,
}: {
  category: Category;
  onCategoryChange: (slug: string, isSelected: boolean) => void;
  selectedCategories: string[];
}) => {
  const isSelected = selectedCategories.includes(category.slug);

  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`category-${category.slug}`}
        checked={isSelected}
        onCheckedChange={(checked) => onCategoryChange(category.slug, !!checked)}
      />
      <Label
        htmlFor={`category-${category.slug}`}
        className={cn(
          'font-normal cursor-pointer',
          isSelected && 'font-semibold text-primary'
        )}
      >
        {category.name}
      </Label>
    </div>
  );
};

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll('category');

  const categoryTree = useMemo(() => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const topLevelCategories: CategoryWithChildren[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category) => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId)!.children.push(categoryMap.get(category.id)!);
      } else {
        topLevelCategories.push(categoryMap.get(category.id)!);
      }
    });

    topLevelCategories.sort((a, b) => a.name.localeCompare(b.name));
    topLevelCategories.forEach(c => c.children.sort((a, b) => a.name.localeCompare(b.name)));

    return topLevelCategories;
  }, [categories]);

  const handleCategoryChange = (slug: string, isSelected: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentCategories = params.getAll('category');

    if (isSelected) {
      if (!currentCategories.includes(slug)) {
        params.append('category', slug);
      }
    } else {
      params.delete('category');
      currentCategories.filter(c => c !== slug).forEach(c => params.append('category', c));
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (pathname !== '/products') {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-headline text-2xl font-bold">Categories</h3>
      <div className="space-y-2">
        {categoryTree.map((category) => (
          <div key={category.id} className="space-y-2">
            <CategoryItem
              category={category}
              onCategoryChange={handleCategoryChange}
              selectedCategories={selectedCategories}
            />
            {category.children.length > 0 && (
              <div className="pl-6 space-y-2">
                {category.children.map(child => (
                  <CategoryItem
                    key={child.id}
                    category={child}
                    onCategoryChange={handleCategoryChange}
                    selectedCategories={selectedCategories}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
