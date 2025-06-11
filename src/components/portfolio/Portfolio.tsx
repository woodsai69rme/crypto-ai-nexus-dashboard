
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { 
  TrendingUp, 
  TrendingDown, 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-400 truncate">Total Portfolio Value</p>
              <p className="text-xl sm:text-2xl font-bold text-white truncate">
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
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-400 truncate">24h Change</p>
              <div className="flex items-center space-x-2">
                <p className="text-xl sm:text-2xl font-bold text-emerald-400">
                  +{portfolioData.totalChange.toFixed(2)}%
                </p>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                  {formatCurrency(portfolioData.totalChangeValue)}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-400 truncate">Performance</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">+23.7%</p>
              <p className="text-xs text-slate-500">All time</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <PortfolioChart />

      <Tabs defaultValue="holdings" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700 grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="holdings" className="text-xs sm:text-sm">Holdings</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs sm:text-sm">Performance</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr className="text-left">
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">Asset</th>
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">Holdings</th>
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">Value</th>
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">Allocation</th>
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">24h Change</th>
                    <th className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-slate-300">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.holdings.map((holding, index) => {
                    const currentPrice = holding.value / holding.amount;
                    const pnl = ((currentPrice - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
                    
                    return (
                      <tr key={holding.symbol} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-xs sm:text-sm font-bold text-white">{holding.symbol.slice(0, 2)}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-white text-sm sm:text-base">{holding.symbol}</div>
                              <div className="text-xs sm:text-sm text-slate-400 truncate">{holding.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="text-white font-medium text-sm sm:text-base">
                            {formatCrypto(holding.amount, holding.symbol)}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400">
                            Avg: {formatCurrency(holding.avgBuyPrice)}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className="text-white font-medium text-sm sm:text-base">
                            {formatCurrency(holding.value)}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-12 sm:w-16 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500"
                                style={{ width: `${holding.allocation}%` }}
                              />
                            </div>
                            <span className="text-xs sm:text-sm text-slate-300">{holding.allocation.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center space-x-1">
                            {holding.change24h > 0 ? (
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                            ) : (
                              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-400" />
                            )}
                            <span className={`font-medium text-xs sm:text-sm ${holding.change24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {holding.change24h > 0 ? '+' : ''}{holding.change24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`font-medium text-xs sm:text-sm ${pnl > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
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

        <TabsContent value="performance">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 sm:p-6">
            <h4 className="text-lg font-medium text-white mb-4">Performance Metrics</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Sharpe Ratio', value: '1.42', good: true },
                { label: 'Max Drawdown', value: '-8.3%', good: false },
                { label: 'Win Rate', value: '67%', good: true },
                { label: 'Avg Return', value: '+2.1%', good: true }
              ].map((metric, index) => (
                <div key={index} className="bg-slate-700/30 p-3 sm:p-4 rounded-lg text-center">
                  <div className="text-xs sm:text-sm text-slate-400 mb-1">{metric.label}</div>
                  <div className={`text-lg sm:text-xl font-bold ${metric.good ? 'text-emerald-400' : 'text-red-400'}`}>
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 sm:p-6">
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
                      } text-xs`}
                    >
                      {tx.type.toUpperCase()}
                    </Badge>
                    <span className="text-white font-medium text-sm sm:text-base">{tx.amount} {tx.asset}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm sm:text-base">${tx.price}</div>
                    <div className="text-xs sm:text-sm text-slate-400">{tx.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4 sm:p-6">
            <h4 className="text-lg font-medium text-white mb-4">Portfolio Analytics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-3">Risk Metrics</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Volatility</span>
                    <span className="text-white">12.4%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Beta</span>
                    <span className="text-white">1.23</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Value at Risk</span>
                    <span className="text-red-400">-$2,340</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="text-sm font-medium text-slate-300 mb-3">Diversification</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Asset Count</span>
                    <span className="text-white">4</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Correlation Score</span>
                    <span className="text-yellow-400">0.67</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Diversification Ratio</span>
                    <span className="text-emerald-400">7.2/10</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
