
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Maximize2, Settings } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { marketDataService, type MarketData, type CandlestickData } from '@/services/marketDataService';
import { useSettings } from '@/contexts/SettingsContext';

interface TradingChartProps {
  selectedSymbol: string;
  onSymbolChange?: (symbol: string) => void;
}

export const TradingChart = ({ selectedSymbol, onSymbolChange }: TradingChartProps) => {
  const { settings } = useSettings();
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState<CandlestickData[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [availableSymbols, setAvailableSymbols] = useState<MarketData[]>([]);

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
    const loadInitialData = async () => {
      try {
        const symbols = await marketDataService.getMarketData();
        setAvailableSymbols(symbols);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadInitialData();

    const unsubscribeMarket = marketDataService.subscribeToMarketData((allData) => {
      const symbolData = allData.find(data => data.symbol === selectedSymbol);
      if (symbolData) {
        setMarketData(symbolData);
      }
      setAvailableSymbols(allData);
    });

    const unsubscribeChart = marketDataService.subscribeToChartData(selectedSymbol, (data) => {
      const formattedData = data.map(item => ({
        ...item,
        time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      }));
      setChartData(formattedData);
    });

    return () => {
      unsubscribeMarket();
      unsubscribeChart();
    };
  }, [selectedSymbol]);

  const formatPrice = (price: number) => {
    return marketDataService.formatPrice(price);
  };

  const formatChange = (change: number, isPercent: boolean = false) => {
    return marketDataService.formatChange(change, isPercent);
  };

  if (!marketData) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto ${settings.animations ? '' : 'animate-none'}`}></div>
            <p className="text-slate-400">Loading chart data...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Select value={selectedSymbol} onValueChange={onSymbolChange}>
              <SelectTrigger className="w-full sm:w-40 bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {availableSymbols.map((data) => (
                  <SelectItem key={data.symbol} value={data.symbol}>
                    {data.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-bold text-white">
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

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf.value}
                  size="sm"
                  variant={timeframe === tf.value ? "default" : "ghost"}
                  className={`h-7 px-2 sm:px-3 text-xs ${
                    timeframe === tf.value 
                      ? 'bg-emerald-500 text-white' 
                      : 'hover:bg-slate-600/50'
                  } ${settings.animations ? 'transition-all duration-200' : ''}`}
                  onClick={() => setTimeframe(tf.value)}
                >
                  {tf.label}
                </Button>
              ))}
            </div>
            
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 text-sm">
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
            <span className="text-white">{marketDataService.formatVolume(marketData.volume24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">Market Cap: </span>
            <span className="text-white">{marketDataService.formatVolume(marketData.marketCap)}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="h-80 sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fontSize: 12 }}
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10B981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Volume Chart */}
        <div className="h-20 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number) => [value.toLocaleString(), 'Volume']}
              />
              <Bar 
                dataKey="volume" 
                fill="#3B82F6" 
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};
