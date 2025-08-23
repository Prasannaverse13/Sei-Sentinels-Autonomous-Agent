"use client";

import * as React from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sei } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// 1. Get projectID at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
    console.warn("WalletConnect projectId is not set. Some features may not work.");
}


const seiChain = {
    ...sei,
    id: 1329,
    name: 'Sei',
    rpcUrls: {
        default: { http: ['https://evm-rpc.sei-apis.com'] },
        public: { http: ['https://evm-rpc.sei-apis.com'] },
    },
    nativeCurrency: {
        name: 'SEI',
        symbol: 'SEI',
        decimals: 18,
    },
};


export const config = createConfig({
  chains: [seiChain],
  connectors: [
    injected(),
  ],
  transports: {
    [seiChain.id]: http(),
  },
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}
