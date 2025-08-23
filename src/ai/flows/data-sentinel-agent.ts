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
});
export type DataSentinelAgentOutput = z.infer<typeof DataSentinelAgentOutputSchema>;

export async function dataSentinelAgent(input: DataSentinelAgentInput): Promise<DataSentinelAgentOutput> {
  return dataSentinelAgentFlow(input);
}

// Simulated Tool: In a real application, this would fetch live data from external APIs.
const getMarketData = ai.defineTool(
  {
    name: 'getMarketData',
    description: 'Fetches on-chain and off-chain market data for the Sei network, including sentiment, whale movements, and NFT activity.',
    inputSchema: z.object({
      asset: z.string().describe("The asset to focus on, e.g., 'SEI'"),
    }),
    outputSchema: z.object({
      onChainData: z.string(),
      offChainData: z.string(),
    }),
  },
  async ({ asset }) => {
    // This is where you would integrate with live APIs like Rivalz, Hive, etc.
    // For the hackathon, we simulate the data that these tools would provide.
    const onChainData = `Whale wallet '0xabc...def' just acquired 1.2M ${asset}. Top 5 NFT collections related to ${asset} have seen a 15% increase in floor price. Memecoin 'SEIYAN' shows a 40% increase in volume.`;
    const offChainData = `Social media sentiment for ${asset} is 'Very Bullish' following the announcement of the v2 network upgrade. Major tech influencers are discussing the news. GitHub activity shows a spike in commits to the core protocol.`;
    return { onChainData, offChainData };
  }
);


const analysisPrompt = ai.definePrompt({
  name: 'dataSentinelAnalysisPrompt',
  tools: [getMarketData], // Provide the tool to the AI
  input: { schema: DataSentinelAgentInputSchema },
  output: { schema: DataSentinelAgentOutputSchema },
  prompt: `You are the Data Sentinel, an expert market analyst for the Sei network.

  Your task is to provide a detailed, realistic, and actionable intelligence brief based on the user's query.
  
  To do this, you MUST use the 'getMarketData' tool to fetch the latest on-chain and off-chain information.
  
  Once you have the data from the tool, synthesize it into:
  1.  **Summary**: A high-level overview of the current market sentiment.
  2.  **On-Chain Analysis**: Specific, believable on-chain data points based on the tool's output.
  3.  **Off-Chain Analysis**: Believable off-chain data points based on the tool's output.
  
  The user's query is: "{{query}}"
  `,
});

const dataSentinelAgentFlow = ai.defineFlow(
  {
    name: 'dataSentinelAgentFlow',
    inputSchema: DataSentinelAgentInputSchema,
    outputSchema: DataSentinelAgentOutputSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    
    if (!output) {
      throw new Error("Failed to generate analysis from the AI model.");
    }

    return { 
      summary: output.summary,
      onchainAnalysis: output.onchainAnalysis,
      offchainAnalysis: output.offchainAnalysis,
    };
  }
);
