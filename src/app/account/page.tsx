'use client';

import { useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";

export default function AccountPage() {
  const { auth, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const userName = user?.isAnonymous ? 'Guest' : user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div>
      <p className="mb-6">
        Hello <span className="font-semibold">{userName}</span> (not <span className="font-semibold">{userName}</span>? <button onClick={handleSignOut} className="text-primary hover:underline">Log out</button>)
      </p>
      <p className="text-muted-foreground">
        From your account dashboard you can view your recent{" "}
        <Link href="/account/orders" className="text-primary hover:underline">
          orders
        </Link>
        , manage your{" "}
        <Link href="/account/addresses" className="text-primary hover:underline">
          shipping and billing addresses
        </Link>
        , and{" "}
        <Link href="/account/profile" className="text-primary hover:underline">
          edit your password and account details
        </Link>
        .
      </p>
    </div>
  );
}
