
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Activity,
  Plus,
  BarChart3,
  Zap,
  Brain,
  Target,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: 'running' | 'paused' | 'stopped' | 'error';
  pair: string;
  profit: number;
  profitPercent: number;
  trades: number;
  runtime: string;
  maxDrawdown: number;
  winRate: number;
  config: BotConfig;
  logs: BotLog[];
}

interface BotConfig {
  riskLevel: number;
  maxPositionSize: number;
  stopLoss: number;
  takeProfit: number;
  interval: string;
  capital: number;
}

interface BotLog {
  timestamp: string;
  type: 'trade' | 'signal' | 'error' | 'info';
  message: string;
  price?: number;
  quantity?: number;
}

const strategies = [
  { id: 'dca', name: 'Dollar Cost Averaging', description: 'Systematic buying at regular intervals', icon: DollarSign },
  { id: 'grid', name: 'Grid Trading', description: 'Place multiple buy/sell orders in a grid', icon: BarChart3 },
  { id: 'momentum', name: 'Momentum Trading', description: 'Follow price trends and momentum', icon: TrendingUp },
  { id: 'meanReversion', name: 'Mean Reversion', description: 'Buy low, sell high based on averages', icon: Target },
  { id: 'scalping', name: 'Scalping', description: 'Quick trades for small profits', icon: Zap },
  { id: 'arbitrage', name: 'Arbitrage', description: 'Profit from price differences', icon: RefreshCw },
  { id: 'trendFollowing', name: 'Trend Following', description: 'Follow long-term market trends', icon: Activity },
  { id: 'breakout', name: 'Breakout Trading', description: 'Trade on price breakouts', icon: TrendingUp },
  { id: 'patternRecognition', name: 'Pattern Recognition', description: 'AI-powered pattern detection', icon: Brain },
  { id: 'sentimentAnalysis', name: 'Sentiment Analysis', description: 'Trade based on market sentiment', icon: Brain },
  { id: 'copyTrading', name: 'Copy Trading', description: 'Mirror successful traders', icon: Bot },
  { id: 'portfolioRebalancing', name: 'Portfolio Rebalancing', description: 'Maintain target allocations', icon: BarChart3 }
];

