'use client';
import Link from "next/link";
import { Menu, ChevronDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/account", label: "My Account" },
];

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


export function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getCategories().then(setCategories);
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center">
          <Image src="/images/smart-logo.png" alt="SMart Logo" width={80} height={24} className="h-6 w-auto" />
        </Link>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
           <Link
              href="/"
              className={cn("transition-colors hover:text-foreground/80", pathname === "/" ? "text-foreground" : "text-foreground/60")}
            >
              Home
            </Link>
            <DropdownMenu open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                <div onMouseEnter={() => setIsCategoriesOpen(true)} onMouseLeave={() => setIsCategoriesOpen(false)}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-foreground/60 transition-colors hover:text-foreground/80 focus:outline-none">
                        Categories
                        <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <RecursiveCategoryMenu categories={categoryTree} />
                    </DropdownMenuContent>
                </div>
            </DropdownMenu>
             <Link
              href="/products"
              className={cn("transition-colors hover:text-foreground/80", pathname === "/products" ? "text-foreground" : "text-foreground/60")}
            >
              Products
            </Link>
             <Link
              href="/account"
              className={cn("transition-colors hover:text-foreground/80", pathname.startsWith("/account") ? "text-foreground" : "text-foreground/60")}
            >
              My Account
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-2">
          <CartSheet />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
               <Link href="/" className="mr-6 flex items-center mb-4">
                  <Image src="/images/smart-logo.png" alt="SMart Logo" width={100} height={30} className="h-8 w-auto" />
                </Link>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
