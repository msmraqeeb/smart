import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductById } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AIRecommendations } from "@/components/ai-recommendations";
import { useCart } from "@/context/cart-context";
import { useState } from "react";

// Client component to handle adding to cart
function AddToCartButton({ product }: { product: Awaited<ReturnType<typeof getProductById>> }) {
    "use client";
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
            </div>
            <Button size="lg" onClick={() => addToCart(product, quantity)}>
                Add to Cart
            </Button>
        </div>
    );
}


export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={600}
            data-ai-hint={product.imageHint}
            className="rounded-lg object-cover w-full aspect-square shadow-lg"
          />
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="font-headline text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-primary">
            {formatCurrency(product.price)}
          </p>
          <p className="text-muted-foreground">{product.description}</p>
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Brand:</span> {product.brand}</p>
            <p><span className="font-semibold">Category:</span> <span className="capitalize">{product.category}</span></p>
          </div>
          
          <Separator />

          <AddToCartButton product={product} />

        </div>
      </div>
      
      <div className="mt-16">
         <AIRecommendations />
      </div>

      <div className="mt-16">
        <h2 className="font-headline text-3xl font-bold mb-4">Reviews</h2>
        <div className="space-y-6">
            {product.reviews.map((review, index) => (
                <div key={index} className="border-l-4 border-primary pl-4">
                    <p className="italic">"{review}"</p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
