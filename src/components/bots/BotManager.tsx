
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Settings, TrendingUp, TrendingDown, Bot } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TradingBot {
  id: string;
  name: string;
  strategy: string;
  status: string;
  performance: {
    total_return: number;
    daily_pnl: number;
    weekly_pnl: number;
    monthly_pnl: number;
    win_rate: number;
    total_trades: number;
  };
  paper_balance: number;
  target_symbols: string[];
  risk_level: string;
  created_at: string;
}

export const BotManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bots, setBots] = useState<TradingBot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      fetchBots();
    }
  }, [user]);

  const fetchBots = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_trading_bots')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBots(data || []);
    } catch (error) {
      console.error('Error fetching bots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch trading bots",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBotStatus = async (botId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    
    try {
      const { error } = await supabase
        .from('ai_trading_bots')
        .update({ status: newStatus })
        .eq('id', botId);

      if (error) throw error;

      setBots(bots.map(bot => 
        bot.id === botId ? { ...bot, status: newStatus } : bot
      ));

      toast({
        title: `Bot ${newStatus}`,
        description: `Trading bot has been ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating bot status:', error);
      toast({
        title: "Error",
        description: "Failed to update bot status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-500/20 text-emerald-400';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400';
      case 'stopped': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'aggressive': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const filteredBots = bots.filter(bot => {
    if (activeTab === 'all') return true;
    if (activeTab === 'running') return bot.status === 'running';
    if (activeTab === 'paused') return bot.status === 'paused';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Loading trading bots...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Bot className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">AI Trading Bots</h1>
            <p className="text-slate-400">Manage your automated trading strategies</p>
          </div>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600">
          <Bot className="h-4 w-4 mr-2" />
          Create New Bot
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="all">All Bots ({bots.length})</TabsTrigger>
          <TabsTrigger value="running">Running ({bots.filter(b => b.status === 'running').length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({bots.filter(b => b.status === 'paused').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBots.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <Bot className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Trading Bots Found</h3>
              <p className="text-slate-400 mb-4">Get started by creating your first AI trading bot</p>
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                Create Your First Bot
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBots.map((bot) => (
                <Card key={bot.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{bot.name}</CardTitle>
                      <Badge className={getStatusColor(bot.status)}>
                        {bot.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">{bot.strategy}</span>
                      <span className={`font-medium ${getRiskColor(bot.risk_level)}`}>
                        {bot.risk_level} risk
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Balance</p>
                        <p className="font-semibold text-white">{formatCurrency(bot.paper_balance)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Return</p>
                        <div className="flex items-center">
                          {bot.performance.total_return >= 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-400 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-400 mr-1" />
                          )}
                          <p className={`font-semibold ${
                            bot.performance.total_return >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {bot.performance.total_return >= 0 ? '+' : ''}{bot.performance.total_return}%
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400">Win Rate</p>
                        <p className="font-semibold text-white">{bot.performance.win_rate}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Total Trades</p>
                        <p className="font-semibold text-white">{bot.performance.total_trades}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-sm mb-2">Target Assets</p>
                      <div className="flex flex-wrap gap-1">
                        {bot.target_symbols.map((symbol) => (
                          <Badge key={symbol} variant="outline" className="text-xs">
                            {symbol}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant={bot.status === 'running' ? 'destructive' : 'default'}
                        onClick={() => toggleBotStatus(bot.id, bot.status)}
                        className="flex-1"
                      >
                        {bot.status === 'running' ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
