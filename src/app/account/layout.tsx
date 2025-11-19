'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  LogOut,
  LayoutDashboard,
  Package,
  MapPin,
  Settings,
  Heart,
} from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  {
    href: "/account",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  { href: "/account/orders", icon: Package, label: "Orders" },
  { href: "/account/addresses", icon: MapPin, label: "Addresses" },
  { href: "/account/profile", icon: Settings, label: "Account details" },
  { href: "/account/wishlist", icon: Heart, label: "Wishlist" },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { auth, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  React.useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
      });
    }
  };

  if (!user) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <p>Loading...</p>
        </div>
    );
  }
  
  const userName = user?.isAnonymous ? 'Guest' : user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="border rounded-lg">
            <div className="p-4 border-b flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <span className="font-semibold">{userName}</span>
            </div>
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  href={link.href}
                  key={link.label}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50 border-b",
                    pathname === link.href && "bg-muted/80 text-primary font-semibold border-l-4 border-l-primary"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="flex items-center justify-start gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </Button>
            </nav>
          </div>
        </div>

        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
