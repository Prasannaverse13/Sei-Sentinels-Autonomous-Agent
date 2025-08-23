'use server';
/**
 * @fileOverview Orchestrator Agent: The Commander of the Network.
 *
 * - orchestratorAgent - A function that takes a high-level goal and breaks it down into executable tasks.
 * - OrchestratorAgentInput - The input type for the orchestratorAgent function.
 * - OrchestratorAgentOutput - The return type for the orchestratorAgent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OrchestratorAgentInputSchema = z.object({
  goal: z.string().describe('The high-level goal for the agent network.'),
});
export type OrchestratorAgentInput = z.infer<typeof OrchestratorAgentInputSchema>;

const OrchestratorAgentOutputSchema = z.object({
  plan: z.array(z.string()).describe('A sequence of tasks to be executed by other agents.'),
  executionLog: z.string().describe('A log of the orchestration process and on-chain interactions.'),
});
export type OrchestratorAgentOutput = z.infer<typeof OrchestratorAgentOutputSchema>;

export async function orchestratorAgent(input: OrchestratorAgentInput): Promise<OrchestratorAgentOutput> {
  return orchestratorAgentFlow(input);
}

const orchestratorAgentFlow = ai.defineFlow(
  {
    name: 'orchestratorAgentFlow',
    inputSchema: OrchestratorAgentInputSchema,
    outputSchema: OrchestratorAgentOutputSchema,
  },
  async (input) => {
    // 1. Use Cambrian Agent Kit to parse the goal and create a hierarchical task plan.
    const executionLog = `
      Orchestrator: Goal received - "${input.goal}".
      Orchestrator: Using Cambrian Agent Kit for hierarchical task planning.
      Orchestrator: Plan generated. Updating state on Sei blockchain via MCP Server.
      Orchestrator: Beginning autonomous execution with ElizaOS wallet...
    `.trim().replace(/^ +/gm, '');

    // Simulate plan generation based on the goal.
    const plan = [
      `Task 1: Delegate to DataSentinel(query: "Get comprehensive market overview for '${input.goal}'")`,
      `Task 2: Delegate to DeFiPaymentsAgent(action: propose_trade, details: "Swap 20% of USDC for SEI to capitalize on bullish trend")`,
      `Task 3: Delegate to DeFiPaymentsAgent(action: execute_payment, details: "Pay 0.5 SEI to DataSentinel for services")`,
      `Task 4: Delegate to ConsumerAgent(notify_user, status: "Plan execution complete")`,
    ];


    return { plan, executionLog };
  }
);
