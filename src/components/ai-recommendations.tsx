"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader, Wand2, AlertTriangle } from "lucide-react";
import {
  productRecommendationFromPrompt,
  ProductRecommendationFromPromptOutput,
} from "@/ai/flows/product-recommendation-from-prompt";
import Link from "next/link";
import { getProducts } from "@/lib/data";
import type { Product } from "@/lib/types";

export function AIRecommendations() {
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] =
    useState<ProductRecommendationFromPromptOutput["recommendations"]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setAllProducts);
  }, []);

  const availableProductIds = useMemo(() => new Set(allProducts.map(p => p.id)), [allProducts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setIsLoading(true);
    setError(null);
    setRecommendations([]);

    try {
      const result = await productRecommendationFromPrompt({ prompt });
      setRecommendations(result.recommendations);
    } catch (err) {
      setError("Sorry, we couldn't get recommendations at this time. Please try again later.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-background/50">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2 text-2xl">
          <Wand2 className="h-6 w-6 text-primary" />
          <span>AI-Powered Recommendations</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Not sure what you want? Describe what you're looking for, and our AI will suggest some products for you.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., 'I want to make a healthy breakfast' or 'something for a picnic'"
            rows={3}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !prompt}>
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Getting Recommendations...
              </>
            ) : (
              "Ask AI"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {recommendations.length > 0 && (
          <div className="mt-6">
            <h3 className="font-headline text-xl font-semibold mb-4">Here's what we found for you:</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <Card key={rec.productId} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg">{rec.productName}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </CardContent>
                  {availableProductIds.has(rec.productId) && (
                    <div className="p-4 pt-0">
                      <Button asChild variant="outline" className="w-full">
                         <Link href={`/products/${rec.productId}`}>View Product</Link>
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