export const AdvancedBotManager = () => {
  const [activeBots, setActiveBots] = useState<TradingBot[]>([
    {
      id: '1',
      name: 'DCA Bot #1',
      strategy: 'dca',
      pair: 'BTC-AUD',
      status: 'running',
      profit: 523.45,
      profitPercent: 5.23,
      trades: 47,
      runtime: '3d 12h',
      maxDrawdown: -2.1,
      winRate: 78.5,
      config: {
        riskLevel: 3,
        maxPositionSize: 1000,
        stopLoss: 5,
        takeProfit: 10,
        interval: '1h',
        capital: 10000
      },
      logs: [
        { timestamp: new Date().toISOString(), type: 'trade', message: 'Buy order executed', price: 68500, quantity: 0.015 },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'signal', message: 'DCA signal triggered' }
      ]
    }
  ]);

  const [selectedBot, setSelectedBot] = useState<TradingBot | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newBotConfig, setNewBotConfig] = useState({
    name: '',
    strategy: '',
    pair: 'BTC-AUD',
    capital: 1000,
    riskLevel: 3
  });

  const toggleBot = (id: string) => {
    setActiveBots(bots => 
      bots.map(bot => 
        bot.id === id 
          ? { ...bot, status: bot.status === 'running' ? 'paused' : 'running' as any }
          : bot
      )
    );
  };

  const createBot = () => {
    const newBot: TradingBot = {
      id: Date.now().toString(),
      name: newBotConfig.name || `${strategies.find(s => s.id === newBotConfig.strategy)?.name} Bot`,
      strategy: newBotConfig.strategy,
      pair: newBotConfig.pair,
      status: 'paused',
      profit: 0,
      profitPercent: 0,
      trades: 0,
      runtime: '0m',
      maxDrawdown: 0,
      winRate: 0,
      config: {
        riskLevel: newBotConfig.riskLevel,
        maxPositionSize: newBotConfig.capital * 0.1,
        stopLoss: 5,
        takeProfit: 10,
        interval: '15m',
        capital: newBotConfig.capital
      },
      logs: []
    };

    setActiveBots(prev => [...prev, newBot]);
    setIsCreating(false);
    setNewBotConfig({ name: '', strategy: '', pair: 'BTC-AUD', capital: 1000, riskLevel: 3 });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Bot className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      signDisplay: 'always'
    }).format(profit);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Advanced AI Trading Bots</h2>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Advanced Bot
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <Bot className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="text-sm text-slate-400">Active Bots</p>
              <p className="text-xl font-bold text-white">
                {activeBots.filter(bot => bot.status === 'running').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm text-slate-400">Total Profit</p>
              <p className="text-xl font-bold text-emerald-400">
                {formatProfit(activeBots.reduce((sum, bot) => sum + bot.profit, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm text-slate-400">Total Trades</p>
              <p className="text-xl font-bold text-white">
                {activeBots.reduce((sum, bot) => sum + bot.trades, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <Target className="h-5 w-5 text-orange-400" />
            <div>
              <p className="text-sm text-slate-400">Avg Win Rate</p>
              <p className="text-xl font-bold text-white">
                {activeBots.length > 0 
                  ? (activeBots.reduce((sum, bot) => sum + bot.winRate, 0) / activeBots.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="bots" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="bots">Active Bots</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bots" className="space-y-4">
          {activeBots.map((bot) => {
            const strategy = strategies.find(s => s.id === bot.strategy);
            return (
              <Card key={bot.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      {strategy?.icon && <strategy.icon className="h-6 w-6 text-emerald-400" />}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-white">{bot.name}</h3>
                      <p className="text-sm text-slate-400">{strategy?.name} • {bot.pair}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIcon(bot.status)}
                      <Badge variant="outline" className={`${
                        bot.status === 'running' 
                          ? 'border-emerald-500/30 text-emerald-400' 
                          : bot.status === 'error'
                          ? 'border-red-500/30 text-red-400'
                          : 'border-yellow-500/30 text-yellow-400'
                      }`}>
                        {bot.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleBot(bot.id)}
                    >
                      {bot.status === 'running' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedBot(bot)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Profit</p>
                    <p className={`font-bold ${bot.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatProfit(bot.profit)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">ROI</p>
                    <p className={`font-bold ${bot.profitPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {bot.profitPercent >= 0 ? '+' : ''}{bot.profitPercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Trades</p>
                    <p className="font-bold text-white">{bot.trades}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Win Rate</p>
                    <p className="font-bold text-blue-400">{bot.winRate.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Drawdown</p>
                    <p className="font-bold text-orange-400">{bot.maxDrawdown.toFixed(1)}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-400">Runtime</p>
                    <p className="font-bold text-slate-300">{bot.runtime}</p>
                  </div>
                </div>

                {/* Real-time Performance Chart */}
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Performance (24h)</span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                      Live
                    </Badge>
                  </div>
                  <div className="h-16 flex items-end space-x-1">
                    {Array.from({ length: 24 }, (_, i) => {
                      const height = Math.random() * 100;
                      const isProfit = Math.random() > 0.3;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${
                            isProfit ? 'bg-emerald-500' : 'bg-red-500'
                          } opacity-70 hover:opacity-100 transition-opacity`}
                          style={{ height: `${height}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map((strategy) => (
              <Card 
                key={strategy.id}
                className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-all"
                onClick={() => {
                  setNewBotConfig(prev => ({ ...prev, strategy: strategy.id }));
                  setIsCreating(true);
                }}
              >
                <div className="flex items-center space-x-4 mb-3">
                  <div className="p-3 bg-emerald-500/20 rounded-lg">
                    <strategy.icon className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{strategy.name}</h3>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 mt-1">
                      AI-Powered
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-4">{strategy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Success Rate: {(Math.random() * 20 + 70).toFixed(1)}%
                  </span>
                  <Button size="sm" variant="outline" className="border-emerald-500/30">
                    Configure
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Real-time Audit Logs</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {activeBots.flatMap(bot => 
                bot.logs.map(log => (
                  <div key={`${bot.id}-${log.timestamp}`} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={`${
                          log.type === 'trade' ? 'border-emerald-500/30 text-emerald-400' :
                          log.type === 'error' ? 'border-red-500/30 text-red-400' :
                          log.type === 'signal' ? 'border-blue-500/30 text-blue-400' :
                          'border-slate-500/30 text-slate-400'
                        }`}>
                          {log.type}
                        </Badge>
                        <span className="text-white font-medium">{bot.name}</span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 mt-2">{log.message}</p>
                    {log.price && (
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                        <span>Price: ${log.price.toLocaleString()}</span>
                        {log.quantity && <span>Qty: {log.quantity}</span>}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Strategy Performance</h3>
              <div className="space-y-4">
                {strategies.slice(0, 6).map((strategy, index) => (
                  <div key={strategy.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <strategy.icon className="h-5 w-5 text-emerald-400" />
                      <span className="text-white">{strategy.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-emerald-400">+{(Math.random() * 15 + 5).toFixed(2)}%</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Risk Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Portfolio Volatility</span>
                  <span className="text-orange-400">12.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sharpe Ratio</span>
                  <span className="text-emerald-400">1.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Drawdown</span>
                  <span className="text-red-400">-8.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Calmar Ratio</span>
                  <span className="text-blue-400">2.1</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bot Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 bg-slate-800/95 backdrop-blur-sm border-slate-700">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6">Create Advanced Trading Bot</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Bot Name</label>
                  <Input
                    value={newBotConfig.name}
                    onChange={(e) => setNewBotConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Advanced Bot"
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Strategy</label>
                  <Select value={newBotConfig.strategy} onValueChange={(value) => setNewBotConfig(prev => ({ ...prev, strategy: value }))}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {strategies.map((strategy) => (
                        <SelectItem key={strategy.id} value={strategy.id}>
                          {strategy.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Trading Pair</label>
                    <Select value={newBotConfig.pair} onValueChange={(value) => setNewBotConfig(prev => ({ ...prev, pair: value }))}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC-AUD">BTC-AUD</SelectItem>
                        <SelectItem value="ETH-AUD">ETH-AUD</SelectItem>
                        <SelectItem value="SOL-AUD">SOL-AUD</SelectItem>
                        <SelectItem value="ADA-AUD">ADA-AUD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Capital (AUD)</label>
                    <Input
                      type="number"
                      value={newBotConfig.capital}
                      onChange={(e) => setNewBotConfig(prev => ({ ...prev, capital: Number(e.target.value) }))}
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Risk Level: {newBotConfig.riskLevel}
                  </label>
                  <Slider
                    value={[newBotConfig.riskLevel]}
                    onValueChange={(value) => setNewBotConfig(prev => ({ ...prev, riskLevel: value[0] }))}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Conservative</span>
                    <span>Aggressive</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={createBot}
                  disabled={!newBotConfig.strategy}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Create Bot
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
