'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  User,
  LogOut,
  Package,
  MapPin,
  Lock,
  Heart,
  MessageSquare,
  CreditCard,
  Archive
} from "lucide-react";
import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/account/orders", icon: Package, label: "My orders" },
  { href: "/account/addresses", icon: MapPin, label: "My addresses" },
  { href: "/account/profile", icon: Lock, label: "Login & security" },
  { href: "/account/wishlist", icon: Heart, label: "Saved items" },
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
  
  const userName = user?.isAnonymous ? 'Guest' : user?.displayName || 'User';
  const userEmail = user?.email || 'No email associated';

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8">
            <h1 className="text-4xl font-bold">My Account</h1>
            <p className="text-muted-foreground">{userName}, Email: {userEmail}</p>
       </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                href={link.href}
                key={link.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground rounded-lg hover:bg-muted/50",
                  pathname === link.href && "bg-primary/10 text-primary font-semibold"
                )}
              >
                <link.icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t">
                 <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="flex items-center justify-start gap-3 px-4 py-2 text-sm w-full text-muted-foreground hover:bg-muted/50"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Log out</span>
                </Button>
            </div>
          </nav>
        </div>

        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
