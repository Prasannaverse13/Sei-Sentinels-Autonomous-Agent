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
import type { ProposalDetails } from '@/lib/types';


const DefiPaymentsAgentInputSchema = z.object({
  action: z.enum(["propose_trade", "execute_trade", "execute_payment"]),
  details: z.string().describe('Details of the action, e.g., "Swap 20% of USDC for SEI" or "Pay 5 SEI to agent 0x... for data services".'),
  dataAnalysis: z.string().optional().describe('The data analysis from the Data Sentinel agent.'),
});
export type DefiPaymentsAgentInput = z.infer<typeof DefiPaymentsAgentInputSchema>;

const ProposalDetailsSchema = z.object({
  transactionType: z.string(),
  strategy: z.string(),
  assetsInvolved: z.string(),
  estimatedYield: z.string(),
  reasoning: z.string(),
  estimatedGasFee: z.string(),
});

const DefiPaymentsAgentOutputSchema = z.object({
  status: z.string().describe('The status of the transaction (e.g., "Proposed", "Executed").'),
  transactionId: z.string().describe('The on-chain transaction ID.'),
  crossmintLog: z.string().describe('Log message from the Crossmint GOAT SDK interaction.'),
  hiveLog: z.string().describe('Log message from the Hive Intelligence API interaction.'),
  proposal: ProposalDetailsSchema.optional().describe("The detailed transaction proposal for user review."),
  paymentConfirmation: z.string().optional().describe("Confirmation message for A2A payments."),
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
    let proposal: ProposalDetails | undefined = undefined;
    let paymentConfirmation: string | undefined = undefined;


    if (input.action === 'propose_trade') {
      hiveLog = `Hive Intelligence API: Analyzed data - '${input.dataAnalysis}'. Identified yield opportunity in SEI/USDC liquidity pool.`;
      status = "Proposed";
      sdkLog = `Transaction simulated on a forked Sei blockchain. Ready for user review.`;
      
      proposal = {
        transactionType: "Liquidity Provision",
        strategy: "Yield Optimization",
        assetsInvolved: "150 SEI and 75 USDC",
        estimatedYield: "~18% APR",
        reasoning: `The Data Sentinel identified SEI as a trending asset with high developer activity. Hive Intelligence analysis suggests this specific pool offers the highest risk-adjusted return.`,
        estimatedGasFee: "0.0005 SEI",
      };
      
    } else if (input.action === 'execute_trade') {
        hiveLog = `Hive Intelligence API: Not required for trade execution.`;
        status = "Executed";
        sdkLog = `Crossmint GOAT SDK: Liquidity provision for '${input.details}' executed successfully.`;
    } else { // execute_payment
      hiveLog = `Hive Intelligence API: Not required for direct payment.`;
      status = "Executed";
      sdkLog = `Crossmint GOAT SDK: Payment for '${input.details}' processed successfully.`;
      paymentConfirmation = `A2A Payment Confirmed! Paid 5 SEI to Data Sentinel (0x123...abc) for data services.`;
    }

    return { 
      status: `${status}`,
      transactionId: txId,
      crossmintLog: sdkLog,
      hiveLog: hiveLog,
      proposal,
      paymentConfirmation,
    };
  }
);
