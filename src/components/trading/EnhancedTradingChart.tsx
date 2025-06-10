
import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Maximize2, Settings, Volume2, Activity, BarChart3, Zap } from 'lucide-react';
import { marketDataService, type MarketData, type CandlestickData, type OrderBook } from '@/services/marketDataService';
import { useToast } from '@/hooks/use-toast';

interface EnhancedTradingChartProps {
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const EnhancedTradingChart = ({ selectedSymbol, onSymbolChange }: EnhancedTradingChartProps) => {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [indicators, setIndicators] = useState({
    rsi: true,
    macd: false,
    bollinger: false,
    volume: true
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1H', label: '1H' },
    { value: '4H', label: '4H' },
    { value: '1D', label: '1D' },
    { value: '1W', label: '1W' }
  ];

  useEffect(() => {
    // Subscribe to real-time market data
    const unsubscribeMarket = marketDataService.subscribeToMarketData((allData) => {
      const symbolData = allData.find(data => data.symbol === selectedSymbol);
      if (symbolData) {
        setMarketData(symbolData);
      }
    });

    // Subscribe to chart data
    const unsubscribeChart = marketDataService.subscribeToChartData(selectedSymbol, (data) => {
      setChartData(data);
    });

    // Subscribe to order book
    const unsubscribeOrderBook = marketDataService.subscribeToOrderBook(selectedSymbol, (data) => {
      setOrderBook(data);
    });

    return () => {
      unsubscribeMarket();
      unsubscribeChart();
      unsubscribeOrderBook();
    };
  }, [selectedSymbol]);

  const formatPrice = (price: number) => {
    return marketDataService.formatPrice(price);
  };

  const formatChange = (change: number, isPercent: boolean = false) => {
    return marketDataService.formatChange(change, isPercent);
  };

  const formatVolume = (volume: number) => {
    return marketDataService.formatVolume(volume);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen && chartRef.current) {
      if (chartRef.current.requestFullscreen) {
        chartRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const generateTechnicalIndicators = () => {
    if (chartData.length < 14) return {};

    const prices = chartData.map(d => d.close);
    const rsi = calculateRSI(prices, 14);
    const macd = calculateMACD(prices);
    const bb = calculateBollingerBands(prices, 20);

    return { rsi: rsi[rsi.length - 1], macd, bb };
  };

  const calculateRSI = (prices: number[], period: number) => {
    const gains: number[] = [];
    const losses: number[] = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    const avgGains: number[] = [];
    const avgLosses: number[] = [];

    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      avgGains.push(avgGain);
      avgLosses.push(avgLoss);
    }

    return avgGains.map((gain, i) => {
      const loss = avgLosses[i];
      if (loss === 0) return 100;
      const rs = gain / loss;
      return 100 - (100 / (1 + rs));
    });
  };

  const calculateMACD = (prices: number[]) => {
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = calculateEMA(macdLine, 9);
    const histogram = macdLine.map((val, i) => val - signalLine[i]);

    return {
      macd: macdLine[macdLine.length - 1],
      signal: signalLine[signalLine.length - 1],
      histogram: histogram[histogram.length - 1]
    };
  };

  const calculateEMA = (prices: number[], period: number) => {
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);

    ema[0] = prices[0];
    for (let i = 1; i < prices.length; i++) {
      ema[i] = (prices[i] - ema[i - 1]) * multiplier + ema[i - 1];
    }

    return ema;
  };

  const calculateBollingerBands = (prices: number[], period: number) => {
    const sma = prices.slice(-period).reduce((a, b) => a + b, 0) / period;
    const variance = prices.slice(-period).reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    return {
      upper: sma + (stdDev * 2),
      middle: sma,
      lower: sma - (stdDev * 2)
    };
  };

  const technicalData = generateTechnicalIndicators();

  if (!marketData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
            <p className="text-slate-400">Loading market data...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      ref={chartRef}
      className={`bg-slate-800/50 backdrop-blur-sm border-slate-700 transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={selectedSymbol} onValueChange={onSymbolChange}>
              <SelectTrigger className="w-40 bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {marketDataService.getMarketData().map((data) => (
                  <SelectItem key={data.symbol} value={data.symbol}>
                    {data.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                {formatPrice(marketData.price)}
              </span>
              <Badge 
                variant="outline" 
                className={`${
                  marketData.changePercent24h > 0 
                    ? 'border-emerald-500/30 text-emerald-400' 
                    : 'border-red-500/30 text-red-400'
                }`}
              >
                {marketData.changePercent24h > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {formatChange(marketData.changePercent24h, true)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "ghost"}
                  className={`h-7 px-3 text-xs ${
                    timeframe === tf.value 
                      ? 'bg-emerald-500 text-white' 
                      : 'hover:bg-slate-600/50'
                  }`}
                  onClick={() => setTimeframe(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            
            <Button size="sm" variant="ghost" onClick={() => toast({ title: "Settings", description: "Chart settings coming soon!" })}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-3 text-sm">
          <div>
            <span className="text-slate-400">24h High: </span>
            <span className="text-emerald-400">{formatPrice(marketData.high24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">24h Low: </span>
            <span className="text-red-400">{formatPrice(marketData.low24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">Volume: </span>
            <span className="text-white">{formatVolume(marketData.volume24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">Market Cap: </span>
            <span className="text-white">{formatVolume(marketData.marketCap)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        {/* Main Chart */}
        <div className="lg:col-span-3">
          <div className="h-96 bg-slate-900/50 rounded-lg relative overflow-hidden">
            {/* Advanced candlestick chart */}
            <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
              {chartData.slice(-50).map((candle, i) => {
                const isGreen = candle.close > candle.open;
                const bodyHeight = Math.abs(candle.close - candle.open) / candle.high * 100;
                const wickTop = (candle.high - Math.max(candle.open, candle.close)) / candle.high * 100;
                const wickBottom = (Math.min(candle.open, candle.close) - candle.low) / candle.high * 100;
                
                return (
                  <div
                    key={i}
                    className="flex-1 max-w-[8px] relative h-full flex flex-col justify-end"
                    title={`O: ${candle.open} H: ${candle.high} L: ${candle.low} C: ${candle.close}`}
                  >
                    {/* Upper wick */}
                    <div 
                      className={`w-[1px] mx-auto ${isGreen ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ height: `${wickTop}%` }}
                    />
                    {/* Body */}
                    <div 
                      className={`w-full ${
                        isGreen ? 'bg-emerald-500' : 'bg-red-500'
                      } opacity-80 hover:opacity-100 transition-opacity`}
                      style={{ height: `${bodyHeight}%` }}
                    />
                    {/* Lower wick */}
                    <div 
                      className={`w-[1px] mx-auto ${isGreen ? 'bg-emerald-400' : 'bg-red-400'}`}
                      style={{ height: `${wickBottom}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Price line overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8"/>
                </linearGradient>
              </defs>
              {chartData.length > 1 && (
                <path
                  d={`M ${chartData.slice(-50).map((candle, i) => 
                    `${(i / 49) * 100}% ${100 - (candle.close / Math.max(...chartData.slice(-50).map(c => c.high)) * 100)}%`
                  ).join(' L ')}`}
                  stroke="url(#priceGradient)"
                  strokeWidth="2"
                  fill="none"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Grid lines */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-slate-600"
                  style={{ top: `${(i + 1) * 20}%` }}
                />
              ))}
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="absolute h-full border-l border-slate-600"
                  style={{ left: `${(i + 1) * 16.66}%` }}
                />
              ))}
            </div>

            {/* Current price indicator */}
            <div className="absolute right-0 top-1/3 bg-emerald-500 text-white text-xs px-2 py-1 rounded-l">
              {formatPrice(marketData.price)}
            </div>

            {/* Volume bars at bottom */}
            {indicators.volume && (
              <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end space-x-1 p-2">
                {chartData.slice(-50).map((candle, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-blue-500/50 rounded-sm"
                    style={{ 
                      height: `${(candle.volume / Math.max(...chartData.slice(-50).map(c => c.volume))) * 100}%` 
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Technical Indicators */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {indicators.rsi && technicalData.rsi && (
              <Card className="p-3 bg-slate-700/30 border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">RSI (14)</span>
                  <span className={`font-bold ${
                    technicalData.rsi > 70 ? 'text-red-400' : 
                    technicalData.rsi < 30 ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    {technicalData.rsi.toFixed(2)}
                  </span>
                </div>
              </Card>
            )}

            {indicators.macd && technicalData.macd && (
              <Card className="p-3 bg-slate-700/30 border-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">MACD</span>
                  <span className={`font-bold ${
                    technicalData.macd.macd > technicalData.macd.signal ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {technicalData.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
              </Card>
            )}

            <Card className="p-3 bg-slate-700/30 border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Trend</span>
                <span className={`font-bold ${
                  marketData.changePercent24h > 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {marketData.changePercent24h > 2 ? 'Strong Up' :
                   marketData.changePercent24h > 0 ? 'Up' :
                   marketData.changePercent24h > -2 ? 'Down' : 'Strong Down'}
                </span>
              </div>
            </Card>

            <Card className="p-3 bg-slate-700/30 border-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Volatility</span>
                <span className="font-bold text-blue-400">
                  {Math.abs(marketData.changePercent24h) > 5 ? 'High' : 
                   Math.abs(marketData.changePercent24h) > 2 ? 'Medium' : 'Low'}
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Order Book */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-700/30 border-slate-600 h-96">
            <div className="p-4 border-b border-slate-600">
              <h3 className="font-bold text-white flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Order Book
              </h3>
            </div>
            
            {orderBook && (
              <div className="p-4 h-full overflow-hidden">
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2 text-slate-400 font-medium">
                    <span>Price</span>
                    <span>Size</span>
                    <span>Total</span>
                  </div>
                  
                  {/* Asks (sell orders) */}
                  <div className="space-y-1">
                    {orderBook.asks.slice(0, 8).reverse().map((ask, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 text-red-400 hover:bg-red-500/10 px-1 rounded">
                        <span className="font-mono">{ask.price.toFixed(2)}</span>
                        <span className="font-mono">{ask.quantity.toFixed(4)}</span>
                        <span className="font-mono">{ask.total.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Spread */}
                  <div className="border-t border-slate-600 my-2 pt-1">
                    <div className="text-center text-yellow-400 font-bold">
                      Spread: ${(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Bids (buy orders) */}
                  <div className="space-y-1">
                    {orderBook.bids.slice(0, 8).map((bid, i) => (
                      <div key={i} className="grid grid-cols-3 gap-2 text-emerald-400 hover:bg-emerald-500/10 px-1 rounded">
                        <span className="font-mono">{bid.price.toFixed(2)}</span>
                        <span className="font-mono">{bid.quantity.toFixed(4)}</span>
                        <span className="font-mono">{bid.total.toFixed(0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Chart Controls */}
      <Tabs defaultValue="indicators" className="mx-4 mb-4">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
          <TabsTrigger value="drawing">Drawing</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="indicators" className="mt-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(indicators).map(([key, enabled]) => (
              <Button
                key={key}
                size="sm"
                variant={enabled ? "default" : "outline"}
                onClick={() => setIndicators(prev => ({ ...prev, [key]: !enabled }))}
                className={enabled ? "bg-emerald-500 hover:bg-emerald-600" : ""}
              >
                {key.toUpperCase()}
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="drawing" className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">Trend Line</Button>
            <Button size="sm" variant="outline">Support/Resistance</Button>
            <Button size="sm" variant="outline">Fibonacci</Button>
            <Button size="sm" variant="outline">Rectangle</Button>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">Price Alert</Button>
            <Button size="sm" variant="outline">Volume Alert</Button>
            <Button size="sm" variant="outline">Technical Alert</Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
