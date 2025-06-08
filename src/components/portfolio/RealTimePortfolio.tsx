
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  name: string;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  positions: any[];
  updated_at: string;
}

export const RealTimePortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<any>({});

  useEffect(() => {
    if (!user) return;

    fetchPortfolios();
    fetchMarketData();

    // Subscribe to real-time portfolio updates
    const channel = supabase
      .channel('portfolio-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'portfolios',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Portfolio updated:', payload);
          fetchPortfolios();
        }
      )
      .subscribe();

    // Subscribe to market data updates
    const marketChannel = supabase
      .channel('market-data-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data_cache'
        },
        (payload) => {
          console.log('Market data updated:', payload);
          fetchMarketData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(marketChannel);
    };
  }, [user]);

  const fetchPortfolios = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    try {
      const { data, error } = await supabase
        .from('market_data_cache')
        .select('*')
        .in('symbol', ['BTC', 'ETH', 'ADA', 'SOL']);

      if (error) throw error;
      
      const marketMap = data?.reduce((acc, item) => {
        acc[item.symbol] = item;
        return acc;
      }, {} as any) || {};
      
      setMarketData(marketMap);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 bg-slate-800/50 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Real-Time Portfolio</h2>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
          <Activity className="h-3 w-3 mr-1" />
          LIVE
        </Badge>
      </div>

      {portfolios.length === 0 ? (
        <Card className="p-8 bg-slate-800/50 text-center">
          <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Portfolios Yet</h3>
          <p className="text-slate-400">Create your first portfolio to start tracking your crypto investments</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{portfolio.name}</h3>
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {portfolio.positions?.length || 0} positions
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400">Total Value</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(portfolio.total_value)}
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {portfolio.total_pnl >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-medium ${
                      portfolio.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {portfolio.total_pnl >= 0 ? '+' : ''}{portfolio.total_pnl_percentage.toFixed(2)}%
                    </span>
                  </div>
                  <span className={`text-sm ${
                    portfolio.total_pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {portfolio.total_pnl >= 0 ? '+' : ''}{formatCurrency(portfolio.total_pnl)}
                  </span>
                </div>

                {portfolio.positions && portfolio.positions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">Top Holdings</p>
                    {portfolio.positions.slice(0, 3).map((position: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">{position.symbol}</span>
                        <span className="text-sm text-white">
                          {formatCurrency(position.value || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs text-slate-500">
                  Last updated: {new Date(portfolio.updated_at).toLocaleString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
