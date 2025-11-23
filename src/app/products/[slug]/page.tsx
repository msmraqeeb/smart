import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Reviews } from "@/components/reviews";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";
import { ProductVariantSelector } from "@/components/product-variant-selector";
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: { slug: string };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl;

  return {
    title: `${product.name} | GetMart`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.substring(0, 160),
      images: [primaryImageUrl, ...previousImages],
      type: 'product',
    },
    twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description.substring(0, 160),
        images: [primaryImageUrl],
    },
  };
}


export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }
  
  const hasSalePrice = product.salePrice && product.salePrice > 0;
  const primaryImageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : product.imageUrl;
  
  const hasVariants = product.variants && product.variants.length > 0;
  let priceDisplay: React.ReactNode;
  
  if (hasVariants) {
      const prices = product.variants!.map(v => v.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
          priceDisplay = <p className="text-3xl font-bold text-primary">{formatCurrency(minPrice)}</p>;
      } else {
          priceDisplay = <p className="text-3xl font-bold text-primary">{formatCurrency(minPrice)} - {formatCurrency(maxPrice)}</p>;
      }
  } else {
      const displayPrice = hasSalePrice ? product.salePrice : product.price;
      priceDisplay = (
          <div className="flex items-baseline gap-4">
              <p className="text-3xl font-bold text-primary">
                  {formatCurrency(displayPrice!)}
              </p>
              {hasSalePrice && (
                  <p className="text-xl font-medium text-muted-foreground line-through">
                      {formatCurrency(product.price)}
                  </p>
              )}
          </div>
      );
  }
  
  // Convert complex objects to plain objects for Client Components
  const plainProduct: Product = JSON.parse(JSON.stringify(product));


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="relative">
          <Image
            src={primaryImageUrl}
            alt={product.name}
            width={600}
            height={600}
            className="rounded-lg object-cover w-full aspect-square shadow-lg"
          />
           {hasSalePrice && !hasVariants && (
            <Badge variant="destructive" className="absolute top-4 left-4 text-base">
                SALE
            </Badge>
        )}
        </div>
        <div className="flex flex-col gap-4">
          <h1 className="font-headline text-4xl font-bold">{product.name}</h1>
          
          <ProductVariantSelector product={plainProduct} initialPriceDisplay={priceDisplay} />
          
          <Separator />
          
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Brand:</span> {product.brand}</p>
            <p><span className="font-semibold">Category:</span> <span className="capitalize">{product.category}</span></p>
          </div>
          
          <Separator />

        </div>
      </div>
      
      <div className="mt-16">
        <Reviews product={plainProduct} />
      </div>
    </div>
  );
}

    
