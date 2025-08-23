'use server';
/**
 * @fileOverview DeFi and Payments Agent: Manages portfolio and facilitates payments.
 *
 * - defiPaymentsAgent - A function that proposes and executes financial transactions.
 * - DefiPaymentsAgentInput - The input type for the defiPaymentsAgent function.
 * - DefiPaymentsAgentOutput - The return type for the defiPaymentsAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DefiPaymentsAgentInputSchema = z.object({
  action: z.enum(["propose_trade", "execute_payment"]),
  details: z.string().describe('Details of the action, e.g., "Buy 100 SEI" or "Pay 5 SEI to agent 0x... for data services".'),
});
export type DefiPaymentsAgentInput = z.infer<typeof DefiPaymentsAgentInputSchema>;

const DefiPaymentsAgentOutputSchema = z.object({
  status: z.string().describe('The status of the transaction (e.g., "Proposed", "Executed").'),
  transactionId: z.string().describe('The on-chain transaction ID.'),
  crossmintLog: z.string().describe('Log message from the Crossmint GOAT SDK interaction.'),
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
    // This flow simulates the DeFi agent's actions.
    // 1. Analyze data (from Data Sentinel via Orchestrator).
    // 2. Use Hive Intelligence API for advanced analytics (simulated).
    // 3. Propose or execute a transaction.
    // 4. Use Crossmint GOAT SDK for execution (simulated).
    
    const txId = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    let status = "Executed";
    let sdkLog = "";

    if (input.action === 'propose_trade') {
      status = "Proposed";
      sdkLog = `Trade proposal for '${input.details}' created. Awaiting confirmation via ElizaOS policy.`;
    } else {
      status = "Executed";
      sdkLog = `Crossmint GOAT SDK: Payment for '${input.details}' processed successfully.`;
    }

    return { 
      status: `${status} (simulated)`,
      transactionId: txId,
      crossmintLog: sdkLog,
    };
  }
);
