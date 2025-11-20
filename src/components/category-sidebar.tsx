
'use client';

import { useMemo } from 'react';
import type { Category } from '@/lib/types';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface CategorySidebarProps {
  categories: Category[];
}

const CategoryLink = ({
  category,
  isActive,
}: {
  category: Category;
  isActive: boolean;
}) => (
  <Button
    asChild
    variant="link"
    className={cn(
      'h-auto justify-start p-0 text-base font-normal text-muted-foreground transition-colors hover:text-primary hover:no-underline',
      isActive && 'font-semibold text-primary'
    )}
  >
    <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
  </Button>
);

const SubCategoryList = ({
  categories,
  currentCategorySlug,
}: {
  categories: CategoryWithChildren[];
  currentCategorySlug: string | null;
}) => (
  <div className="flex flex-col space-y-2 pl-6">
    {categories.map((subCategory) => (
      <CategoryLink
        key={subCategory.id}
        category={subCategory}
        isActive={currentCategorySlug === subCategory.slug}
      />
    ))}
  </div>
);

export function CategorySidebar({ categories }: CategorySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategorySlug = searchParams.get('category');

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

    topLevelCategories.sort((a,b) => a.name.localeCompare(b.name));
    topLevelCategories.forEach(c => c.children.sort((a,b) => a.name.localeCompare(b.name)));

    return topLevelCategories;
  }, [categories]);

  if (pathname !== '/products') {
    return null;
  }
  
  const activeTopLevelCategory = useMemo(() => {
    if (!currentCategorySlug) return null;
    const findParent = (slug: string): CategoryWithChildren | null => {
        const cat = categories.find(c => c.slug === slug);
        if (!cat) return null;
        if (!cat.parentId) return categoryMap.get(cat.id)!;
        return findParent(categories.find(c => c.id === cat.parentId)!.slug);
    }
    const categoryMap = new Map<string, CategoryWithChildren>(categoryTree.map(c => [c.id, c]));
    return findParent(currentCategorySlug);
  }, [currentCategorySlug, categories, categoryTree]);


  const defaultOpenValue = activeTopLevelCategory ? [activeTopLevelCategory.slug] : [];

  return (
    <div className="space-y-4">
        <h3 className="font-headline text-2xl font-bold">Categories</h3>
        <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full">
            {categoryTree.map((category) => (
            <AccordionItem value={category.slug} key={category.id}>
                <AccordionTrigger
                className={cn(
                    'py-2 text-lg font-medium hover:no-underline',
                    (currentCategorySlug === category.slug || activeTopLevelCategory?.id === category.id) && 'text-primary'
                )}
                >
                <Link href={`/products?category=${category.slug}`} className='hover:text-primary transition-colors'>{category.name}</Link>
                </AccordionTrigger>
                {category.children.length > 0 && (
                <AccordionContent>
                    <SubCategoryList
                    categories={category.children}
                    currentCategorySlug={currentCategorySlug}
                    />
                </AccordionContent>
                )}
            </AccordionItem>
            ))}
        </Accordion>
    </div>
  );
}
