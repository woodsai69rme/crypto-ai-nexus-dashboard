
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PortfolioChart } from '@/components/charts/PortfolioChart';
import { Plus, TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Position {
  id: string;
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
}

export const Portfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [totalPnLPercentage, setTotalPnLPercentage] = useState(0);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    quantity: '',
    averagePrice: ''
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockPositions: Position[] = [
      {
        id: '1',
        symbol: 'BTC',
        quantity: 0.5,
        averagePrice: 45000,
        currentPrice: 67432.50,
        totalValue: 33716.25,
        pnl: 11216.25,
        pnlPercentage: 49.85
      },
      {
        id: '2',
        symbol: 'ETH',
        quantity: 5,
        averagePrice: 2800,
        currentPrice: 3247.89,
        totalValue: 16239.45,
        pnl: 2239.45,
        pnlPercentage: 15.99
      },
      {
        id: '3',
        symbol: 'ADA',
        quantity: 10000,
        averagePrice: 0.35,
        currentPrice: 0.48,
        totalValue: 4800,
        pnl: 1300,
        pnlPercentage: 37.14
      }
    ];

    setPositions(mockPositions);
    
    const total = mockPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalPnLValue = mockPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    const totalInvested = mockPositions.reduce((sum, pos) => sum + (pos.quantity * pos.averagePrice), 0);
    
    setTotalValue(total);
    setTotalPnL(totalPnLValue);
    setTotalPnLPercentage(totalInvested > 0 ? (totalPnLValue / totalInvested) * 100 : 0);
  }, []);

  const handleAddPosition = () => {
    if (!newPosition.symbol || !newPosition.quantity || !newPosition.averagePrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const quantity = parseFloat(newPosition.quantity);
    const avgPrice = parseFloat(newPosition.averagePrice);
    
    if (isNaN(quantity) || isNaN(avgPrice) || quantity <= 0 || avgPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter valid numbers",
        variant: "destructive"
      });
      return;
    }

    // Mock current price (in real app, fetch from market data)
    const currentPrice = avgPrice * (1 + (Math.random() - 0.5) * 0.4);
    const totalValue = quantity * currentPrice;
    const pnl = totalValue - (quantity * avgPrice);
    const pnlPercentage = ((currentPrice - avgPrice) / avgPrice) * 100;

    const position: Position = {
      id: Date.now().toString(),
      symbol: newPosition.symbol.toUpperCase(),
      quantity,
      averagePrice: avgPrice,
      currentPrice,
      totalValue,
      pnl,
      pnlPercentage
    };

    setPositions(prev => [...prev, position]);
    setNewPosition({ symbol: '', quantity: '', averagePrice: '' });
    setIsAddingPosition(false);

    toast({
      title: "Position Added",
      description: `Successfully added ${newPosition.symbol} to your portfolio`
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Value</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${totalPnL >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              {totalPnL >= 0 ? (
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-slate-400">Total P&L</p>
              <p className={`text-xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totalPnL)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${totalPnLPercentage >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Return</p>
              <p className={`text-xl font-bold ${totalPnLPercentage >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPercentage(totalPnLPercentage)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Chart */}
      <PortfolioChart />

      {/* Add Position Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Positions</h3>
        <Button
          onClick={() => setIsAddingPosition(true)}
          className="bg-emerald-500 hover:bg-emerald-600"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Add Position Form */}
      {isAddingPosition && (
        <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Symbol</label>
              <Input
                type="text"
                placeholder="BTC, ETH, ADA..."
                value={newPosition.symbol}
                onChange={(e) => setNewPosition(prev => ({ ...prev, symbol: e.target.value }))}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Quantity</label>
              <Input
                type="number"
                step="any"
                placeholder="0.0"
                value={newPosition.quantity}
                onChange={(e) => setNewPosition(prev => ({ ...prev, quantity: e.target.value }))}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Average Price (AUD)</label>
              <Input
                type="number"
                step="any"
                placeholder="0.00"
                value={newPosition.averagePrice}
                onChange={(e) => setNewPosition(prev => ({ ...prev, averagePrice: e.target.value }))}
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={handleAddPosition}
                className="bg-emerald-500 hover:bg-emerald-600 flex-1"
              >
                Add
              </Button>
              <Button
                onClick={() => setIsAddingPosition(false)}
                variant="outline"
                className="border-slate-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Positions Table */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr className="text-left">
                <th className="p-4 text-sm font-medium text-slate-300">Asset</th>
                <th className="p-4 text-sm font-medium text-slate-300">Quantity</th>
                <th className="p-4 text-sm font-medium text-slate-300">Avg Price</th>
                <th className="p-4 text-sm font-medium text-slate-300">Current Price</th>
                <th className="p-4 text-sm font-medium text-slate-300">Total Value</th>
                <th className="p-4 text-sm font-medium text-slate-300">P&L</th>
                <th className="p-4 text-sm font-medium text-slate-300">P&L %</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{position.symbol.slice(0, 2)}</span>
                      </div>
                      <span className="font-medium text-white">{position.symbol}</span>
                    </div>
                  </td>
                  <td className="p-4 text-white">{position.quantity}</td>
                  <td className="p-4 text-white">{formatCurrency(position.averagePrice)}</td>
                  <td className="p-4 text-white">{formatCurrency(position.currentPrice)}</td>
                  <td className="p-4 text-white font-medium">{formatCurrency(position.totalValue)}</td>
                  <td className={`p-4 font-medium ${position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(position.pnl)}
                  </td>
                  <td className="p-4">
                    <Badge 
                      variant="outline" 
                      className={`${
                        position.pnlPercentage >= 0 
                          ? 'border-emerald-500/30 text-emerald-400' 
                          : 'border-red-500/30 text-red-400'
                      }`}
                    >
                      {position.pnlPercentage >= 0 ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {formatPercentage(position.pnlPercentage)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
