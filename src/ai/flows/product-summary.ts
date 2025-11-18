'use server';
/**
 * @fileOverview AI-powered product summary flow.
 *
 * - productSummary - A function that generates a summary of a product based on its reviews.
 * - ProductSummaryInput - The input type for the productSummary function.
 * - ProductSummaryOutput - The return type for the productSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductSummaryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productReviews: z.string().describe('A list of reviews for the product.'),
});
export type ProductSummaryInput = z.infer<typeof ProductSummaryInputSchema>;

const ProductSummaryOutputSchema = z.object({
  summary: z.string().describe('A summary of the product based on its reviews.'),
});
export type ProductSummaryOutput = z.infer<typeof ProductSummaryOutputSchema>;

export async function productSummary(input: ProductSummaryInput): Promise<ProductSummaryOutput> {
  return productSummaryFlow(input);
}

const productSummaryPrompt = ai.definePrompt({
  name: 'productSummaryPrompt',
  input: {schema: ProductSummaryInputSchema},
  output: {schema: ProductSummaryOutputSchema},
  prompt: `You are an AI assistant specializing in summarizing product reviews.

  Based on the following product reviews, please provide a concise summary of the key features, benefits, and drawbacks of the product.

  Product Name: {{{productName}}}
  Reviews: {{{productReviews}}}

  Summary:`,
});

const productSummaryFlow = ai.defineFlow(
  {
    name: 'productSummaryFlow',
    inputSchema: ProductSummaryInputSchema,
    outputSchema: ProductSummaryOutputSchema,
  },
  async input => {
    const {output} = await productSummaryPrompt(input);
    return output!;
  }
);
