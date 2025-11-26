
'use client';
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { getCategories } from "@/lib/data";
import type { Category } from "@/lib/types";
import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ProductSearch } from "../product-search";

interface CategoryWithChildren extends Category {
    children: CategoryWithChildren[];
}

const RecursiveCategoryMenu = ({ categories }: { categories: CategoryWithChildren[] }) => {
    return (
        <>
            {categories.map(category => (
                category.children.length > 0 ? (
                    <DropdownMenuSub key={category.id}>
                        <DropdownMenuSubTrigger>
                            <span>{category.name}</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <RecursiveCategoryMenu categories={category.children} />
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                ) : (
                    <DropdownMenuItem key={category.id} asChild>
                        <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
                    </DropdownMenuItem>
                )
            ))}
        </>
    );
};


export function Navigation() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getCategories().then(setCategories);

    const handleScroll = () => {
        // The main header has a height of h-20 (80px)
        if (window.scrollY > 80) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoryTree = useMemo(() => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    const topLevelCategories: CategoryWithChildren[] = [];

    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach(category => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
            parent.children.push(categoryMap.get(category.id)!);
        }
      } else {
        topLevelCategories.push(categoryMap.get(category.id)!);
      }
    });

    return topLevelCategories;
  }, [categories]);

  return (
      <div className="bg-background shadow-md hidden lg:block sticky top-0 z-50 border-b">
          <div className="container mx-auto px-4 flex h-12 items-center justify-between">
              <nav className="flex items-center gap-6 text-sm font-medium">
                <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-2 font-semibold text-foreground bg-primary/10 px-4 h-full">
                        All Categories
                        <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <RecursiveCategoryMenu categories={categoryTree} />
                    </DropdownMenuContent>
                </DropdownMenu>

                <Link
                    href="/"
                    className={cn("transition-colors hover:text-primary", pathname === "/" ? "text-primary" : "text-foreground/80")}
                    >
                    Home
                </Link>
                 <Link
                    href="/products"
                    className={cn("transition-colors hover:text-primary", pathname === "/products" ? "text-primary" : "text-foreground/80")}
                    >
                    Products
                </Link>
                 <Link
                    href="/account"
                    className={cn("transition-colors hover:text-primary", pathname.startsWith("/account") ? "text-primary" : "text-foreground/80")}
                    >
                    My Account
                </Link>
              </nav>

              {isScrolled && (
                <div className="flex-1 max-w-xl">
                    <ProductSearch />
                </div>
              )}
          </div>
      </div>
  );
}
