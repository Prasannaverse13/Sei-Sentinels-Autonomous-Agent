'use server';
/**
 * @fileOverview Data Sentinel Agent: The Onchain & Offchain Intelligence Hub.
 *
 * - dataSentinelAgent - A function that fetches and analyzes data.
 * - DataSentinelAgentInput - The input type for the dataSentinelAgent function.
 * - DataSentinelAgentOutput - The return type for the dataSentinelAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DataSentinelAgentInputSchema = z.object({
  query: z.string().describe('The data query, e.g., "Get a comprehensive market overview with a focus on SEI and memecoin sentiment".'),
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
    const offchainLog = "Queried Rivalz Oracles for social media sentiment (SEI, memecoins), GitHub developer activity, and upcoming network upgrade news.";
    const offchainData = { sentiment: "cautiously optimistic", devActivity: "high", news: "v2 upgrade next month" };

    // 2. Fetch on-chain data via custom Sei MCP Server (simulated).
    const onchainLog = "Queried custom Sei MCP Server for whale wallet accumulation, NFT collection floor price changes, and memecoin inflows.";
    const onchainData = { whaleActivity: "net accumulation", nftTrend: "stable", memecoinTrend: "rising" };
    
    // 3. Analyze and synthesize the data.
    const analysis = `Overall market sentiment is ${offchainData.sentiment}, driven by ${offchainData.devActivity} developer activity and news of a ${offchainData.news}. On-chain, whale wallets are showing ${onchainData.whaleActivity}, NFT floors are ${onchainData.nftTrend}, and memecoin interest is ${onchainData.memecoinTrend}.`;

    // 4. Store the data hash on a Sei native contract (simulated).
    // This creates a verifiable, onchain data layer.

    return { 
      analysis,
      onchainLog,
      offchainLog,
    };
  }
);
