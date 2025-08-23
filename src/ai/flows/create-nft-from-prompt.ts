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

const createNftPrompt = ai.definePrompt({
  name: 'createNftPrompt',
  input: {schema: CreateNftFromPromptInputSchema},
  output: {schema: z.string().describe('Data URL of the generated image')},
  prompt: `You are an AI that generates prompts for image generation, based on the user's request.

  The user's request is: {{{prompt}}}

  Respond only with a prompt that would be suitable for generating a high-quality image.  Do not add any additional text.`, 
});

const createNftFromPromptFlow = ai.defineFlow(
  {
    name: 'createNftFromPromptFlow',
    inputSchema: CreateNftFromPromptInputSchema,
    outputSchema: CreateNftFromPromptOutputSchema,
  },
  async input => {
    // 1. Generate the NFT image data URI from the prompt.
    const {output: refinedPrompt} = await createNftPrompt(input);

    const {media} = await ai.generate({
      // IMPORTANT: ONLY the googleai/gemini-2.0-flash-preview-image-generation model is able to generate images. You MUST use exactly this model to generate images.
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: refinedPrompt!,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate NFT image.');
    }
    const nftDataUri = media.url;

    // 2. Mock listing the NFT for sale on a Sei-based marketplace.
    // In a real implementation, this would involve interacting with the Sei blockchain.
    const listingStatus = 'NFT listed for sale on the Sei marketplace.';

    return {nftDataUri, listingStatus};
  }
);
