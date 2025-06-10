
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Target,
  Clock,
  BarChart3,
  Wallet,
  ArrowUpDown,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  status: 'pending' | 'filled' | 'cancelled';
  pnl?: number;
}

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export const PaperTradingDashboard = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [balance, setBalance] = useState(100000);
  const [positions, setPositions] = useState<Position[]>([
    {
      symbol: 'BTC-AUD',
      quantity: 0.5,
      avgPrice: 65000,
      currentPrice: 68500,
      pnl: 1750,
      pnlPercent: 5.38
    },
    {
      symbol: 'ETH-AUD',
      quantity: 2.5,
      avgPrice: 3200,
      currentPrice: 3150,
      pnl: -125,
      pnlPercent: -1.56
    }
  ]);

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: '1',
      symbol: 'BTC-AUD',
      type: 'buy',
      quantity: 0.5,
      price: 65000,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'filled',
      pnl: 1750
    },
    {
      id: '2',
      symbol: 'ETH-AUD',
      type: 'buy',
      quantity: 2.5,
      price: 3200,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'filled',
      pnl: -125
    }
  ]);

  const [orderForm, setOrderForm] = useState({
    symbol: 'BTC-AUD',
    type: 'buy',
    orderType: 'market',
    quantity: '',
    price: ''
  });

  const [orderBook, setOrderBook] = useState({
    bids: [
      { price: 68450, quantity: 1.2, total: 82140 },
      { price: 68400, quantity: 0.8, total: 54720 },
      { price: 68350, quantity: 2.1, total: 143535 }
    ],
    asks: [
      { price: 68500, quantity: 0.9, total: 61650 },
      { price: 68550, quantity: 1.5, total: 102825 },
      { price: 68600, quantity: 0.7, total: 48020 }
    ]
  });

  const executeOrder = () => {
    const newTrade: Trade = {
      id: Date.now().toString(),
      symbol: orderForm.symbol,
      type: orderForm.type as 'buy' | 'sell',
      quantity: parseFloat(orderForm.quantity),
      price: orderForm.orderType === 'market' 
        ? (orderForm.type === 'buy' ? orderBook.asks[0].price : orderBook.bids[0].price)
        : parseFloat(orderForm.price),
      timestamp: new Date().toISOString(),
      status: 'filled'
    };

    setTrades(prev => [newTrade, ...prev]);
    
    // Update positions
    setPositions(prev => {
      const existing = prev.find(p => p.symbol === newTrade.symbol);
      if (existing) {
        const newQuantity = newTrade.type === 'buy' 
          ? existing.quantity + newTrade.quantity
          : existing.quantity - newTrade.quantity;
        
        const newAvgPrice = newTrade.type === 'buy'
          ? (existing.avgPrice * existing.quantity + newTrade.price * newTrade.quantity) / newQuantity
          : existing.avgPrice;

        return prev.map(p => 
          p.symbol === newTrade.symbol 
            ? { ...p, quantity: newQuantity, avgPrice: newAvgPrice }
            : p
        );
      } else if (newTrade.type === 'buy') {
        return [...prev, {
          symbol: newTrade.symbol,
          quantity: newTrade.quantity,
          avgPrice: newTrade.price,
          currentPrice: newTrade.price,
          pnl: 0,
          pnlPercent: 0
        }];
      }
      return prev;
    });

    setOrderForm({ symbol: 'BTC-AUD', type: 'buy', orderType: 'market', quantity: '', price: '' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4`}>
      <div className={`bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-lg ${
        isMaximized ? 'w-full h-full' : 'w-full max-w-7xl h-[90vh]'
      } flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Paper Trading Dashboard</h2>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              Live Simulation
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMaximized(!isMaximized)}
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        <div className="p-4 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="p-3 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Wallet className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Balance</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(balance)}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-slate-400">Total P&L</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formatCurrency(positions.reduce((sum, p) => sum + p.pnl, 0))}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Open Positions</p>
                  <p className="text-lg font-bold text-white">{positions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Trades</p>
                  <p className="text-lg font-bold text-white">{trades.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-3 bg-slate-800/50">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Win Rate</p>
                  <p className="text-lg font-bold text-white">
                    {((trades.filter(t => (t.pnl || 0) > 0).length / trades.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full p-4">
            {/* Order Form & Order Book */}
            <div className="space-y-4">
              {/* Order Form */}
              <Card className="bg-slate-800/50 border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-bold text-white">Place Order</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderForm.type === 'buy' ? 'default' : 'outline'}
                      onClick={() => setOrderForm(prev => ({ ...prev, type: 'buy' }))}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Buy
                    </Button>
                    <Button
                      variant={orderForm.type === 'sell' ? 'default' : 'outline'}
                      onClick={() => setOrderForm(prev => ({ ...prev, type: 'sell' }))}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Sell
                    </Button>
                  </div>

                  <Select value={orderForm.symbol} onValueChange={(value) => setOrderForm(prev => ({ ...prev, symbol: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC-AUD">BTC-AUD</SelectItem>
                      <SelectItem value="ETH-AUD">ETH-AUD</SelectItem>
                      <SelectItem value="SOL-AUD">SOL-AUD</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={orderForm.orderType === 'market' ? 'default' : 'outline'}
                      onClick={() => setOrderForm(prev => ({ ...prev, orderType: 'market' }))}
                      size="sm"
                    >
                      Market
                    </Button>
                    <Button
                      variant={orderForm.orderType === 'limit' ? 'default' : 'outline'}
                      onClick={() => setOrderForm(prev => ({ ...prev, orderType: 'limit' }))}
                      size="sm"
                    >
                      Limit
                    </Button>
                  </div>

                  <Input
                    placeholder="Quantity"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                  />

                  {orderForm.orderType === 'limit' && (
                    <Input
                      placeholder="Price"
                      value={orderForm.price}
                      onChange={(e) => setOrderForm(prev => ({ ...prev, price: e.target.value }))}
                    />
                  )}

                  <Button 
                    onClick={executeOrder}
                    disabled={!orderForm.quantity}
                    className={orderForm.type === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700 w-full' : 'bg-red-600 hover:bg-red-700 w-full'}
                  >
                    {orderForm.type === 'buy' ? 'Buy' : 'Sell'} {orderForm.symbol}
                  </Button>
                </div>
              </Card>

              {/* Order Book */}
              <Card className="bg-slate-800/50 border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="font-bold text-white">Order Book</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    <div className="text-xs text-slate-400 grid grid-cols-3 gap-2">
                      <span>Price</span>
                      <span>Quantity</span>
                      <span>Total</span>
                    </div>
                    
                    {/* Asks */}
                    {orderBook.asks.reverse().map((ask, i) => (
                      <div key={i} className="text-xs grid grid-cols-3 gap-2 text-red-400">
                        <span>{ask.price.toLocaleString()}</span>
                        <span>{ask.quantity}</span>
                        <span>{ask.total.toLocaleString()}</span>
                      </div>
                    ))}
                    
                    <div className="border-t border-slate-600 my-2"></div>
                    
                    {/* Bids */}
                    {orderBook.bids.map((bid, i) => (
                      <div key={i} className="text-xs grid grid-cols-3 gap-2 text-emerald-400">
                        <span>{bid.price.toLocaleString()}</span>
                        <span>{bid.quantity}</span>
                        <span>{bid.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Positions & Trades */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="positions" className="h-full">
                <TabsList className="bg-slate-800/50 border border-slate-700">
                  <TabsTrigger value="positions">Open Positions</TabsTrigger>
                  <TabsTrigger value="trades">Trade History</TabsTrigger>
                  <TabsTrigger value="logs">Real-time Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="positions" className="mt-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-slate-700">
                          <tr className="text-left text-xs text-slate-400">
                            <th className="p-3">Symbol</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Avg Price</th>
                            <th className="p-3">Current Price</th>
                            <th className="p-3">P&L</th>
                            <th className="p-3">P&L %</th>
                            <th className="p-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {positions.map((position, i) => (
                            <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                              <td className="p-3 text-white font-medium">{position.symbol}</td>
                              <td className="p-3 text-slate-300">{position.quantity}</td>
                              <td className="p-3 text-slate-300">{formatCurrency(position.avgPrice)}</td>
                              <td className="p-3 text-slate-300">{formatCurrency(position.currentPrice)}</td>
                              <td className={`p-3 font-medium ${position.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {formatCurrency(position.pnl)}
                              </td>
                              <td className={`p-3 font-medium ${position.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                              </td>
                              <td className="p-3">
                                <Button size="sm" variant="outline" className="mr-2">
                                  Close
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="trades" className="mt-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-slate-700">
                          <tr className="text-left text-xs text-slate-400">
                            <th className="p-3">Time</th>
                            <th className="p-3">Symbol</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Quantity</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">P&L</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trades.map((trade) => (
                            <tr key={trade.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                              <td className="p-3 text-slate-300 text-xs">
                                {new Date(trade.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="p-3 text-white font-medium">{trade.symbol}</td>
                              <td className="p-3">
                                <Badge variant="outline" className={`${
                                  trade.type === 'buy' 
                                    ? 'border-emerald-500/30 text-emerald-400' 
                                    : 'border-red-500/30 text-red-400'
                                }`}>
                                  {trade.type.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="p-3 text-slate-300">{trade.quantity}</td>
                              <td className="p-3 text-slate-300">{formatCurrency(trade.price)}</td>
                              <td className="p-3">
                                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                                  {trade.status}
                                </Badge>
                              </td>
                              <td className={`p-3 font-medium ${
                                (trade.pnl || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {trade.pnl ? formatCurrency(trade.pnl) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="logs" className="mt-4">
                  <Card className="bg-slate-800/50 border-slate-700 h-96">
                    <div className="p-4 border-b border-slate-700">
                      <h3 className="font-bold text-white">Real-time Trading Logs</h3>
                    </div>
                    <div className="p-4 h-full overflow-y-auto">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400 text-xs">{new Date().toLocaleTimeString()}</span>
                          <span className="text-emerald-400">Order executed: BUY 0.1 BTC at $68,500</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400 text-xs">{new Date(Date.now() - 30000).toLocaleTimeString()}</span>
                          <span className="text-blue-400">Market data updated: BTC-AUD $68,485</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-400 text-xs">{new Date(Date.now() - 60000).toLocaleTimeString()}</span>
                          <span className="text-yellow-400">Risk alert: Portfolio exposure at 75%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
