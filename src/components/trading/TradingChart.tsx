
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Maximize2, Settings } from 'lucide-react';

interface TradingChartProps {
  selectedSymbol: string;
}

export const TradingChart = ({ selectedSymbol }: TradingChartProps) => {
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState({
    price: 67432.50,
    change: 3.24,
    volume: 23400000000,
    high24h: 68500.00,
    low24h: 65200.00
  });

  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(price);
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">{selectedSymbol}</h2>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">
                {formatPrice(chartData.price)}
              </span>
              <Badge 
                variant="outline" 
                className={`${
                  chartData.change > 0 
                    ? 'border-emerald-500/30 text-emerald-400' 
                    : 'border-red-500/30 text-red-400'
                }`}
              >
                {chartData.change > 0 ? '+' : ''}{chartData.change.toFixed(2)}%
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex bg-slate-700/50 rounded-lg p-1">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  size="sm"
                  variant={timeframe === tf ? "default" : "ghost"}
                  className={`h-7 px-3 text-xs ${
                    timeframe === tf 
                      ? 'bg-emerald-500 text-white' 
                      : 'hover:bg-slate-600/50'
                  }`}
                  onClick={() => setTimeframe(tf)}
                >
                  {tf}
                </Button>
              ))}
            </div>
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-3 text-sm">
          <div>
            <span className="text-slate-400">24h High: </span>
            <span className="text-emerald-400">{formatPrice(chartData.high24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">24h Low: </span>
            <span className="text-red-400">{formatPrice(chartData.low24h)}</span>
          </div>
          <div>
            <span className="text-slate-400">Volume: </span>
            <span className="text-white">
              ${(chartData.volume / 1e9).toFixed(2)}B
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Chart placeholder with simulated candlestick pattern */}
        <div className="h-96 bg-slate-900/50 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 flex items-end justify-center space-x-1 p-4">
            {Array.from({ length: 50 }, (_, i) => {
              const height = Math.random() * 80 + 10;
              const isGreen = Math.random() > 0.5;
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
                  {/* Candlestick wick */}
                  <div 
                    className={`absolute left-1/2 w-[1px] h-3 ${
                      isGreen ? 'bg-emerald-300' : 'bg-red-300'
                    } transform -translate-x-1/2 -top-3`}
                  />
                  <div 
                    className={`absolute left-1/2 w-[1px] h-3 ${
                      isGreen ? 'bg-emerald-300' : 'bg-red-300'
                    } transform -translate-x-1/2 -bottom-3`}
                  />
                </div>
              );
            })}
          </div>

          {/* Price line overlay */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            <path
              d="M 0 200 Q 100 150 200 180 T 400 160 T 600 140 T 800 120"
              stroke="url(#priceGradient)"
              strokeWidth="2"
              fill="none"
              className="animate-pulse"
            />
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
            {formatPrice(chartData.price)}
          </div>
        </div>

        {/* Chart controls */}
        <Tabs defaultValue="technical" className="mt-4">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="technical">Technical Analysis</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="drawing">Drawing Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="mt-4">
            <div className="grid grid-cols-4 gap-4">
              {['RSI: 65.4', 'MACD: Bullish', 'BB: Neutral', 'MA50: 64.2K'].map((indicator, index) => (
                <div key={index} className="bg-slate-700/30 p-3 rounded-lg text-center">
                  <span className="text-sm text-slate-300">{indicator}</span>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
};
