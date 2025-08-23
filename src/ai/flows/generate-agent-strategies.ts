'use server';

/**
 * @fileOverview A flow for generating agent strategies based on a high-level investment goal.
 *
 * - generateAgentStrategies - A function that generates agent strategies.
 * - GenerateAgentStrategiesInput - The input type for the generateAgentStrategies function.
 * - GenerateAgentStrategiesOutput - The return type for the generateAgentStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAgentStrategiesInputSchema = z.object({
  investmentGoal: z.string().describe('The high-level investment goal.'),
});
export type GenerateAgentStrategiesInput = z.infer<typeof GenerateAgentStrategiesInputSchema>;

const GenerateAgentStrategiesOutputSchema = z.object({
  strategies: z.array(z.string()).describe('A list of possible agent strategies.'),
});
export type GenerateAgentStrategiesOutput = z.infer<typeof GenerateAgentStrategiesOutputSchema>;

export async function generateAgentStrategies(input: GenerateAgentStrategiesInput): Promise<GenerateAgentStrategiesOutput> {
  return generateAgentStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAgentStrategiesPrompt',
  input: {schema: GenerateAgentStrategiesInputSchema},
  output: {schema: GenerateAgentStrategiesOutputSchema},
  prompt: `You are an expert in creating agent strategies for onchain investment.

  Given the following investment goal, generate a list of possible agent strategies to achieve that goal.

  Investment Goal: {{{investmentGoal}}}

  Strategies:
  `,
});

const generateAgentStrategiesFlow = ai.defineFlow(
  {
    name: 'generateAgentStrategiesFlow',
    inputSchema: GenerateAgentStrategiesInputSchema,
    outputSchema: GenerateAgentStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
