
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Product, ProductVariant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { AddToCartButton } from './add-to-cart-button';
import { Badge } from './ui/badge';

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
    </>
  );
}
