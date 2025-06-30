
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, Activity } from 'lucide-react';
import { usePortfolio } from '@/hooks/usePortfolio';

export const RealTimePortfolio = () => {
  const { portfolio, loading } = usePortfolio();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-white">Loading portfolio...</span>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
            <p className="text-slate-400">Real-time portfolio tracking</p>
          </div>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400">
          <Activity className="h-3 w-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(portfolio?.total_value || 100000)}
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-emerald-400 mr-1" />
              <span className="text-emerald-400 text-sm">
                +{((portfolio?.total_pnl || 0)).toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatCurrency(portfolio?.current_balance || 100000)}
            </div>
            <p className="text-slate-400 text-sm mt-2">Available for trading</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-white">Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {portfolio?.positions?.length || 0}
            </div>
            <p className="text-slate-400 text-sm mt-2">Active positions</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-400">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
