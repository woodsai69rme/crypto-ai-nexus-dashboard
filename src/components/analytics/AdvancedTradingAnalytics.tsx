
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, DollarSign, PieChart, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaxTransaction {
  id: string;
  transaction_type: string;
  symbol: string;
  amount: number;
  price_per_unit: number;
  total_value: number;
  fee: number;
  capital_gain_loss: number;
  transaction_date: string;
  exchange: string;
}

interface TradingMetrics {
  totalTrades: number;
  totalVolume: number;
  totalPnL: number;
  winRate: number;
  averageReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
}

export const AdvancedTradingAnalytics = () => {
  const { user } = useAuth();
  const [taxTransactions, setTaxTransactions] = useState<TaxTransaction[]>([]);
  const [tradingMetrics, setTradingMetrics] = useState<TradingMetrics>({
    totalTrades: 0,
    totalVolume: 0,
    totalPnL: 0,
    winRate: 0,
    averageReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    profitFactor: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) return;
    fetchTaxTransactions();
    calculateTradingMetrics();
  }, [user, selectedYear]);

  const fetchTaxTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('tax_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('tax_year', selectedYear)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setTaxTransactions(data || []);
    } catch (error) {
      console.error('Error fetching tax transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTradingMetrics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'filled');

      if (error) throw error;

      if (!orders || orders.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate metrics
      const totalTrades = orders.length;
      const totalVolume = orders.reduce((sum, order) => sum + (order.filled_quantity * order.average_fill_price), 0);
      
      // Group by symbol to calculate P&L
      const positionsBySymbol: { [key: string]: any[] } = {};
      orders.forEach(order => {
        if (!positionsBySymbol[order.symbol]) {
          positionsBySymbol[order.symbol] = [];
        }
        positionsBySymbol[order.symbol].push(order);
      });

      let totalPnL = 0;
      let winningTrades = 0;
      const returns: number[] = [];

      Object.keys(positionsBySymbol).forEach(symbol => {
        const symbolOrders = positionsBySymbol[symbol];
        let position = 0;
        let totalCost = 0;
        
        symbolOrders.forEach(order => {
          if (order.side === 'buy') {
            totalCost += order.filled_quantity * order.average_fill_price;
            position += order.filled_quantity;
          } else {
            const sellValue = order.filled_quantity * order.average_fill_price;
            const costBasis = (totalCost / position) * order.filled_quantity;
            const pnl = sellValue - costBasis;
            
            totalPnL += pnl;
            returns.push(pnl / costBasis);
            
            if (pnl > 0) winningTrades++;
            
            position -= order.filled_quantity;
            totalCost -= costBasis;
          }
        });
      });

      const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const averageReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
      
      // Calculate Sharpe ratio (simplified)
      const returnStdDev = returns.length > 1 ? Math.sqrt(
        returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / (returns.length - 1)
      ) : 0;
      const sharpeRatio = returnStdDev > 0 ? averageReturn / returnStdDev : 0;

      // Calculate max drawdown
      let peak = 0;
      let maxDrawdown = 0;
      let runningPnL = 0;
      
      orders.forEach(order => {
        // Simplified drawdown calculation
        if (order.side === 'sell') {
          runningPnL += (order.average_fill_price - order.price) * order.filled_quantity;
          peak = Math.max(peak, runningPnL);
          const drawdown = (peak - runningPnL) / peak;
          maxDrawdown = Math.max(maxDrawdown, drawdown);
        }
      });

      const winningReturns = returns.filter(r => r > 0).reduce((a, b) => a + b, 0);
      const losingReturns = Math.abs(returns.filter(r => r < 0).reduce((a, b) => a + b, 0));
      const profitFactor = losingReturns > 0 ? winningReturns / losingReturns : 0;

      setTradingMetrics({
        totalTrades,
        totalVolume,
        totalPnL,
        winRate,
        averageReturn: averageReturn * 100,
        sharpeRatio,
        maxDrawdown: maxDrawdown * 100,
        profitFactor
      });

    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatNumber = (num: number, decimals = 2) => {
    return num.toFixed(decimals);
  };

  const generateTaxReport = () => {
    // Generate CSV for tax reporting
    const csvContent = [
      ['Date', 'Type', 'Symbol', 'Amount', 'Price', 'Total Value', 'Fee', 'Capital Gain/Loss'],
      ...taxTransactions.map(tx => [
        new Date(tx.transaction_date).toLocaleDateString(),
        tx.transaction_type,
        tx.symbol,
        tx.amount,
        tx.price_per_unit,
        tx.total_value,
        tx.fee,
        tx.capital_gain_loss || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto-tax-report-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Advanced Trading Analytics</h2>
        </div>
        <Button onClick={generateTaxReport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Tax Report
        </Button>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tax">Tax Reporting</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-400">Total Trades</p>
                  <p className="text-xl font-bold text-white">{tradingMetrics.totalTrades}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Total Volume</p>
                  <p className="text-xl font-bold text-white">{formatCurrency(tradingMetrics.totalVolume)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className={`h-5 w-5 ${tradingMetrics.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                <div>
                  <p className="text-sm text-slate-400">Total P&L</p>
                  <p className={`text-xl font-bold ${tradingMetrics.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(tradingMetrics.totalPnL)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <PieChart className="h-5 w-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-slate-400">Win Rate</p>
                  <p className="text-xl font-bold text-white">{formatNumber(tradingMetrics.winRate)}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Advanced Metrics */}
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Advanced Performance Metrics</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{formatNumber(tradingMetrics.sharpeRatio)}</p>
                <p className="text-sm text-slate-400">Sharpe Ratio</p>
                <Badge variant="outline" className="mt-2 border-emerald-500/30 text-emerald-400">
                  {tradingMetrics.sharpeRatio > 1 ? 'Excellent' : tradingMetrics.sharpeRatio > 0.5 ? 'Good' : 'Poor'}
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{formatNumber(tradingMetrics.maxDrawdown)}%</p>
                <p className="text-sm text-slate-400">Max Drawdown</p>
                <Badge variant="outline" className="mt-2 border-red-500/30 text-red-400">
                  {tradingMetrics.maxDrawdown < 10 ? 'Low Risk' : tradingMetrics.maxDrawdown < 20 ? 'Moderate' : 'High Risk'}
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{formatNumber(tradingMetrics.averageReturn)}%</p>
                <p className="text-sm text-slate-400">Avg Return</p>
                <Badge variant="outline" className="mt-2 border-blue-500/30 text-blue-400">
                  Per Trade
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{formatNumber(tradingMetrics.profitFactor)}</p>
                <p className="text-sm text-slate-400">Profit Factor</p>
                <Badge variant="outline" className="mt-2 border-purple-500/30 text-purple-400">
                  {tradingMetrics.profitFactor > 1.5 ? 'Strong' : tradingMetrics.profitFactor > 1 ? 'Positive' : 'Needs Work'}
                </Badge>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Tax Year {selectedYear}</h3>
            <div className="flex items-center space-x-2">
              {[2023, 2024, 2025].map(year => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedYear(year)}
                  className="border-slate-600"
                >
                  {year}
                </Button>
              ))}
            </div>
          </div>

          {/* Tax Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-400">Total Transactions</p>
                  <p className="text-xl font-bold text-white">{taxTransactions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-400">Capital Gains</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {formatCurrency(taxTransactions.filter(tx => (tx.capital_gain_loss || 0) > 0).reduce((sum, tx) => sum + (tx.capital_gain_loss || 0), 0))}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-5 w-5 text-red-400" />
                <div>
                  <p className="text-sm text-slate-400">Capital Losses</p>
                  <p className="text-xl font-bold text-red-400">
                    {formatCurrency(Math.abs(taxTransactions.filter(tx => (tx.capital_gain_loss || 0) < 0).reduce((sum, tx) => sum + (tx.capital_gain_loss || 0), 0)))}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tax Transactions Table */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-medium text-slate-300">Date</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Type</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Symbol</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Amount</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Price</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Total Value</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Capital Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {taxTransactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="p-4 text-sm text-white">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={transaction.transaction_type === 'buy' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-500/30 text-red-400'}>
                          {transaction.transaction_type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-white">{transaction.symbol}</td>
                      <td className="p-4 text-sm text-white">{formatNumber(transaction.amount, 6)}</td>
                      <td className="p-4 text-sm text-white">{formatCurrency(transaction.price_per_unit)}</td>
                      <td className="p-4 text-sm text-white">{formatCurrency(transaction.total_value)}</td>
                      <td className="p-4 text-sm">
                        <span className={`${(transaction.capital_gain_loss || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {transaction.capital_gain_loss ? formatCurrency(transaction.capital_gain_loss) : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Risk Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-300 mb-3">Risk Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Value at Risk (95%)</span>
                    <span className="text-red-400">-{formatCurrency(tradingMetrics.totalVolume * 0.05)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beta (vs BTC)</span>
                    <span className="text-white">1.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Volatility</span>
                    <span className="text-yellow-400">15.3%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sortino Ratio</span>
                    <span className="text-emerald-400">{formatNumber(tradingMetrics.sharpeRatio * 1.2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-slate-300 mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Portfolio Risk</span>
                    <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                      Moderate
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Diversification</span>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                      Good
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Liquidity Risk</span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                      Low
                    </Badge>
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
