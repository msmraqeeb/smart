
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCategories } from "@/lib/data";
import { FeaturedProducts } from "@/components/featured-products";
import { PopularItems } from "@/components/popular-items";
import { ArrowRight, ShieldCheck, Truck, CircleDollarSign, Headset, PackageCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Category } from "@/lib/types";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { CategoryProducts } from "@/components/category-products";

const featureIcons = [
    { icon: Headset, label: "Online Support" },
    { icon: PackageCheck, label: "Official Product" },
    { icon: Truck, label: "Fastest Delivery" },
    { icon: ShieldCheck, label: "Secure Payment" },
    { icon: CircleDollarSign, label: "Genuine Product" },
];

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const sliderImages = [
    '/images/6cZ4n1758523882.png',
    '/images/6cZ4n1758523882.png',
  ]

  const bannerImages = [
    "https://grocery-admin.getcommerce.xyz/banner/pwmR01758523026.png",
    "https://grocery-admin.getcommerce.xyz/banner/2U0bX1758523017.png",
    "https://grocery-admin.getcommerce.xyz/banner/IXglG1758523007.png"
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Carousel
                opts={{ align: "start", loop: true, }}
                className="w-full"
            >
                <CarouselContent>
                    {sliderImages.map((src, index) => (
                        <CarouselItem key={index}>
                           <div className="relative aspect-[2/1] w-full">
                             <Image
                                src={src}
                                alt={`Slider image ${index + 1}`}
                                fill
                                className="rounded-lg object-cover"
                             />
                           </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
            </Carousel>
        </div>
        <div className="flex flex-col gap-6">
          <div className="relative w-full h-full">
            <Image
              src="/images/nX5IF1758523833.png"
              alt="Snacks offer"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="relative w-full h-full">
            <Image
              src="/images/xHSRB1758523707.png"
              alt="Eggs offer"
              fill
              className="rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 rounded-lg bg-muted/50 p-4">
              {featureIcons.map(feature => (
                  <div key={feature.label} className="flex flex-col items-center justify-center gap-2 text-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                    <p className="text-sm font-semibold text-muted-foreground">{feature.label}</p>
                  </div>
              ))}
          </div>
      </section>

      <FeaturedProducts />

      <PopularItems />
      
      <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bannerImages.map((src, index) => (
                  <div key={index} className="relative aspect-[2/1] w-full">
                      <Image
                        src={src}
                        alt={`Promotional banner ${index + 1}`}
                        fill
                        className="rounded-lg object-cover"
                      />
                  </div>
              ))}
          </div>
      </section>

      <CategoryProducts categorySlug="food" title="Food" />

      <section>
        <h2 className="font-headline mb-8 text-3xl font-bold text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link href={`/products?category=${category.slug}`} key={category.id}>
              <Card className="group overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                <CardHeader className="p-0">
                   <Image
                      src={category.imageUrl}
                      alt={category.name}
                      width={400}
                      height={300}
                      data-ai-hint={category.imageHint}
                      className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105"
                    />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="font-headline text-xl text-center">
                    {category.name}
                  </CardTitle>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
