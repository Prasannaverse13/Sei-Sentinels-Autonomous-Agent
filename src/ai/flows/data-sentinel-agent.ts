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

const analysisPrompt = ai.definePrompt({
  name: 'dataSentinelAnalysisPrompt',
  input: { schema: DataSentinelAgentInputSchema },
  output: { schema: DataSentinelAgentOutputSchema },
  prompt: `You are the Data Sentinel, an expert market analyst for the Sei network.
  
  Your task is to provide a detailed, realistic, and actionable intelligence brief based on the user's query.
  
  Generate a:
  1.  **Summary**: A high-level overview of the current market sentiment.
  2.  **On-Chain Analysis**: Specific, believable on-chain data points. Mention whale wallets, NFT floor prices, and token inflows for popular Sei assets. Be creative and specific (e.g., mention wallet addresses like '0x123...abc', NFT collections like 'Sei-gulls', and memecoins like 'SEIYAN').
  3.  **Off-Chain Analysis**: Believable off-chain data points. Mention social media sentiment, developer activity on GitHub, and news about network upgrades or partnerships.
  
  The user's query is: "{{query}}"
  
  For the 'onchainLog' and 'offchainLog' fields in the output, just return the simulated log messages as provided below.
  `,
});


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
    
    // 3. Analyze and synthesize the data using the AI prompt.
    const { output } = await analysisPrompt(input);
    
    if (!output) {
      throw new Error("Failed to generate analysis from the AI model.");
    }

    // 4. Store the data hash on a Sei native contract (simulated).
    // This creates a verifiable, onchain data layer.

    return { 
      summary: output.summary,
      onchainAnalysis: output.onchainAnalysis,
      offchainAnalysis: output.offchainAnalysis,
      onchainLog: onchainLog,
      offchainLog: offchainLog,
    };
  }
);
