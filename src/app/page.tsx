"use client";

import Image from "next/image";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Cpu, DatabaseZap, Bot, Palette, Loader, Server, Wallet, BrainCircuit } from "lucide-react";

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
import { AppLogo } from "@/components/icons";
import type { Activity } from "@/lib/types";


const portfolioData = [
  { month: "Jan", value: 4000 },
  { month: "Feb", value: 3000 },
  { month: "Mar", value: 5000 },
  { month: "Apr", value: 4500 },
  { month: "May", value: 6000 },
  { month: "Jun", value: 7500 },
];

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
  const [sentimentLoading, setSentimentLoading] = React.useState(true);
  const [investmentGoal, setInvestmentGoal] = React.useState("Maximize my DeFi portfolio yield with a focus on stablecoins and blue-chip assets.");
  const [strategies, setStrategies] = React.useState<string[]>([]);
  const [strategyLoading, setStrategyLoading] = React.useState(false);
  const [nftPrompt, setNftPrompt] = React.useState("A futuristic Sei Sentinel robot surfing on a wave of data");
  const [nftResult, setNftResult] = React.useState<{ nftDataUri: string; listingStatus: string } | null>(null);
  const [nftLoading, setNftLoading] = React.useState(false);

  const addActivity = (description: string, icon: React.ReactNode) => {
    setActivities(prev => [{
      description,
      icon,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 5));
  };
  
  const handleSummarizeSentiment = React.useCallback(async () => {
    setSentimentLoading(true);
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
  }, [toast]);

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
        <Button variant="outline" className="flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet</span>
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
                 <Button variant="ghost" size="sm" onClick={handleSummarizeSentiment} disabled={sentimentLoading}>
                  {sentimentLoading ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Refresh Analysis
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-6 h-6 text-primary" />
                  Strategy Builder
                </CardTitle>
                <CardDescription>
                  Define a high-level goal and let the Orchestrator generate agent strategies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="e.g., Maximize yield on stablecoins"
                  value={investmentGoal}
                  onChange={(e) => setInvestmentGoal(e.target.value)}
                  className="font-code"
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
                <Button onClick={handleGenerateStrategies} disabled={strategyLoading}>
                  {strategyLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Strategies
                </Button>
              </CardFooter>
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
                    />
                     <Button onClick={handleCreateNft} disabled={nftLoading} className="min-w-fit">
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
                  <Cpu className="w-6 h-6 text-primary" />
                  Agent Activity
                </CardTitle>
                <CardDescription>Live feed of Sentinel actions.</CardDescription>
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
                   <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={portfolioData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                        <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`}/>
                        <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} cursor={{ fill: 'hsl(var(--accent) / 0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="hsl(var(--accent))" fill="url(#colorValue)" />
                      </AreaChart>
                   </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
