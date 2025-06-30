
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Bot, 
  Newspaper, 
  Wallet, 
  BarChart3, 
  Bell,
  Activity,
  DollarSign
} from 'lucide-react';
import { EnhancedTradingInterface } from '@/components/trading/EnhancedTradingInterface';
import { BotManager } from '@/components/bots/BotManager';
import { NewsFeed } from '@/components/news/NewsFeed';
import { RealTimePortfolio } from '@/components/portfolio/RealTimePortfolio';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useOrders } from '@/hooks/useOrders';

export const MainDashboard = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC-AUD');
  const [activeTab, setActiveTab] = useState('trading');
  const { portfolio } = usePortfolio();
  const { orders } = useOrders();

  const recentOrders = orders.slice(0, 5);
  const runningBots = 3; // This would come from bot status query
  const totalPnL = portfolio?.total_pnl || 0;
  const totalValue = portfolio?.total_value || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
              <div className="flex items-center space-x-1 text-sm">
                {totalPnL >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-red-400 rotate-180" />
                )}
                <span className={totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Active Bots</CardTitle>
              <Bot className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{runningBots}</div>
              <p className="text-xs text-slate-400">Running strategies</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Recent Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{recentOrders.length}</div>
              <p className="text-xs text-slate-400">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">Market Status</CardTitle>
              <Activity className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1"></div>
                  LIVE
                </Badge>
              </div>
              <p className="text-xs text-slate-400">Real-time data</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800">
            <TabsTrigger value="trading" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Trading</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center space-x-2">
              <Wallet className="h-4 w-4" />
              <span>Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="bots" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>AI Bots</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-2">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trading" className="space-y-4">
            <EnhancedTradingInterface 
              selectedSymbol={selectedSymbol}
              onSymbolChange={setSelectedSymbol}
            />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            <RealTimePortfolio />
          </TabsContent>

          <TabsContent value="bots" className="space-y-4">
            <BotManager />
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            <NewsFeed />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-slate-400 mb-4">Comprehensive trading analytics and performance metrics</p>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                Coming Soon
              </Badge>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
