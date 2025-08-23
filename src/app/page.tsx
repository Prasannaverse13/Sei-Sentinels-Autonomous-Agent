"use client";

import Image from "next/image";
import * as React from "react";
import { AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Area } from "recharts";
import { Cpu, DatabaseZap, Bot, Palette, Loader, Server, Wallet, BrainCircuit, Banknote, Package, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { createNftFromPrompt, CreateNftFromPromptOutput } from "@/ai/flows/create-nft-from-prompt";
import { dataSentinelAgent } from "@/ai/flows/data-sentinel-agent";
import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";
import { defiPaymentsAgent, DefiPaymentsAgentInput } from "@/ai/flows/defi-payments-agent";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppLogo, SeiWhale } from "@/components/icons";
import type { Activity } from "@/lib/types";

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--accent))",
  },
};

const connectedPortfolioData = [
  { month: "Jan", value: 1860 },
  { month: "Feb", value: 3050 },
  { month: "Mar", value: 2370 },
  { month: "Apr", value: 2730 },
  { month: "May", value: 2090 },
  { month: "Jun", value: 4120 },
  { month: "Jul", value: 4500 },
  { month: "Aug", value: 4890 },
  { month: "Sep", value: 5120 },
];

export default function DashboardPage() {
  const { toast } = useToast();
  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [analysisSummary, setAnalysisSummary] = React.useState("Connect your wallet to get the latest intelligence brief from the Data Sentinel.");
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [investmentGoal, setInvestmentGoal] = React.useState("Maximize my DeFi portfolio yield with a focus on stablecoins and blue-chip assets.");
  const [strategies, setStrategies] = React.useState<string[]>([]);
  const [strategyLoading, setStrategyLoading] = React.useState(false);
  const [nftPrompt, setNftPrompt] = React.useState("A cyberpunk whale swimming in a sea of code");
  const [nftResult, setNftResult] = React.useState<CreateNftFromPromptOutput | null>(null);
  const [nftLoading, setNftLoading] = React.useState(false);
  const [walletAddress, setWalletAddress] = React.useState<string | null>(null);
  const [portfolioData, setPortfolioData] = React.useState<any[]>([]);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [paymentLoading, setPaymentLoading] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState<string | null>(null);

  const addActivity = (description: string, icon: React.ReactNode, details?: string) => {
    setActivities(prev => [{
      description,
      icon,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 10));
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
    addActivity("Connecting to Compass Wallet...", <Wallet className="text-blue-400" />);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      setWalletAddress(address);
      addActivity("Wallet connected successfully.", <Wallet className="text-green-400" />, `Address: ${address.substring(0, 6)}...`);
      
      addActivity("Fetching portfolio data...", <DatabaseZap className="text-blue-400" />);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      setPortfolioData(connectedPortfolioData);
      addActivity("Portfolio data loaded.", <DatabaseZap className="text-green-400" />);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });
      
      handleRefreshAnalysis();

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

  const handleRefreshAnalysis = React.useCallback(async () => {
    if (!walletAddress) {
      setAnalysisSummary("Please connect your wallet to analyze market sentiment.");
      return;
    }
    setAnalysisLoading(true);
    addActivity("Orchestrator: Goal received - 'Get market data'.", <Cpu className="text-purple-400" />);
    addActivity("Orchestrator: Delegating to Data Sentinel...", <Send className="text-purple-400" />);
    
    try {
      const result = await dataSentinelAgent({ query: "Get a comprehensive market overview with a focus on SEI and memecoin sentiment" });
      
      addActivity("Data Sentinel: Fetching off-chain data...", <DatabaseZap className="text-blue-400" />, result.offchainLog);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addActivity("Data Sentinel: Fetching on-chain data...", <DatabaseZap className="text-blue-400" />, result.onchainLog);
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      addActivity("Data Sentinel: Synthesizing data...", <BrainCircuit className="text-blue-400" />);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAnalysisSummary(result.analysis);
      addActivity("Data Sentinel: Analysis complete. Brief updated.", <BrainCircuit className="text-green-400" />);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch market analysis.",
      });
      addActivity("Data Sentinel: Failed to fetch analysis.", <Server className="text-red-400" />);
    } finally {
      setAnalysisLoading(false);
    }
  }, [walletAddress, toast]);


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
    
    addActivity("Orchestrator: Goal received.", <Cpu className="text-purple-400" />, `Goal: "${investmentGoal}"`);
    
    try {
      const result = await orchestratorAgent({ goal: investmentGoal });
      addActivity("Orchestrator: Plan generated with Cambrian Agent Kit.", <BrainCircuit className="text-green-400" />, result.executionLog);
      setStrategies(result.plan);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      addActivity("Orchestrator: Beginning autonomous execution...", <Cpu className="text-purple-400" />);
      
      for (const task of result.plan) {
         await new Promise(resolve => setTimeout(resolve, 1500));
         addActivity(`Orchestrator: Delegating task...`, <Send className="text-purple-400" />, task);
      }
       await new Promise(resolve => setTimeout(resolve, 1000));
       addActivity("Orchestrator: Plan execution complete. State updated on Sei via MCP.", <BrainCircuit className="text-green-400" />);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate strategies.",
      });
      addActivity("Orchestrator: Failed to generate plan.", <Server className="text-red-400" />);
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
    addActivity("Orchestrator: Goal received - 'Create and list an NFT'.", <Cpu className="text-purple-400" />);
    addActivity("Orchestrator: Delegating to Creative Agent (AIDN)...", <Send className="text-purple-400" />);
    
    try {
      addActivity("Creative Agent: Generating asset with AI...", <Palette className="text-yellow-400" />);
      const result = await createNftFromPrompt({ prompt: nftPrompt });
      
      addActivity("Creative Agent: Minting NFT on Sei via Crossmint GOAT SDK...", <Palette className="text-yellow-400" />);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addActivity("Creative Agent: Listing NFT on marketplace...", <Palette className="text-yellow-400" />);
      await new Promise(resolve => setTimeout(resolve, 1000));

      setNftResult(result);
      addActivity("Creative Agent: NFT created and listed.", <Palette className="text-green-400" />, result.listingStatus);
      
      addActivity("Creative Agent: Notifying user...", <Send className="text-yellow-400" />, result.notificationStatus);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create NFT.",
      });
       addActivity("Creative Agent: Failed to create NFT.", <Server className="text-red-400" />);
    } finally {
      setNftLoading(false);
    }
  };

  const handleDeFiAction = async (action: DefiPaymentsAgentInput['action'], details: string) => {
    setPaymentLoading(true);
    setPaymentStatus(null);
    addActivity(`Orchestrator: Manual trigger for DeFi Agent.`, <Cpu className="text-purple-400" />, `Action: ${action}`);
    addActivity(`Orchestrator: Delegating to DeFi Agent...`, <Send className="text-purple-400" />);
    
    try {
      let result;
      if(action === 'propose_trade'){
        addActivity(`DeFi Agent: Using Hive Intelligence for analysis...`, <BrainCircuit className="text-blue-400" />);
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = await defiPaymentsAgent({ action, details, dataAnalysis: analysisSummary });
        addActivity(`DeFi Agent: Analysis complete.`, <BrainCircuit className="text-green-400" />, result.hiveLog);
      } else {
        addActivity(`DeFi Agent: Initiating A2A payment...`, <Banknote className="text-blue-400" />);
        result = await defiPaymentsAgent({ action, details });
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      addActivity(`DeFi Agent: Submitting transaction via Crossmint/ElizaOS...`, <Banknote className="text-blue-400" />);
      
      setPaymentStatus(result.crossmintLog);
      addActivity(`DeFi Agent: Action successful.`, <Banknote className="text-green-400" />, `Tx: ${result.transactionId.substring(0,12)}...`);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "DeFi Action Failed",
        description: "Could not complete the transaction.",
      });
      addActivity("DeFi Agent: Action failed.", <Server className="text-red-400" />);
    } finally {
      setPaymentLoading(false);
    }
  };

  React.useEffect(() => {
    if (walletAddress) {
      handleRefreshAnalysis();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  Data Sentinel: Intelligence Brief
                </CardTitle>
                <CardDescription>
                  Continuous onchain & offchain analysis hub.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{analysisSummary}</p>
                )}
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" size="sm" onClick={() => handleRefreshAnalysis()} disabled={analysisLoading || !walletAddress}>
                  {analysisLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Refresh Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Orchestrator Agent: Commander
                </CardTitle>
                <CardDescription>
                  Define a high-level goal and watch the Orchestrator build and execute a plan.
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
                  DeFi & Payments Agent: Financial Actor
                </CardTitle>
                <CardDescription>
                  Manually trigger autonomous portfolio actions and agent-to-agent payments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button onClick={() => handleDeFiAction('propose_trade', 'Swap 20% of USDC for SEI')} disabled={!walletAddress || paymentLoading}>
                    {paymentLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    <Banknote />Propose Transaction
                  </Button>
                  <Button onClick={() => handleDeFiAction('execute_payment', 'Pay 0.5 SEI to DataSentinel for services')} disabled={!walletAddress || paymentLoading}>
                    {paymentLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                    <Send />Execute A2A Payment
                  </Button>
                </div>
                 {paymentStatus && (
                    <div className="p-3 text-sm rounded-md bg-muted/50 font-code text-green-400">
                        {paymentStatus}
                    </div>
                 )}
              </CardContent>
            </Card>
            
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-6 h-6 text-primary" />
                  Creative Agent: Art Broker
                </CardTitle>
                <CardDescription>
                  Generate, mint, and list a unique NFT on a Sei marketplace based on your prompt.
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
                       <p className="text-sm text-muted-foreground">Generating, Minting, Listing...</p>
                    </div>
                 )}
                 {nftResult && (
                    <div className="p-4 border-2 border-dashed rounded-lg border-border">
                        <div className="relative w-full overflow-hidden rounded-lg aspect-square">
                         <Image src={nftResult.nftDataUri} alt="Generated NFT" fill className="object-cover" />
                        </div>
                        <p className="mt-2 text-sm text-center text-green-400 font-code">{nftResult.listingStatus}</p>
                         <p className="mt-2 text-xs text-center text-muted-foreground font-code">{nftResult.notificationStatus}</p>
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
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-8 text-center">
                    <Package className="w-12 h-12 mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Connect wallet to see agent activity.</p>
                  </div>
                ) : (
                   <ScrollArea className="h-[600px]">
                      <ul className="space-y-4">
                        {activities.map((activity, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="p-2 rounded-full bg-muted">{activity.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm">{activity.description}</p>
                               {activity.details && <p className="text-xs text-muted-foreground font-code">{activity.details}</p>}
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                 <CardDescription>
                  {walletAddress ? `Portfolio data for ${walletAddress.substring(0, 6)}...` : 'Connect wallet to see portfolio'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[200px]">
                  {portfolioData.length > 0 ? (
                     <ChartContainer config={chartConfig} className="w-full min-h-[200px]">
                      <AreaChart
                        accessibilityLayer
                        data={portfolioData}
                        margin={{
                          left: 0,
                          right: 12,
                          top: 5,
                          bottom: 0,
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
                         <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickCount={3}
                          tickFormatter={(value) => `$${value / 1000}k`}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <defs>
                          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area
                          dataKey="value"
                          type="natural"
                          fill="url(#fillValue)"
                          stroke="var(--color-value)"
                        />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full pt-8 text-center">
                      <Wallet className="w-12 h-12 mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Connect wallet to view portfolio</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
