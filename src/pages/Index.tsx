
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { TradingChart } from '@/components/trading/TradingChart';
import { BotManager } from '@/components/bots/BotManager';
import { AdvancedBotManager } from '@/components/bots/AdvancedBotManager';
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
import { PaperTradingDashboard } from '@/components/trading/PaperTradingDashboard';
import { Activity, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-AUD');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaperTradingOpen, setIsPaperTradingOpen] = useState(false);

  useEffect(() => {
    // Initialize the application
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenNotifications = () => {
    toast({
      title: "Notifications",
      description: "No new notifications at this time",
    });
  };

  const handleOpenProfile = () => {
    toast({
      title: "Profile",
      description: "Opening user profile settings...",
    });
  };

  const handleOpenSettings = () => {
    toast({
      title: "Settings",
      description: "Opening settings panel...",
    });
  };

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
      <NewsTicker onOpenSettings={handleOpenSettings} />
      
      <div className="flex h-screen pt-24">
        <SidePanel />
        
        <main className="flex-1 overflow-auto p-4 space-y-4">
          <div className="flex items-center justify-between">
            <QuickStats />
            <div className="flex items-center space-x-3">
              <Button 
                onClick={() => setIsPaperTradingOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Activity className="h-4 w-4 mr-2" />
                Paper Trading
              </Button>
              <Button 
                onClick={handleOpenSettings}
                variant="outline"
                className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={signOut}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/20"
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <TradingChart selectedSymbol={selectedSymbol} />
              
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto gap-1 p-2">
                  <TabsTrigger value="overview" className="text-xs">Market</TabsTrigger>
                  <TabsTrigger value="bots" className="text-xs">AI Bots</TabsTrigger>
                  <TabsTrigger value="advanced-bots" className="text-xs">Advanced</TabsTrigger>
                  <TabsTrigger value="portfolio" className="text-xs">Portfolio</TabsTrigger>
                  <TabsTrigger value="realtime" className="text-xs">Real-Time</TabsTrigger>
                  <TabsTrigger value="defi" className="text-xs">DeFi</TabsTrigger>
                  <TabsTrigger value="alerts" className="text-xs">Alerts</TabsTrigger>
                  <TabsTrigger value="nft" className="text-xs">NFT</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
                  <TabsTrigger value="algorand" className="text-xs">Algorand</TabsTrigger>
                  <TabsTrigger value="algo-defi" className="text-xs">Algo DeFi</TabsTrigger>
                  <TabsTrigger value="news" className="text-xs">News</TabsTrigger>
                  <TabsTrigger value="multichain" className="text-xs">Multi-Chain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview">
                  <MarketOverview onSymbolSelect={setSelectedSymbol} />
                </TabsContent>
                
                <TabsContent value="bots">
                  <BotManager />
                </TabsContent>
                
                <TabsContent value="advanced-bots">
                  <AdvancedBotManager />
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

      <PaperTradingDashboard 
        isOpen={isPaperTradingOpen}
        onClose={() => setIsPaperTradingOpen(false)}
      />
    </div>
  );
};

export default Index;
