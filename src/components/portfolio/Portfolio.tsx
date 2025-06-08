
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  DollarSign,
  Target
} from 'lucide-react';

export const Portfolio = () => {
  const portfolioData = {
    totalValue: 127432.50,
    totalChange: 5.24,
    totalChangeValue: 6342.89,
    holdings: [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: 1.2345,
        value: 83234.56,
        allocation: 65.3,
        change24h: 3.24,
        avgBuyPrice: 62000
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        amount: 8.7654,
        value: 28456.78,
        allocation: 22.3,
        change24h: -1.15,
        avgBuyPrice: 3100
      },
      {
        symbol: 'ADA',
        name: 'Cardano',
        amount: 25000,
        value: 12000,
        allocation: 9.4,
        change24h: 7.23,
        avgBuyPrice: 0.45
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        amount: 15.4321,
        value: 3619.88,
        allocation: 2.8,
        change24h: 12.45,
        avgBuyPrice: 210
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatCrypto = (amount: number, symbol: string) => {
    return `${amount.toFixed(4)} ${symbol}`;
  };

  return (
    <div className="space-y-4">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.totalValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">24h Change</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-emerald-400">
                  +{portfolioData.totalChange.toFixed(2)}%
                </p>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                  {formatCurrency(portfolioData.totalChangeValue)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Performance</p>
              <p className="text-2xl font-bold text-blue-400">+23.7%</p>
              <p className="text-xs text-slate-500">All time</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="holdings">Holdings</TabsTrigger>
          <TabsTrigger value="allocation">Allocation</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-medium text-slate-300">Asset</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Holdings</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Value (AUD)</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Allocation</th>
                    <th className="p-4 text-sm font-medium text-slate-300">24h Change</th>
                    <th className="p-4 text-sm font-medium text-slate-300">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.holdings.map((holding, index) => {
                    const currentPrice = holding.value / holding.amount;
                    const pnl = ((currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
                    
                    return (
                      <tr key={holding.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-white">{holding.symbol}</div>
                              <div className="text-sm text-slate-400">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white font-medium">
                            {formatCrypto(holding.amount, holding.symbol)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Avg: {formatCurrency(holding.avgBuyPrice)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-white font-medium">
                            {formatCurrency(holding.value)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500"
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <span className="text-sm text-slate-300">{holding.allocation.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-1">
                            {holding.change24h > 0 ? (
                              <TrendingUp className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            )}
                            <span className={`font-medium ${holding.change24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {holding.change24h > 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`font-medium ${pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pnl > 0 ? '+' : ''}{pnl.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="allocation">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-white">Portfolio Allocation</h4>
              <div className="flex items-center space-x-2">
                <PieChart className="h-5 w-5 text-emerald-400" />
                <span className="text-sm text-slate-400">Diversification Score: 7.2/10</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie chart representation */}
              <div className="relative">
                <div className="w-64 h-64 mx-auto">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {portfolioData.holdings.map((holding, index) => {
                      const startAngle = portfolioData.holdings
                        .slice(0, index)
                        .reduce((sum, h) => sum + h.allocation, 0) * 3.6;
                      const endAngle = startAngle + holding.allocation * 3.6;
                      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
                      
                      return (
                        <circle
                          key={holding.symbol}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="10"
                          strokeDasharray={`${holding.allocation * 2.51} 251.2`}
                          strokeDashoffset={-startAngle * 2.51 / 3.6}
                          className="opacity-80 hover:opacity-100 transition-opacity"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Allocation breakdown */}
              <div className="space-y-4">
                {portfolioData.holdings.map((holding, index) => {
                  const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-purple-500', 'bg-yellow-500'];
                  return (
                    <div key={holding.symbol} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`} />
                        <span className="text-white font-medium">{holding.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">{holding.allocation.toFixed(1)}%</div>
                        <div className="text-sm text-slate-400">
                          {formatCurrency(holding.value)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-white">Performance Metrics</h4>
              <BarChart3 className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Sharpe Ratio', value: '1.42', good: true },
                { label: 'Max Drawdown', value: '-8.3%', good: false },
                { label: 'Win Rate', value: '67%', good: true },
                { label: 'Avg Return', value: '+2.1%', good: true }
              ].map((metric, index) => (
                <div key={index} className="bg-slate-700/30 p-4 rounded-lg text-center">
                  <div className="text-sm text-slate-400 mb-1">{metric.label}</div>
                  <div className={`text-xl font-bold ${metric.good ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance chart */}
            <div className="h-64 bg-slate-900/50 rounded-lg p-4">
              <div className="h-full flex items-end justify-center space-x-1">
                {Array.from({ length: 30 }, (_, i) => {
                  const height = 20 + Math.random() * 60;
                  const isGreen = Math.random() > 0.3;
                  return (
                    <div
                      key={i}
                      className="flex-1 max-w-[8px] relative"
                      style={{ height: `${height}%` }}
                    >
                      <div 
                        className={`w-full h-full rounded-sm ${
                          isGreen ? 'bg-emerald-500' : 'bg-red-500'
                        } opacity-80 hover:opacity-100 transition-opacity`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
            <h4 className="text-lg font-medium text-white mb-4">Transaction History</h4>
            <div className="space-y-3">
              {[
                { type: 'buy', asset: 'BTC', amount: '0.1234', price: '65,432', time: '2h ago' },
                { type: 'sell', asset: 'ETH', amount: '2.5', price: '3,247', time: '4h ago' },
                { type: 'buy', asset: 'ADA', amount: '1000', price: '0.48', time: '6h ago' },
                { type: 'buy', asset: 'SOL', amount: '5', price: '234', time: '1d ago' }
              ].map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant="outline" 
                      className={`${
                        tx.type === 'buy' 
                          ? 'border-emerald-500/30 text-emerald-400' 
                          : 'border-red-500/30 text-red-400'
                      }`}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium">{tx.amount} {tx.asset}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white">${tx.price}</div>
                    <div className="text-sm text-slate-400">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
