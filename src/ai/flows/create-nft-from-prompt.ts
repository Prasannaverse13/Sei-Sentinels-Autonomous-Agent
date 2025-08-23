'use server';
/**
 * @fileOverview Autonomous Art Broker: Generates an NFT, lists it for sale, and notifies the user.
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
  notificationStatus: z.string().describe('The status of the user notification.'),
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

    // 2. Mint the NFT on the Sei network using the Crossmint GOAT SDK (simulated).
    const mintLog = "Crossmint GOAT SDK: Minting NFT on Sei network...";

    // 3. List the NFT for sale on a marketplace (simulated).
    const listingStatus = 'NFT listed for sale on a Sei marketplace (simulated).';

    // 4. Notify the user via the Consumer Agent (AIDN) (simulated).
    const notificationStatus = 'Notified user via AIDN on Telegram.';
    
    return {nftDataUri, listingStatus, notificationStatus};
  }
);
