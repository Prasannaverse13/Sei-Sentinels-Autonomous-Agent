'use server';
/**
 * @fileOverview Data Sentinel Agent: Gathers and analyzes onchain and offchain data using Rivalz Oracles.
 *
 * - dataSentinelAgent - A function that fetches data from various sources.
 * - DataSentinelAgentInput - The input type for the dataSentinelAgent function.
 * - DataSentinelAgentOutput - The return type for the dataSentinelAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataSentinelAgentInputSchema = z.object({
  query: z.string().describe('The data query, e.g., "market sentiment for SEI".'),
});
export type DataSentinelAgentInput = z.infer<typeof DataSentinelAgentInputSchema>;

const DataSentinelAgentOutputSchema = z.object({
  data: z.string().describe('The fetched data, as a JSON string.'),
  source: z.string().describe('The source of the data (e.g., Rivalz Oracles).'),
  onchainLog: z.string().describe('A message confirming the data was stored on-chain.'),
});
export type DataSentinelAgentOutput = z.infer<typeof DataSentinelAgentOutputSchema>;

export async function dataSentinelAgent(input: DataSentinelAgentInput): Promise<DataSentinelAgentOutput> {
  return dataSentinelAgentFlow(input);
}

const dataSentinelAgentFlow = ai.defineFlow(
  {
    name: 'dataSentinelAgentFlow',
    inputSchema: DataSentinelAgentInputSchema,
    outputSchema: DataSentinelAgentOutputSchema,
  },
  async (input) => {
    // This is a placeholder for the full implementation.
    // In a real scenario, this flow would:
    // 1. Query Rivalz Oracles for off-chain data based on the input query.
    // 2. Fetch on-chain data using Hive Intelligence or another service.
    // 3. Store the aggregated data hash on a Sei native contract to create a verifiable data layer.

    const data = JSON.stringify({
      sentiment: "cautiously optimistic",
      keyFactors: ["Upcoming network upgrade", "Increased developer activity"],
    });

    return { 
      data,
      source: "Rivalz Oracles (simulated)",
      onchainLog: "Data hash stored on-chain at tx: 0x...1234"
    };
  }
);
