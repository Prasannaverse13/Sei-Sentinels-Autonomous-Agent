import type { ReactNode } from 'react';

export interface Activity {
  icon: ReactNode;
  description: string;
  time: string;
  details?: string;
}

export interface ProposalDetails {
  transactionType: string;
  strategy: string;
  assetsInvolved: string;
  estimatedYield: string;
  reasoning: string;
  estimatedGasFee: string;
}
