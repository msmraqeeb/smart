'use client';
import Link from "next/link";
import { Menu, Phone, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { Badge } from "../ui/badge";
import { ProductSearch } from "../product-search";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/account", label: "My Account" },
];

export function Header() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="w-full">
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
    </header>
  );
}
