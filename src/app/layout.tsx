'use client';
import type { Metadata } from "next";
import { usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/layout/header";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import "./globals.css";

// Metadata is not supported in client components, but we can keep it for static analysis
// export const metadata: Metadata = {
//   title: "SMart",
//   description: "Your one-stop shop for fresh products.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>SMart</title>
        <meta name="description" content="Your one-stop shop for fresh products." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                {!isAdminPage && <Header />}
                {!isAdminPage && <Navigation />}
                <main className="flex-1">{children}</main>
                {!isAdminPage && <Footer />}
              </div>
              <Toaster />
            </CartProvider>
          </WishlistProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
