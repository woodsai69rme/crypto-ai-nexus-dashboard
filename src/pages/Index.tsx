
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/contexts/SettingsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MarketOverview } from '@/components/trading/MarketOverview';
import { EnhancedTradingInterface } from '@/components/trading/EnhancedTradingInterface';
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
import { SettingsManager } from '@/components/settings/SettingsManager';
import { VisualEffects } from '@/components/effects/VisualEffects';
import { Activity, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { marketDataService } from '@/services/marketDataService';

const Index = () => {
  const { signOut } = useAuth();
  const { settings } = useSettings();
  const { toast } = useToast();
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-AUD');
  const [isLoading, setIsLoading] = useState(true);
  const [isPaperTradingOpen, setIsPaperTradingOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // TopBar only - no news ticker padding
  const topPadding = 'pt-16';
  const bottomPadding = settings.newsTickerEnabled ? 'pb-20' : 'pb-4';

  useEffect(() => {
    const initializeApp = async () => {
      try {
        marketDataService.startRealTimeUpdates();
        const symbols = ['BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD'];
        await marketDataService.getMarketData(symbols);
        setTimeout(() => setIsLoading(false), 1500);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
    return () => marketDataService.cleanup();
  }, []);

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className={`animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto ${settings.animations ? '' : 'animate-none'}`}></div>
          <h2 className="text-2xl font-bold text-white">Loading CryptoMax Dashboard</h2>
          <p className="text-slate-300">Initializing real-time market data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative">
      <VisualEffects />
      
      <TopBar 
        onOpenSettings={handleOpenSettings}
        onOpenNotifications={handleOpenNotifications}
        onOpenProfile={handleOpenProfile}
      />
      
      <div className={`flex min-h-screen ${topPadding} ${bottomPadding}`}>
        <SidePanel />
        
        <main className="flex-1 overflow-auto p-2 sm:p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <QuickStats />
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Button 
                onClick={() => setIsPaperTradingOpen(true)}
                className={`bg-emerald-500 hover:bg-emerald-600 text-xs sm:text-sm ${settings.animations ? 'transition-all duration-200' : ''}`}
                size="sm"
              >
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Paper Trading
              </Button>
              <Button 
                onClick={handleOpenSettings}
                variant="outline"
                size="sm"
                className={`border-emerald-600 text-emerald-400 hover:bg-emerald-600/20 text-xs sm:text-sm ${settings.animations ? 'transition-all duration-200' : ''}`}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Settings
              </Button>
              <Button 
                onClick={signOut}
                variant="outline"
                size="sm"
                className={`border-red-600 text-red-400 hover:bg-red-600/20 text-xs sm:text-sm ${settings.animations ? 'transition-all duration-200' : ''}`}
              >
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 space-y-4">
              <Tabs defaultValue="trading" className="space-y-4">
                <TabsList className="bg-slate-800/50 border border-slate-700 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 p-1 h-auto">
                  <TabsTrigger value="trading" className="text-xs p-2">Trading</TabsTrigger>
                  <TabsTrigger value="overview" className="text-xs p-2">Market</TabsTrigger>
                  <TabsTrigger value="bots" className="text-xs p-2">AI Bots</TabsTrigger>
                  <TabsTrigger value="advanced-bots" className="text-xs p-2">Advanced</TabsTrigger>
                  <TabsTrigger value="portfolio" className="text-xs p-2">Portfolio</TabsTrigger>
                  <TabsTrigger value="realtime" className="text-xs p-2">Real-Time</TabsTrigger>
                  <TabsTrigger value="defi" className="text-xs p-2">DeFi</TabsTrigger>
                  <TabsTrigger value="alerts" className="text-xs p-2">Alerts</TabsTrigger>
                  <TabsTrigger value="nft" className="text-xs p-2">NFT</TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs p-2">Analytics</TabsTrigger>
                  <TabsTrigger value="algorand" className="text-xs p-2">Algorand</TabsTrigger>
                  <TabsTrigger value="algo-defi" className="text-xs p-2">Algo DeFi</TabsTrigger>
                  <TabsTrigger value="news" className="text-xs p-2">News</TabsTrigger>
                  <TabsTrigger value="multichain" className="text-xs p-2">Multi-Chain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="trading">
                  <EnhancedTradingInterface 
                    selectedSymbol={selectedSymbol} 
                    onSymbolChange={setSelectedSymbol} 
                  />
                </TabsContent>
                
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

      <NewsTicker onOpenSettings={handleOpenSettings} />

      <PaperTradingDashboard 
        isOpen={isPaperTradingOpen}
        onClose={() => setIsPaperTradingOpen(false)}
      />

      <SettingsManager
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default Index;
