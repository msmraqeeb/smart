'use client';
import Link from "next/link";
import { Menu, ChevronDown, Phone, User, Heart } from "lucide-react";
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
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/wishlist-context";
import { useAuth } from "@/firebase";
import { Badge } from "../ui/badge";
import { ProductSearch } from "../product-search";

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
  const pathname = usePathname();
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();
  const router = useRouter();

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
      {/* Main Header */}
      <div className="bg-[hsl(var(--header-background))] text-white">
        <div className="container mx-auto px-4 flex h-20 items-center justify-between gap-8">
            <Link href="/" className="flex-shrink-0">
              <Image src="/images/smart-logo.png" alt="SMart Logo" width={120} height={36} className="h-9 w-auto" />
            </Link>
            
            <div className="flex-1 max-w-xl hidden lg:block">
                <ProductSearch />
            </div>

            <div className="hidden lg:flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Phone className="w-8 h-8"/>
                    <div>
                        <p className="text-xs">Order inquiry</p>
                        <p className="font-bold text-sm">+88012345647890</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/account/wishlist" className="relative">
                        <Heart className="w-6 h-6" />
                        {wishlistItems.length > 0 && <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0">{wishlistItems.length}</Badge>}
                    </Link>
                    <CartSheet />

                    {user ? (
                        <Button variant="ghost" size="icon" onClick={() => router.push('/account')}>
                            <User />
                        </Button>
                    ) : (
                       <Button onClick={() => router.push('/auth/login')} className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full px-5">
                            <User className="mr-2" />
                            Login / Register
                       </Button>
                    )}
                </div>
            </div>

            <div className="lg:hidden flex items-center gap-2">
                <CartSheet />
                <Sheet>
                    <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Menu className="h-6 w-6" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-[hsl(var(--header-background))] text-white border-none pt-12">
                        <nav className="flex flex-col gap-4 text-lg">
                             <div className="px-4 mb-4">
                                <ProductSearch />
                             </div>
                            {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="transition-colors hover:text-white/80"
                            >
                                {link.label}
                            </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </div>
      
      {/* Bottom Nav */}
      <div className="bg-background shadow-md hidden lg:block">
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
          </div>
      </div>
    </header>
  );
}
