
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { TradingChart } from '@/components/trading/TradingChart';
import { BotManager } from '@/components/bots/BotManager';
import { Portfolio } from '@/components/portfolio/Portfolio';
import { RealTimePortfolio } from '@/components/portfolio/RealTimePortfolio';
import { YieldFarmingCalculator } from '@/components/defi/YieldFarmingCalculator';
import { PriceAlertSystem } from '@/components/alerts/PriceAlertSystem';
import { NFTCollectionManager } from '@/components/nft/NFTCollectionManager';
import { AdvancedTradingAnalytics } from '@/components/analytics/AdvancedTradingAnalytics';
import { NewsTicker } from '@/components/news/NewsTicker';
import { SidePanel } from '@/components/layout/SidePanel';
import { TopBar } from '@/components/layout/TopBar';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { TrendingCryptos } from '@/components/dashboard/TrendingCryptos';
import { AIInsights } from '@/components/ai/AIInsights';
import { AlgorandPortfolio } from '@/components/algorand/AlgorandPortfolio';
import { AlgorandDeFi } from '@/components/algorand/AlgorandDeFi';
import { CryptoNews } from '@/components/trading/CryptoNews';
import { MultiChainTracker } from '@/components/trading/MultiChainTracker';

const Index = () => {
  const { signOut } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-AUD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize the application
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
          <h2 className="text-2xl font-bold text-white">Loading CryptoMax Dashboard</h2>
          <p className="text-slate-300">Initializing real-time market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <TopBar />
      <NewsTicker />
      
      <div className="flex h-screen pt-20">
        <SidePanel />
        
        <main className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <QuickStats />
            <Button 
              onClick={signOut}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
            >
              Sign Out
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <TradingChart selectedSymbol={selectedSymbol} />
              
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
                  <TabsTrigger value="overview">Market</TabsTrigger>
                  <TabsTrigger value="bots">AI Bots</TabsTrigger>
                  <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                  <TabsTrigger value="realtime">Real-Time</TabsTrigger>
                  <TabsTrigger value="defi">DeFi</TabsTrigger>
                  <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  <TabsTrigger value="nft">NFT</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="algorand">Algorand</TabsTrigger>
                  <TabsTrigger value="algo-defi">Algo DeFi</TabsTrigger>
                  <TabsTrigger value="news">News</TabsTrigger>
                  <TabsTrigger value="multichain">Multi-Chain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <MarketOverview onSymbolSelect={setSelectedSymbol} />
                </TabsContent>
                
                <TabsContent value="bots">
                  <BotManager />
                </TabsContent>
                
                <TabsContent value="portfolio">
                  <Portfolio />
                </TabsContent>
                
                <TabsContent value="realtime">
                  <RealTimePortfolio />
                </TabsContent>
                
                <TabsContent value="defi">
                  <YieldFarmingCalculator />
                </TabsContent>
                
                <TabsContent value="alerts">
                  <PriceAlertSystem />
                </TabsContent>
                
                <TabsContent value="nft">
                  <NFTCollectionManager />
                </TabsContent>
                
                <TabsContent value="analytics">
                  <AdvancedTradingAnalytics />
                </TabsContent>
                
                <TabsContent value="algorand">
                  <AlgorandPortfolio />
                </TabsContent>
                
                <TabsContent value="algo-defi">
                  <AlgorandDeFi />
                </TabsContent>
                
                <TabsContent value="news">
                  <CryptoNews />
                </TabsContent>
                
                <TabsContent value="multichain">
                  <MultiChainTracker />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-4">
              <TrendingCryptos onSymbolSelect={setSelectedSymbol} />
              <AIInsights />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
