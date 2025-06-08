
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Star } from 'lucide-react';

interface Crypto {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
  trending: boolean;
}

interface TrendingCryptosProps {
  onSymbolSelect: (symbol: string) => void;
}

export const TrendingCryptos = ({ onSymbolSelect }: TrendingCryptosProps) => {
  const [cryptos, setCryptos] = useState<Crypto[]>([
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67432.50,
      change24h: 3.24,
      volume: 23400000000,
      marketCap: 1340000000000,
      trending: true
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3247.89,
      change24h: -1.15,
      volume: 12300000000,
      marketCap: 390000000000,
      trending: true
    },
    {
      id: 'cardano',
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.48,
      change24h: 7.23,
      volume: 890000000,
      marketCap: 17000000000,
      trending: true
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      price: 234.56,
      change24h: 12.45,
      volume: 2100000000,
      marketCap: 112000000000,
      trending: true
    },
    {
      id: 'chainlink',
      symbol: 'LINK',
      name: 'Chainlink',
      price: 24.67,
      change24h: -3.42,
      volume: 567000000,
      marketCap: 15600000000,
      trending: false
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 4 : 2
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(1)}M`;
    return `$${(volume / 1e3).toFixed(1)}K`;
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Trending Cryptos</h3>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
          Live Data
        </Badge>
      </div>

      <div className="space-y-3">
        {cryptos.map((crypto) => (
          <div
            key={crypto.id}
            className="p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
            onClick={() => onSymbolSelect(`${crypto.symbol}-AUD`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{crypto.symbol.slice(0, 2)}</span>
                  </div>
                  {crypto.trending && (
                    <Star className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 fill-current" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{crypto.symbol}</span>
                    <span className="text-sm text-slate-400">{crypto.name}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Vol: {formatVolume(crypto.volume)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-white">
                  {formatPrice(crypto.price)}
                </div>
                <div className="flex items-center space-x-1">
                  {crypto.change24h > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-400" />
                  )}
                  <span className={`text-sm ${crypto.change24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                MCap: {formatVolume(crypto.marketCap)}
              </span>
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-6 px-2 text-xs hover:bg-emerald-500/20"
                onClick={(e) => {
                  e.stopPropagation();
                  onSymbolSelect(`${crypto.symbol}-AUD`);
                }}
              >
                Trade
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button 
        variant="outline" 
        className="w-full mt-4 border-slate-600 hover:bg-slate-700/50"
      >
        View All Markets
      </Button>
    </Card>
  );
};
