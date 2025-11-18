'use server';
/**
 * @fileOverview Recommends products based on a user-provided prompt.
 *
 * - productRecommendationFromPrompt - A function that handles the product recommendation process.
 * - ProductRecommendationFromPromptInput - The input type for the productRecommendationFromPrompt function.
 * - ProductRecommendationFromPromptOutput - The return type for the productRecommendationFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductRecommendationFromPromptInputSchema = z.object({
  prompt: z.string().describe('A description of what the user is looking for.'),
});
export type ProductRecommendationFromPromptInput = z.infer<typeof ProductRecommendationFromPromptInputSchema>;

const ProductRecommendationFromPromptOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      productId: z.string().describe('The ID of the recommended product.'),
      productName: z.string().describe('The name of the recommended product.'),
      description: z.string().describe('A short description of why this product is recommended.'),
    })
  ).describe('A list of product recommendations based on the prompt.'),
});
export type ProductRecommendationFromPromptOutput = z.infer<typeof ProductRecommendationFromPromptOutputSchema>;

export async function productRecommendationFromPrompt(input: ProductRecommendationFromPromptInput): Promise<ProductRecommendationFromPromptOutput> {
  return productRecommendationFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productRecommendationFromPromptPrompt',
  input: {schema: ProductRecommendationFromPromptInputSchema},
  output: {schema: ProductRecommendationFromPromptOutputSchema},
  prompt: `You are an AI product recommendation system for an online store.

The user has provided the following prompt describing what they are looking for: {{{prompt}}}

Based on this prompt, provide a list of product recommendations.  The products do not need to explicitly match the search terms.  Instead, use the prompt to understand the user's needs, and then recommend products that meet those needs.

Consider the user's context and preferences when making recommendations.

Output the recommendations in JSON format. Each recommendation should include the product ID, product name, and a short description of why the product is recommended.
`,
});

const productRecommendationFromPromptFlow = ai.defineFlow(
  {
    name: 'productRecommendationFromPromptFlow',
    inputSchema: ProductRecommendationFromPromptInputSchema,
    outputSchema: ProductRecommendationFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
