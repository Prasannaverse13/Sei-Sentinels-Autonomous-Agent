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
  summary: z.string().describe('A high-level summary of the market analysis.'),
  onchainAnalysis: z.string().describe('Detailed analysis of on-chain data points.'),
  offchainAnalysis: z.string().describe('Detailed analysis of off-chain data points.'),
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
    
    // 2. Fetch on-chain data via custom Sei MCP Server (simulated).
    const onchainLog = "Queried custom Sei MCP Server for whale wallet accumulation, NFT collection floor price changes, and memecoin inflows.";
    
    // 3. Analyze and synthesize the data.
    const summary = "Overall market sentiment is cautiously optimistic, driven by high developer activity and news of a v2 upgrade next month. On-chain, whale wallets are showing net accumulation, NFT floors are stable, and memecoin interest is rising.";
    const offchainAnalysis = "Off-chain sentiment from social platforms shows a 15% increase in positive mentions for SEI over the last 7 days. Developer activity on GitHub remains robust, with three major repositories showing consistent commits. A confirmed v2 network upgrade is scheduled for next month, which is driving speculative interest.";
    const onchainAnalysis = "On-chain data confirms the positive sentiment. Whale wallet '0x123...abc' has accumulated over 500,000 SEI in the past 48 hours. Floor prices for the top 5 Sei NFT collections have remained stable with a slight uptick in volume. Memecoin 'SEIYAN' has seen a 30% increase in token inflows, indicating heightened retail interest.";
    
    // 4. Store the data hash on a Sei native contract (simulated).
    // This creates a verifiable, onchain data layer.

    return { 
      summary,
      onchainAnalysis,
      offchainAnalysis,
      onchainLog,
      offchainLog,
    };
  }
);
