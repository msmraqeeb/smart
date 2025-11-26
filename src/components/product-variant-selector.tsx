'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './add-to-cart-button';
import { Badge } from './ui/badge';
import { Phone } from 'lucide-react';
import Link from 'next/link';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
);


interface ProductVariantSelectorProps {
  product: Product;
  initialPriceDisplay: React.ReactNode;
}

export function ProductVariantSelector({ product, initialPriceDisplay }: ProductVariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [currentVariant, setCurrentVariant] = useState<ProductVariant | null>(null);

  // Initialize selected options with the first available option for each attribute
  useEffect(() => {
    const initialOptions: Record<string, string> = {};
    product.attributes?.forEach(attr => {
      if (attr.options.length > 0) {
        initialOptions[attr.name] = attr.options[0];
      }
    });
    setSelectedOptions(initialOptions);
  }, [product.attributes]);

  // Find the matching variant whenever selectedOptions change
  useEffect(() => {
    if (!product.variants || product.variants.length === 0 || Object.keys(selectedOptions).length === 0) {
      setCurrentVariant(null);
      return;
    }
    
    const matchedVariant = product.variants.find(variant => 
      Object.entries(selectedOptions).every(([key, value]) => variant.attributes[key] === value)
    );
    setCurrentVariant(matchedVariant || null);

  }, [selectedOptions, product.variants]);

  const handleOptionSelect = (attributeName: string, option: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [attributeName]: option,
    }));
  };
  
  const hasVariants = product.variants && product.variants.length > 0;
  
  let priceDisplay: React.ReactNode;
  if (currentVariant) {
    const hasSale = currentVariant.salePrice && currentVariant.salePrice > 0;
    priceDisplay = (
        <div className="flex items-baseline gap-4">
             <p className="text-3xl font-bold text-primary">
                {formatCurrency(hasSale ? currentVariant.salePrice! : currentVariant.price)}
             </p>
             {hasSale && (
                 <p className="text-xl font-medium text-muted-foreground line-through">
                    {formatCurrency(currentVariant.price)}
                 </p>
             )}
        </div>
    )
  } else {
    priceDisplay = initialPriceDisplay;
  }
  
  const WHATSAPP_NUMBER = "8801234567890";
  const CALL_NUMBER = "+8801234567890";

  const whatsAppMessage = useMemo(() => {
    const price = currentVariant ? (currentVariant.salePrice || currentVariant.price) : (product.salePrice || product.price);
    const sku = currentVariant ? currentVariant.sku : product.sku;
    
    let message = `Hello! GetMart, I'm interested in:\n`;
    message += `Product: ${product.name}\n`;
    if(currentVariant) {
      const variantDetails = Object.values(currentVariant.attributes).join(' / ');
      message += `Variant: ${variantDetails}\n`;
    }
    message += `Price: ${formatCurrency(price)}\n`;
    if (sku) {
        message += `SKU: ${sku}\n`;
    }
    message += `Product URL: ${window.location.href}`;
    
    return encodeURIComponent(message);
  }, [product, currentVariant]);
  
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${whatsAppMessage}`;

  return (
    <>
      <div className="h-10">{priceDisplay}</div>
      <p className="text-muted-foreground">{product.description}</p>
      
      {hasVariants && (
        <div className="space-y-4">
          {product.attributes?.map(attribute => (
            <div key={attribute.name}>
              <h3 className="text-sm font-semibold mb-2">{attribute.name}</h3>
              <div className="flex flex-wrap gap-2">
                {attribute.options.map(option => {
                  const isSelected = selectedOptions[attribute.name] === option;
                  return (
                    <Button
                      key={option}
                      variant={isSelected ? 'default' : 'outline'}
                      onClick={() => handleOptionSelect(attribute.name, option)}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
           {!currentVariant && Object.keys(selectedOptions).length > 0 && (
                <Badge variant="destructive">This option is currently unavailable.</Badge>
           )}
        </div>
      )}
      <AddToCartButton product={product} selectedVariant={currentVariant} />
      <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white" asChild>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Order On WhatsApp
              </a>
          </Button>
          <Button size="lg" className="w-full bg-[#3b5998] hover:bg-[#2d4373] text-white" asChild>
              <a href={`tel:${CALL_NUMBER}`}>
                <Phone className="mr-2 h-5 w-5" />
                Call For Order
              </a>
          </Button>
      </div>
    </>
  );
}
