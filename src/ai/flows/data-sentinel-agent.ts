'use server';
/**
 * @fileOverview Data Sentinel Agent: Gathers and analyzes onchain and offchain data.
 *
 * - dataSentinelAgent - A function that fetches and analyzes data.
 * - DataSentinelAgentInput - The input type for the dataSentinelAgent function.
 * - DataSentinelAgentOutput - The return type for the dataSentinelAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataSentinelAgentInputSchema = z.object({
  query: z.string().describe('The data query, e.g., "Analyze market sentiment for SEI".'),
  // In a real scenario, this would include wallet addresses to watch, etc.
});
export type DataSentinelAgentInput = z.infer<typeof DataSentinelAgentInputSchema>;

const DataSentinelAgentOutputSchema = z.object({
  analysis: z.string().describe('The synthesized analysis from on-chain and off-chain data.'),
  onchainLog: z.string().describe('A log of the on-chain data fetching process.'),
  offchainLog: z.string().describe('A log of the off-chain data fetching process.'),
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
    // 1. Fetch off-chain data from Rivalz Oracles (simulated).
    const offchainLog = "Queried Rivalz Oracles for market sentiment and social media mentions.";
    const offchainData = { sentiment: "cautiously optimistic" };

    // 2. Fetch on-chain data via custom MCP Server (simulated).
    // This would query wallet behaviors, NFT movements, etc.
    const onchainLog = "Queried Sei MCP Server for whale wallet movements and memecoin inflows.";
    const onchainData = { whaleActivity: "Accumulation detected", memecoinTrend: "Stable" };
    
    // 3. Analyze and synthesize the data.
    const analysis = `Market sentiment is ${offchainData.sentiment} based on off-chain data. On-chain, whale wallets are showing signs of ${onchainData.whaleActivity.toLowerCase()}, and memecoin trends appear ${onchainData.memecoinTrend.toLowerCase()}. Key factors include upcoming network upgrades and increased developer activity.`;

    // 4. Store the data hash on a Sei native contract (simulated).
    // This creates a verifiable, onchain data layer.

    return { 
      analysis,
      onchainLog,
      offchainLog,
    };
  }
);
