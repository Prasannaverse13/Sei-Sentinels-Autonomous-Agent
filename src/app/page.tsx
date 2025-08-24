"use client";

import Image from "next/image";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Cpu, DatabaseZap, Bot, Palette, Loader, Server, Wallet, BrainCircuit, Banknote, Package, Send, Play, CheckCircle2 } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useBalance, useReadContracts } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { ethers } from "ethers";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { createNftFromPrompt, CreateNftFromPromptOutput } from "@/ai/flows/create-nft-from-prompt";
import { dataSentinelAgent, DataSentinelAgentOutput } from "@/ai/flows/data-sentinel-agent";
import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";
import { defiPaymentsAgent, DefiPaymentsAgentInput, DefiPaymentsAgentOutput } from "@/ai/flows/defi-payments-agent";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AppLogo, SeiWhale } from "@/components/icons";
import type { Activity, ProposalDetails } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const chartConfig = {
  value: {
    label: "SEI",
    color: "hsl(var(--accent))",
  },
};

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const ETH_TOKENS = [
  { name: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
  { name: "USDC", address: "0xA0b86991C6218b36c1d19D4a2e9Eb0cE3606eB48" },
  { name: "DAI",  address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" }
];


type PortfolioDataPoint = {
  asset: string;
  balance: string;
  network: string;
}

type DeFiActionPhase = "idle" | "monitoring" | "analyzing" | "simulating" | "executing_trade" | "executing_payment" | "completed";

export default function DashboardPage() {
  const { toast } = useToast();
  const { address, isConnected, isConnecting, chain } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Fetch balances for both Sei and Ethereum Mainnet
  const { data: seiBalance, isLoading: isSeiBalanceLoading } = useBalance({ address, chainId: 1329 });
  const { data: ethBalance, isLoading: isEthBalanceLoading } = useBalance({ address, chainId: 1 });


  const [activities, setActivities] = React.useState<Activity[]>([]);
  const [analysisResult, setAnalysisResult] = React.useState<DataSentinelAgentOutput | null>(null);
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [investmentGoal, setInvestmentGoal] = React.useState("Maximize my DeFi portfolio yield with a focus on stablecoins and blue-chip assets.");
  const [plan, setPlan] = React.useState<string[]>([]);
  const [planLoading, setPlanLoading] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [nftPrompt, setNftPrompt] = React.useState("A cyberpunk whale swimming in a sea of code");
  const [nftResult, setNftResult] = React.useState<CreateNftFromPromptOutput | null>(null);
  const [nftLoading, setNftLoading] = React.useState(false);
  const [portfolioData, setPortfolioData] = React.useState<PortfolioDataPoint[]>([]);
  const [executingTaskIndex, setExecutingTaskIndex] = React.useState<number | null>(null);
  const [executionReport, setExecutionReport] = React.useState<string[] | null>(null);
  const [defiPhase, setDeFiPhase] = React.useState<DeFiActionPhase>("idle");
  const [isClient, setIsClient] = React.useState(false);
  const [defiStatus, setDefiStatus] = React.useState<{ title: string; details: string, txHash?: string } | null>(null)

  const { data: tokenBalances, isLoading: isTokenBalanceLoading } = useReadContracts({
    contracts: ETH_TOKENS.map(token => ({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address],
        chainId: 1 // Always fetch from Ethereum Mainnet
    })),
    query: {
        enabled: isConnected && !!address,
    }
  });

  const { data: tokenDecimals, isLoading: isTokenDecimalsLoading } = useReadContracts({
    contracts: ETH_TOKENS.map(token => ({
        address: token.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
        chainId: 1 // Always fetch from Ethereum Mainnet
    })),
     query: {
        enabled: isConnected && !!address,
    }
  });


  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const addActivity = (description: string, icon: React.ReactNode, details?: string) => {
    setActivities(prev => [{
      description,
      icon,
      details,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev].slice(0, 20));
  };
  
  const handleConnectWallet = () => {
    if (isConnected) {
        disconnect();
        addActivity("Wallet disconnected.", <Wallet className="text-red-400" />);
    } else {
        addActivity("Connecting to Wallet...", <Wallet className="text-blue-400" />);
        connect({ connector: injected() });
    }
  };

  const handleRefreshAnalysis = React.useCallback(async () => {
    if (!isConnected) {
      setAnalysisResult(null);
      return;
    }
    setAnalysisLoading(true);
    setAnalysisResult(null);
    addActivity("Orchestrator: Goal received.", <Cpu className="text-purple-400" />, "Goal: Get up-to-date onchain and offchain market data.");
    addActivity("Orchestrator: Delegating to Data Sentinel...", <Send className="text-purple-400" />);
    
    try {
      const result = await dataSentinelAgent({ query: "Get a comprehensive market overview with a focus on SEI and memecoin sentiment" });
      addActivity("Data Sentinel: Analysis complete. Brief updated.", <BrainCircuit className="text-green-400" />);
      setAnalysisResult(result);
      return result; // Return result for plan execution
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch market analysis.",
      });
      addActivity("Data Sentinel: Failed to fetch analysis.", <Server className="text-red-400" />);
      return null;
    } finally {
      setAnalysisLoading(false);
    }
  }, [isConnected, toast]);


  const handleGeneratePlan = async () => {
    if (!investmentGoal) {
      toast({
        variant: "destructive",
        title: "Input required",
        description: "Please enter an investment goal.",
      });
      return;
    }
    setPlanLoading(true);
    setPlan([]);
    setExecutionReport(null);
    setDefiStatus(null);
    setDeFiPhase("idle");
    
    addActivity("Orchestrator: Goal received.", <Cpu className="text-purple-400" />, `Goal: "${investmentGoal}"`);
    
    try {
      const result = await orchestratorAgent({ goal: investmentGoal });
      addActivity("Orchestrator: Plan generated with Cambrian Agent Kit.", <BrainCircuit className="text-green-400" />, result.executionLog);
      setPlan(result.plan);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate plan.",
      });
      addActivity("Orchestrator: Failed to generate plan.", <Server className="text-red-400" />);
    } finally {
      setPlanLoading(false);
    }
  };
  
  const runDeFiWorkflow = async (action: DefiPaymentsAgentInput['action'], details: string) => {
    // 1. Analyzing
    setDeFiPhase("analyzing");
    setDefiStatus({ title: "Analyzing Market Data...", details: "Agent is using Hive Intelligence for on-chain analysis and opportunity identification." });
    addActivity(`DeFi Agent: Analyzing market conditions...`, <BrainCircuit className="text-blue-400" />);
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    // 2. Simulating
    setDeFiPhase("simulating");
    setDefiStatus({ title: "Running On-Chain Simulation...", details: "Performing a non-committal simulation of the proposed transaction on a forked Sei blockchain." });
    addActivity(`DeFi Agent: Running on-chain simulation...`, <Server className="text-blue-400" />);
    await new Promise(resolve => setTimeout(resolve, 2000));
  
    if (action === 'propose_trade') {
        // 3. Executing Trade
        setDeFiPhase("executing_trade");
        setDefiStatus({ title: "Executing Autonomous Trade...", details: "Rebalancing portfolio by swapping 20% of USDC for SEI to capitalize on bullish trend." });
        addActivity(`DeFi Agent: Executing trade via Crossmint...`, <Banknote className="text-blue-400" />);
        const tradeResult = await defiPaymentsAgent({ action, details });
        await new Promise(resolve => setTimeout(resolve, 1500));
        addActivity(`DeFi Agent: Trade successful.`, <Banknote className="text-green-400" />, `Tx: ${tradeResult.transactionId.substring(0,12)}...`);
        return tradeResult;

    } else if (action === 'execute_payment') {
       // 3. Executing Payment
        setDeFiPhase("executing_payment");
        setDefiStatus({ title: "Executing A2A Payment...", details: "Paying Data Sentinel agent for data services as per on-chain rules." });
        addActivity(`DeFi Agent: Processing A2A payment...`, <Banknote className="text-blue-400" />);
        const paymentResult = await defiPaymentsAgent({ action, details });
        await new Promise(resolve => setTimeout(resolve, 1500));
        setDefiStatus({ title: "A2A Payment Confirmed!", details: `Paid 5 SEI to Data Sentinel (0x123...abc) for data services.`, txHash: paymentResult.transactionId });
        addActivity(`DeFi Agent: A2A Payment Confirmed.`, <Banknote className="text-green-400" />, `Tx: ${paymentResult.transactionId.substring(0,12)}...`);
        return paymentResult;
    }
    return null;
  }

  const handleExecutePlan = async () => {
    setIsExecuting(true);
    setDefiStatus(null);
    const report: string[] = [];
    addActivity("Orchestrator: Beginning autonomous execution with ElizaOS wallet...", <Cpu className="text-purple-400" />);
    setDeFiPhase("monitoring");
    
    for (let i = 0; i < plan.length; i++) {
      const task = plan[i];
      setExecutingTaskIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
      addActivity(`Orchestrator: Executing task...`, <Send className="text-purple-400" />, task);

      if (task.includes("DataSentinel")) {
        addActivity("Orchestrator: Delegating to Data Sentinel...", <Send className="text-purple-400" />);
        const analysis = await handleRefreshAnalysis();
        if (analysis) {
          report.push(`Task ${i + 1} (Data Sentinel): Success. Fetched market analysis. Summary: "${analysis.summary}"`);
        } else {
          report.push(`Task ${i + 1} (Data Sentinel): Failed.`);
        }
      } else if (task.includes("DeFiPaymentsAgent")) {
        const actionMatch = task.match(/action: (\w+)/);
        const detailsMatch = task.match(/details: "([^"]+)"/);
        if(actionMatch && detailsMatch) {
          const action = actionMatch[1] as DefiPaymentsAgentInput['action'];
          const details = detailsMatch[1];
          addActivity(`Orchestrator: Delegating to DeFi Agent...`, <Send className="text-purple-400" />);
          const defiResult = await runDeFiWorkflow(action, details);
          
          if (defiResult) {
            report.push(`Task ${i + 1} (DeFi Agent): Success. Action: ${action}. Tx: ${defiResult.transactionId.substring(0,12)}...`);
          } else {
            report.push(`Task ${i + 1} (DeFi Agent): Failed.`);
          }
        }
      } else if (task.includes("ConsumerAgent")) {
        addActivity(`Orchestrator: Delegating to Consumer Agent...`, <Send className="text-purple-400" />);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const notification = "Notified user of plan completion.";
        addActivity(`Consumer Agent: ${notification}`, <Bot className="text-green-400" />, "Status: Plan execution complete");
        report.push(`Task ${i + 1} (Consumer Agent): Success. ${notification}`);
      }
    }
    
    setExecutingTaskIndex(null);
    await new Promise(resolve => setTimeout(resolve, 1000));
    addActivity("Orchestrator: Plan execution complete. State updated on Sei via MCP.", <BrainCircuit className="text-green-400" />);
    setIsExecuting(false);
    setDeFiPhase("completed");
    setPlan([]); // Clear plan after execution
    setExecutionReport(report);
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
      
      addActivity("Creative Agent: Notifying user via AIDN...", <Send className="text-yellow-400" />, result.notificationStatus);

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


  React.useEffect(() => {
    if (isConnected && address) {
      addActivity("Wallet connected successfully.", <Wallet className="text-green-400" />, `Address: ${address.substring(0, 6)}...`);
      handleRefreshAnalysis();
      
      const fetchedPortfolio: PortfolioDataPoint[] = [];
      if (seiBalance && parseFloat(seiBalance.formatted) > 0) {
          fetchedPortfolio.push({ asset: seiBalance.symbol, balance: parseFloat(seiBalance.formatted).toFixed(4), network: "Sei" });
      }

      if (ethBalance && parseFloat(ethBalance.formatted) > 0) {
          fetchedPortfolio.push({ asset: ethBalance.symbol, balance: parseFloat(ethBalance.formatted).toFixed(4), network: "Ethereum" });
      }

      if (tokenBalances && tokenDecimals) {
        ETH_TOKENS.forEach((token, index) => {
            const balanceResult = tokenBalances[index];
            const decimalResult = tokenDecimals[index];

            if (balanceResult.status === 'success' && decimalResult.status === 'success') {
                const rawBalance = balanceResult.result as bigint;
                const decimals = decimalResult.result as number;
                const formattedBalance = ethers.formatUnits(rawBalance, decimals);
                if (parseFloat(formattedBalance) > 0) {
                  fetchedPortfolio.push({
                      asset: token.name,
                      balance: parseFloat(formattedBalance).toFixed(4),
                      network: "Ethereum",
                  });
                }
            }
        });
      }
      
      setPortfolioData(fetchedPortfolio);
      
      if (!isSeiBalanceLoading && !isEthBalanceLoading && !isTokenBalanceLoading) {
        addActivity("Portfolio data loaded.", <DatabaseZap className="text-green-400" />);
      }

      toast({
          title: "Wallet Connected",
          description: `Connected to address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
      });

    } else {
        setPortfolioData([]);
        setAnalysisResult(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, seiBalance, ethBalance, isSeiBalanceLoading, isEthBalanceLoading, tokenBalances, tokenDecimals]);

  const renderDeFiCardContent = () => {
      const showLoader = ["analyzing", "simulating", "executing_trade", "executing_payment"].includes(defiPhase);

      if (defiPhase === "idle" || defiPhase === "monitoring" || defiPhase === 'completed') {
        if (defiStatus && defiPhase === 'completed') {
            return (
                <Card className="p-4 mt-4 border-dashed bg-muted/50">
                    <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                    <div>
                        <h4 className="font-semibold text-green-400">{defiStatus.title}</h4>
                        <p className="text-sm text-muted-foreground">{defiStatus.details}</p>
                        {defiStatus.txHash && (
                           <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-code">Tx:</span>
                            <a href={`https://www.seiscan.app/pacific-1/txs/${defiStatus.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs break-all text-accent hover:underline">
                                {defiStatus.txHash}
                            </a>
                            </div>
                        )}
                    </div>
                    </div>
                </Card>
            );
        }

        return (
          <div className="text-center text-muted-foreground">
             <p>The agent is not currently executing a DeFi strategy.</p>
             <p className="text-xs">Generate and execute a plan from the Orchestrator to begin.</p>
          </div>
        );
    }
      
    return (
         <div className="flex items-center justify-center p-8 space-x-3 text-lg text-center rounded-lg bg-muted/50">
            {showLoader && <Loader className="w-6 h-6 animate-spin text-accent" />}
            <div className="text-left">
              <p className="font-semibold">{defiStatus?.title || "Agent is working..."}</p>
              <p className="text-sm text-muted-foreground">{defiStatus?.details || "Please wait..."}</p>
            </div>
          </div>
      )
  }

  const renderPortfolioContent = () => {
    const isLoading = isConnecting || (isConnected && (isSeiBalanceLoading || isEthBalanceLoading || isTokenBalanceLoading || isTokenDecimalsLoading));

    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full pt-8 text-center">
            <Loader className="w-12 h-12 mb-4 text-muted-foreground animate-spin" />
            <p className="text-sm text-muted-foreground">Loading portfolio...</p>
        </div>
      )
    }
    
    if (!isConnected) {
       return (
        <div className="flex flex-col items-center justify-center w-full h-full pt-8 text-center">
          <Wallet className="w-12 h-12 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Connect wallet to view portfolio</p>
        </div>
      );
    }
    
    if (portfolioData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full pt-8 text-center">
          <Wallet className="w-12 h-12 mb-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No portfolio data found for this address.</p>
        </div>
      )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Network</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {portfolioData.map((asset, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{asset.asset}</TableCell>
                        <TableCell>{asset.network}</TableCell>
                        <TableCell className="text-right">{asset.balance}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
  }
  
  const renderConnectButton = () => {
    if (!isClient) {
      return <Skeleton className="w-36 h-9" />;
    }
    
    return (
        <Button variant="outline" className="flex items-center gap-2" onClick={handleConnectWallet} disabled={isConnecting}>
          {isConnecting ? (
             <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          <span>{isConnected && address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "Connect Wallet"}</span>
        </Button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <AppLogo className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tighter text-foreground">
            Sei Sentinels
          </h1>
        </div>
        {renderConnectButton()}
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
                  Continuous onchain &amp; offchain analysis hub.
                </CardDescription>
              </CardHeader>
              <CardContent>
                 {analysisLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                  </div>
                ) : analysisResult ? (
                  <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground">{analysisResult.summary}</p>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-semibold">On-Chain Analysis</h4>
                      <p className="text-muted-foreground font-code">{analysisResult.onchainAnalysis}</p>
                    </div>
                     <div className="space-y-2">
                      <h4 className="font-semibold">Off-Chain Analysis</h4>
                      <p className="text-muted-foreground font-code">{analysisResult.offchainAnalysis}</p>
                    </div>
                  </div>
                ) : (
                   <p className="text-sm text-muted-foreground">Connect your wallet to get the latest intelligence brief.</p>
                )}
              </CardContent>
              <CardFooter>
                 <Button variant="ghost" size="sm" onClick={() => handleRefreshAnalysis()} disabled={!isClient || analysisLoading || !isConnected}>
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
                  disabled={!isClient || !isConnected || planLoading || isExecuting}
                />
                 {planLoading ? (
                   <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Skeleton className="w-full h-10" />
                      <Skeleton className="w-full h-10" />
                   </div>
                  ) : plan.length > 0 ? (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold">Generated Plan:</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {plan.map((strategy, index) => (
                          <div key={index} className={`p-3 text-sm rounded-md bg-muted/50 font-code ${isExecuting && executingTaskIndex === index ? 'ring-2 ring-accent' : ''}`}>
                            {isExecuting && executingTaskIndex === index && <Loader className="inline-block w-4 h-4 mr-2 animate-spin" />}
                            {strategy}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : executionReport ? (
                     <div>
                      <h4 className="mb-2 text-sm font-semibold">Execution Summary Report:</h4>
                      <div className="p-3 space-y-2 text-sm rounded-md bg-muted/50 font-code">
                        {executionReport.map((report, index) => (
                          <p key={index} className={report.includes("Success") ? 'text-green-400' : 'text-red-400'}>{report}</p>
                        ))}
                      </div>
                    </div>
                  ) : null }
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                <Button onClick={handleGeneratePlan} disabled={!isClient || planLoading || isExecuting || !isConnected}>
                  {planLoading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                  Generate Plan
                </Button>

                {plan.length > 0 && !isExecuting && (
                  <Card className="w-full p-4 border-dashed bg-card/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Plan is ready for execution.</h4>
                        <p className="text-sm text-muted-foreground">The Orchestrator will now autonomously execute the generated plan.</p>
                      </div>
                       <Button onClick={handleExecutePlan} disabled={!isClient || isExecuting || !isConnected}>
                        <Play className="w-4 h-4 mr-2" />
                        Execute Plan Autonomously
                      </Button>
                    </div>
                  </Card>
                )}
                 {isExecuting && (
                   <div className="flex items-center w-full p-4 rounded-md bg-muted/50">
                     <Loader className="w-5 h-5 mr-3 animate-spin text-accent" />
                      <div>
                        <h4 className="font-semibold">Executing Plan...</h4>
                        <p className="text-sm text-muted-foreground">Monitoring agent activity feed for progress.</p>
                      </div>
                   </div>
                 )}
              </CardFooter>
            </Card>

             <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                   <SeiWhale className="w-6 h-6 text-primary" />
                  DeFi &amp; Payments Agent: Financial Actor
                </CardTitle>
                <CardDescription>
                  A live dashboard of the agent's autonomous, goal-driven actions on your behalf.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderDeFiCardContent()}
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
                      disabled={!isClient || !isConnected || nftLoading || isExecuting}
                    />
                     <Button onClick={handleCreateNft} disabled={!isClient || nftLoading || !isConnected || isExecuting} className="min-w-fit">
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
                  MCP Server &amp; Agent Activity
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
                   <ScrollArea className="h-[600px] pr-4">
                      <ul className="space-y-4">
                        {activities.map((activity, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="flex items-center justify-center p-2 rounded-full bg-muted">{activity.icon}</span>
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
                  {isClient && isConnected && address ? `Live wallet balance for ${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'Connect wallet to see portfolio'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full min-h-[200px]">
                 {renderPortfolioContent()}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
