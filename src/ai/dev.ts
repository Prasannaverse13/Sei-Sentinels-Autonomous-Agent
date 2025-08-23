import { config } from 'dotenv';
config();

import '@/ai/flows/create-nft-from-prompt.ts';
import '@/ai/flows/summarize-market-sentiment.ts';
import '@/ai/flows/generate-agent-strategies.ts';
import '@/ai/flows/orchestrator-agent.ts';
import '@/ai/flows/data-sentinel-agent.ts';
import '@/ai/flows/defi-payments-agent.ts';
