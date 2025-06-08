
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Play, 
  Pause, 
  Settings, 
  TrendingUp, 
  Activity,
  Plus,
  BarChart3
} from 'lucide-react';

export const BotManager = () => {
  const [activeBots, setActiveBots] = useState([
    {
      id: '1',
      name: 'DCA Bot #1',
      strategy: 'Dollar Cost Averaging',
      pair: 'BTC-AUD',
      status: 'running',
      profit: 523.45,
      profitPercent: 5.23,
      trades: 47,
      runtime: '3d 12h'
    },
    {
      id: '2',
      name: 'Grid Bot #2',
      strategy: 'Grid Trading',
      pair: 'ETH-AUD',
      status: 'running',
      profit: -45.67,
      profitPercent: -1.12,
      trades: 23,
      runtime: '1d 8h'
    },
    {
      id: '3',
      name: 'Momentum Bot #3',
      strategy: 'Momentum Trading',
      pair: 'SOL-AUD',
      status: 'paused',
      profit: 892.34,
      profitPercent: 12.45,
      trades: 156,
      runtime: '7d 2h'
    }
  ]);

  const botStrategies = [
    'Dollar Cost Averaging',
    'Grid Trading',
    'Momentum Trading',
    'Mean Reversion',
    'Scalping',
    'Arbitrage',
    'Trend Following',
    'Breakout',
    'Pattern Recognition',
    'Sentiment Analysis'
  ];

  const formatProfit = (profit: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      signDisplay: 'always'
    }).format(profit);
  };

  const toggleBot = (id: string) => {
    setActiveBots(bots => 
      bots.map(bot => 
        bot.id === id 
          ? { ...bot, status: bot.status === 'running' ? 'paused' : 'running' }
          : bot
      )
    );
  };

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">AI Trading Bots</h3>
          <Button className="bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Bot
          </Button>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="active">Active Bots</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
            <TabsTrigger value="strategies">Strategies</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="space-y-4">
              {activeBots.map((bot) => (
                <Card key={bot.id} className="bg-slate-700/30 border-slate-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-slate-600/50 rounded-lg">
                        <Bot className="h-6 w-6 text-emerald-400" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-white">{bot.name}</h4>
                        <p className="text-sm text-slate-400">{bot.strategy} • {bot.pair}</p>
                      </div>

                      <Badge 
                        variant="outline" 
                        className={`${
                          bot.status === 'running' 
                            ? 'border-emerald-500/30 text-emerald-400' 
                            : 'border-yellow-500/30 text-yellow-400'
                        }`}
                      >
                        {bot.status}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className={`font-medium ${bot.profit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatProfit(bot.profit)}
                        </div>
                        <div className="text-sm text-slate-400">
                          {bot.profitPercent > 0 ? '+' : ''}{bot.profitPercent.toFixed(2)}%
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-medium">{bot.trades}</div>
                        <div className="text-sm text-slate-400">Trades</div>
                      </div>

                      <div className="text-right">
                        <div className="text-white font-medium">{bot.runtime}</div>
                        <div className="text-sm text-slate-400">Runtime</div>
                      </div>

                      <div className="flex space-x-2">
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
                        <Button size="sm" variant="ghost">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Bot performance chart */}
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Performance</span>
                      <span className="text-sm text-slate-400">Last 24h</span>
                    </div>
                    <div className="h-16 flex items-end space-x-1">
                      {Array.from({ length: 24 }, (_, i) => {
                        const height = Math.random() * 100;
                        const isProfit = Math.random() > 0.4;
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <Card className="bg-slate-700/30 border-slate-600 p-6">
              <h4 className="text-lg font-medium text-white mb-4">Create New Trading Bot</h4>
              <div className="grid grid-cols-2 gap-4">
                {botStrategies.map((strategy, index) => (
                  <Card 
                    key={index}
                    className="bg-slate-600/30 border-slate-500 p-4 hover:bg-slate-600/50 cursor-pointer transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <Activity className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{strategy}</h5>
                        <p className="text-sm text-slate-400">AI-powered strategy</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="strategies">
            <Card className="bg-slate-700/30 border-slate-600 p-6">
              <h4 className="text-lg font-medium text-white mb-4">Strategy Performance</h4>
              <div className="space-y-4">
                {botStrategies.slice(0, 5).map((strategy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-600/30 rounded-lg">
                    <span className="text-white">{strategy}</span>
                    <div className="flex items-center space-x-4">
                      <span className="text-emerald-400">+{(Math.random() * 10).toFixed(2)}%</span>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                        Active
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};
