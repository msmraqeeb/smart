
"use client";

import { useState } from "react";
import { useCart } from "@/context/cart-context";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant } from "@/lib/types";

export function AddToCartButton({ product, selectedVariant }: { product: Product, selectedVariant?: ProductVariant | null }) {
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const handleAddToCart = () => {
        addToCart(product, quantity, selectedVariant || undefined);
    };

    const hasVariants = product.attributes && product.attributes.length > 0;
    const isAddToCartDisabled = hasVariants && !selectedVariant;


    return (
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
            </div>
            <Button size="lg" onClick={handleAddToCart} disabled={isAddToCartDisabled}>
                Add to Cart
            </Button>
        </div>
    );
}
