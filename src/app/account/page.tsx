'use client';

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AccountPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect from the base /account route to /account/orders
    router.replace('/account/orders');
  }, [router]);

  // Render nothing, or a loading indicator while redirecting
  return null;
}
