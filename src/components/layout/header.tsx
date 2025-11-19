'use client';
import Link from "next/link";
import { Leaf, Menu, ChevronDown } from "lucide-react";
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
} from "@/components/ui/dropdown-menu";
import { getCategories } from "@/lib/data";
import type { Category } from "@/lib/types";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/account", label: "My Account" },
];

export function Header() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <span className="font-headline text-lg font-bold">GetMart</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
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
                        {categories.map(category => (
                             <DropdownMenuItem key={category.id} asChild>
                                <Link href={`/products?category=${category.slug}`}>{category.name}</Link>
                            </DropdownMenuItem>
                        ))}
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
               <Link href="/" className="mr-6 flex items-center gap-2 mb-4">
                  <Leaf className="h-6 w-6 text-primary" />
                  <span className="font-headline text-lg font-bold">GetMart</span>
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
