
'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  LayoutGrid,
  Users,
  LogOut,
  Truck,
  Ticket,
  BarChart,
  ClipboardList,
  Star,
} from "lucide-react";
import React from "react";

const navLinks = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/orders", icon: ListOrdered, label: "Orders" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/admin/attributes", icon: ClipboardList, label: "Attributes" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/reports", icon: BarChart, label: "Reports" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/shipping", icon: Truck, label: "Shipping" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = () => {
    localStorage.removeItem('admin_logged_in');
    router.push('/admin/login');
  };
  
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <aside className="hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-[60px] items-center border-b px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Image src="/images/SMart Logo.png" alt="SMart Logo" width={80} height={24} className="h-6 w-auto" />
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-4 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                  pathname.startsWith(link.href) && "bg-muted text-primary"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-4">
             <Button size="sm" variant="outline" className="w-full" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
            </Button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6 sticky top-0 z-30">
             {/* Mobile Nav can be added here if needed */}
             <div className="flex-1">
                <h1 className="font-semibold text-lg">{navLinks.find(l => pathname.startsWith(l.href))?.label || 'Dashboard'}</h1>
             </div>
             <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/">View Store</Link>
                </Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
