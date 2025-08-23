'use server';
/**
 * @fileOverview Generates an NFT from a text prompt and lists it for sale on a Sei-based marketplace.
 *
 * - createNftFromPrompt - A function that handles the NFT creation and listing process.
 * - CreateNftFromPromptInput - The input type for the createNftFromPrompt function.
 * - CreateNftFromPromptOutput - The return type for the createNftFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const CreateNftFromPromptInputSchema = z.object({
  prompt: z.string().describe('The text prompt to use for generating the NFT image (e.g., \'a futuristic Sei Sentinel robot\').'),
});
export type CreateNftFromPromptInput = z.infer<typeof CreateNftFromPromptInputSchema>;

const CreateNftFromPromptOutputSchema = z.object({
  nftDataUri: z.string().describe('The data URI of the generated NFT image.'),
  listingStatus: z.string().describe('The status of the NFT listing on the marketplace.'),
});
export type CreateNftFromPromptOutput = z.infer<typeof CreateNftFromPromptOutputSchema>;

export async function createNftFromPrompt(input: CreateNftFromPromptInput): Promise<CreateNftFromPromptOutput> {
  return createNftFromPromptFlow(input);
}

const createNftFromPromptFlow = ai.defineFlow(
  {
    name: 'createNftFromPromptFlow',
    inputSchema: CreateNftFromPromptInputSchema,
    outputSchema: CreateNftFromPromptOutputSchema,
  },
  async (input) => {
    // 1. Generate the NFT image data URI from the prompt using a generative AI model.
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: input.prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate NFT image.');
    }
    const nftDataUri = media.url;

    // 2. Mint the NFT on the Sei network and list it for sale on a marketplace.
    // In a real implementation, this would involve using the Crossmint GOAT SDK
    // to mint and another Sei SDK to list on a marketplace.
    const listingStatus = 'NFT minted and listed for sale on a Sei marketplace (simulated).';

    // 3. Notify the user via the Consumer Agent (AIDN).
    // (simulated)
    
    return {nftDataUri, listingStatus};
  }
);
