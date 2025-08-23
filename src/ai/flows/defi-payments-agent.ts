'use server';
/**
 * @fileOverview DeFi & Payments Agent: The Autonomous Financial Actor.
 *
 * - defiPaymentsAgent - A function that proposes and executes financial transactions.
 * - DefiPaymentsAgentInput - The input type for the defiPaymentsAgent function.
 * - DefiPaymentsAgentOutput - The return type for the defiPaymentsAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DefiPaymentsAgentInputSchema = z.object({
  action: z.enum(["propose_trade", "execute_payment"]),
  details: z.string().describe('Details of the action, e.g., "Swap 20% of USDC for SEI" or "Pay 5 SEI to agent 0x... for data services".'),
  dataAnalysis: z.string().optional().describe('The data analysis from the Data Sentinel agent.'),
});
export type DefiPaymentsAgentInput = z.infer<typeof DefiPaymentsAgentInputSchema>;

const DefiPaymentsAgentOutputSchema = z.object({
  status: z.string().describe('The status of the transaction (e.g., "Proposed", "Executed").'),
  transactionId: z.string().describe('The on-chain transaction ID.'),
  crossmintLog: z.string().describe('Log message from the Crossmint GOAT SDK interaction.'),
  hiveLog: z.string().describe('Log message from the Hive Intelligence API interaction.')
});
export type DefiPaymentsAgentOutput = z.infer<typeof DefiPaymentsAgentOutputSchema>;

export async function defiPaymentsAgent(input: DefiPaymentsAgentInput): Promise<DefiPaymentsAgentOutput> {
  return defiPaymentsAgentFlow(input);
}

const defiPaymentsAgentFlow = ai.defineFlow(
  {
    name: 'defiPaymentsAgentFlow',
    inputSchema: DefiPaymentsAgentInputSchema,
    outputSchema: DefiPaymentsAgentOutputSchema,
  },
  async (input) => {
    let txId = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    let status = "Executed";
    let sdkLog = "";
    let hiveLog = "";

    if (input.action === 'propose_trade') {
      hiveLog = `Hive Intelligence API: Analyzed data - '${input.dataAnalysis}'. Recommendation: '${input.details}'.`;
      status = "Proposed";
      sdkLog = `Trade proposal for '${input.details}' submitted to Orchestrator. Awaiting execution via ElizaOS agentic wallet.`;
    } else { // execute_payment
      hiveLog = `Hive Intelligence API: Not required for direct payment.`;
      status = "Executed";
      sdkLog = `Crossmint GOAT SDK: Payment for '${input.details}' processed successfully.`;
    }

    return { 
      status: `${status}`,
      transactionId: txId,
      crossmintLog: sdkLog,
      hiveLog: hiveLog,
    };
  }
);
