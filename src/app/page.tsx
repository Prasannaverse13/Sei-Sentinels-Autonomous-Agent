"use client";

import Image from "next/image";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Cpu, DatabaseZap, Bot, Palette, Loader, Server, Wallet, BrainCircuit, Banknote, Package, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { createNftFromPrompt } from "@/ai/flows/create-nft-from-prompt";
import { summarizeMarketSentiment } from "@/ai/flows/summarize-market-sentiment";
import { generateAgentStrategies } from "@/ai/flows/generate-agent-strategies";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppLogo, SeiWhale } from "@/components/icons";
import type { Activity } from "@/lib/types";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--accent))",
  },
};

export default function DashboardPage() {
  const { toast } = useToast();
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [sentimentSummary, setSentimentSummary] = React.useState("");
  const [sentimentLoading, setSentimentLoading] = React.useState(false);
  const [investmentGoal, setInvestmentGoal] = React.useState("Maximize my DeFi portfolio yield with a focus on stablecoins and blue-chip assets.");
  const [strategies, setStrategies] = React.useState<string[]>([]);
  const [strategyLoading, setStrategyLoading] = React.useState(false);
  const [nftPrompt, setNftPrompt] = React.useState("A futuristic Sei Sentinel robot surfing on a wave of data");
  const [nftResult, setNftResult] = React.useState<{ nftDataUri: string; listingStatus: string } | null>(null);
  const [nftLoading, setNftLoading] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [portfolioData, setPortfolioData] = React.useState([]);
  const [isConnecting, setIsConnecting] = React.useState(false);

  const addActivity = (description: string, icon: React.ReactNode) => {
    setActivities(prev => [{
      description,
      icon,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 5));
  };
  
  const handleConnectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      toast({
        variant: "destructive",
        title: "MetaMask not installed",
        description: "Please install MetaMask to connect your wallet.",
      });
      return;
    }

    setIsConnecting(true);
    addActivity("Connecting to wallet...", <Wallet className="text-blue-400" />);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      // TODO: Fetch real portfolio data here
      setPortfolioData([]); 
      toast({
        title: "Wallet Connected",
        description: `Connected to address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      addActivity("Wallet connected successfully.", <Wallet className="text-green-400" />);
      handleSummarizeSentiment(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "User rejected the connection request.",
      });
      addActivity("Wallet connection failed.", <Server className="text-red-400" />);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSummarizeSentiment = React.useCallback(async (walletConnected = false) => {
    setSentimentLoading(true);
    if (walletConnected || walletAddress) {
      addActivity("Data Sentinel fetching market data...", <DatabaseZap className="text-blue-400" />);
      try {
        const result = await summarizeMarketSentiment({
          portfolioOverview: "Current portfolio consists of SEI, BTC, ETH, and various stablecoins. Moderate risk tolerance.",
          agentActivities: "Recent activities include rebalancing portfolio to increase SEI exposure and monitoring memecoin volatility."
        });
        setSentimentSummary(result.marketSentimentSummary);
        addActivity("Market sentiment analysis complete.", <BrainCircuit className="text-green-400" />);
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to summarize market sentiment.",
        });
        addActivity("Failed to fetch market sentiment.", <Server className="text-red-400" />);
      } finally {
        setSentimentLoading(false);
      }
    } else {
        setSentimentSummary("Please connect your wallet to analyze market sentiment.");
        setSentimentLoading(false);
    }
  }, [toast, walletAddress]);

  const handleGenerateStrategies = async () => {
    if (!investmentGoal) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter an investment goal.",
      });
      return;
    }
    setStrategyLoading(true);
    setStrategies([]);
    addActivity("Orchestrator creating new strategies...", <Cpu className="text-purple-400" />);
    try {
      const result = await generateAgentStrategies({ investmentGoal });
      setStrategies(result.strategies);
      addActivity("New agent strategies generated.", <BrainCircuit className="text-green-400" />);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate strategies.",
      });
      addActivity("Failed to generate strategies.", <Server className="text-red-400" />);
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleCreateNft = async () => {
    if (!nftPrompt) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter a prompt for the NFT.",
      });
      return;
    }
    setNftLoading(true);
    setNftResult(null);
    addActivity("Creative Agent generating NFT...", <Palette className="text-yellow-400" />);
    try {
      const result = await createNftFromPrompt({ prompt: nftPrompt });
      setNftResult(result);
      addActivity("NFT created and listed.", <Palette className="text-green-400" />);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create NFT.",
      });
       addActivity("Failed to create NFT.", <Server className="text-red-400" />);
    } finally {
      setNftLoading(false);
    }
  };

  React.useEffect(() => {
    handleSummarizeSentiment();
  }, [handleSummarizeSentiment]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AppLogo className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tighter text-foreground">
            Sei Sentinels
          </h1>
        </div>
        <Button variant="outline" className="flex items-center gap-2" onClick={handleConnectWallet} disabled={isConnecting || !!walletAddress}>
          {isConnecting ? (
             <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span>{walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}` : "Connect Wallet"}</span>
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DatabaseZap className="w-6 h-6 text-primary" />
                  Market Sentiment
                </CardTitle>
                <CardDescription>
                  Data Sentinel&apos;s real-time analysis of onchain and offchain data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sentimentLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{sentimentSummary}</p>
                )}
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" size="sm" onClick={() => handleSummarizeSentiment()} disabled={sentimentLoading || !walletAddress}>
                  {sentimentLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Refresh Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Orchestrator Agent
                </CardTitle>
                <CardDescription>
                  Define a high-level goal and let the Orchestrator generate and execute agent strategies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Maximize yield on stablecoins"
                  value={investmentGoal}
                  onChange={(e) => setInvestmentGoal(e.target.value)}
                  className="font-code"
                  disabled={!walletAddress}
                />
                 {strategyLoading ? (
                   <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                   </div>
                  ) : strategies.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {strategies.map((strategy, index) => (
                        <div key={index} className="p-3 text-sm rounded-md bg-muted/50 font-code">
                          {strategy}
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
              <CardFooter>
                <Button onClick={handleGenerateStrategies} disabled={strategyLoading || !walletAddress}>
                  {strategyLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Generate & Execute Plan
                </Button>
              </CardFooter>
            </Card>

             <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <SeiWhale className="w-6 h-6 text-primary" />
                  DeFi & Payments Agent
                </CardTitle>
                <CardDescription>
                  Manage portfolio and facilitate payments using the Crossmint GOAT SDK.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                 <Button disabled={!walletAddress}><Banknote />Propose Transaction</Button>
                 <Button disabled={!walletAddress}><Send />Execute A2A Payment</Button>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-primary" />
                  Creative Agent
                </CardTitle>
                <CardDescription>
                  Generate and list a unique NFT on a Sei marketplace based on your prompt.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex gap-4">
                    <Input
                      placeholder="e.g., A cyberpunk whale swimming in a sea of code"
                      value={nftPrompt}
                      onChange={(e) => setNftPrompt(e.target.value)}
                      className="font-code"
                      disabled={!walletAddress}
                    />
                     <Button onClick={handleCreateNft} disabled={nftLoading || !walletAddress} className="min-w-fit">
                      {nftLoading ? <Loader className="w-4 h-4 animate-spin" /> : "Create NFT"}
                    </Button>
                 </div>
                 {nftLoading && (
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg border-border aspect-square">
                       <Loader className="w-8 h-8 mb-2 animate-spin text-accent" />
                       <p className="text-sm text-muted-foreground">Generating NFT...</p>
                    </div>
                 )}
                 {nftResult && (
                    <div className="p-4 border-2 border-dashed rounded-lg border-border">
                        <div className="relative w-full overflow-hidden rounded-lg aspect-square">
                         <Image src={nftResult.nftDataUri} alt="Generated NFT" fill className="object-cover" />
                        </div>
                        <p className="mt-2 text-sm text-center text-green-400 font-code">{nftResult.listingStatus}</p>
                    </div>
                 )}
              </CardContent>
            </Card>

          </div>

          <div className="space-y-6 lg:col-span-1">
             <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-6 h-6 text-primary" />
                  MCP Server & Agent Activity
                </CardTitle>
                <CardDescription>Live feed of Orchestrator and Agent actions.</CardDescription>
              </CardHeader>
              <CardContent>
                {activities.length === 0 && !sentimentLoading ? (
                  <p className="text-sm text-center text-muted-foreground">No recent activity.</p>
                ) : (
                  <ul className="space-y-4">
                    {activities.map((activity, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="p-2 rounded-full bg-muted">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px]">
                  <ChartContainer config={chartConfig} className="w-full min-h-[200px]">
                    <AreaChart
                      accessibilityLayer
                      data={portfolioData}
                      margin={{
                        left: 12,
                        right: 12,
                      }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                      <Area
                        dataKey="value"
                        type="natural"
                        fill="var(--color-value)"
                        fillOpacity={0.4}
                        stroke="var(--color-value)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
