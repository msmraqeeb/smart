
import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AIRecommendations } from "@/components/ai-recommendations";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { Reviews } from "@/components/reviews";


export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

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
        <Reviews product={product} />
      </div>
    </div>
  );
}
