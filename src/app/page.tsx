
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <section className="mb-16">
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

      <section className="py-16 bg-muted/30 rounded-lg">
        <div className="container mx-auto px-4 text-center">
            <h2 className="font-headline text-3xl font-bold mb-4">Know More SMart Online Groceries Shop</h2>
            <p className="max-w-4xl mx-auto text-muted-foreground mb-8">
              Our top-rated online grocery store is your solution for a convenient, high-quality, and sustainable shopping experience. We bring the entire store to you, offering an extensive selection of fresh produce and household essentials, backed by our commitment to customer satisfaction.
            </p>
            
            <div className="max-w-4xl mx-auto text-left">
              <h3 className="font-headline text-2xl font-semibold mb-4 text-center">Why Choose Us?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">&#8226;</span>
                  <p><span className="font-bold">Unmatched Convenience:</span> Shop from home, avoid crowds and lines, and enjoy fast, reliable delivery straight to your doorstep.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">&#8226;</span>
                   <p><span className="font-bold">Smart & Healthy Choices:</span> Easily access detailed nutritional facts and a diverse range of products, including global cuisines and dietary-specific options (organic, gluten-free, etc.), to plan healthier meals.</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">&#8226;</span>
                  <p><span className="font-bold">Value & Savings:</span> Benefit from exclusive online deals and competitive pricing to get the best value for your family.</p>
                </li>
                 <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">&#8226;</span>
                  <p><span className="font-bold">Eco-Friendly Impact:</span> Contribute to a greener planet with our optimized delivery routes and eco-friendly packaging options.</p>
                </li>
              </ul>
              <p className="mt-8 text-muted-foreground text-center">
                Join the growing number of satisfied customers. Shop now and experience the difference in quality, convenience, and service!
              </p>
            </div>
        </div>
      </section>
    </div>
  );
}
