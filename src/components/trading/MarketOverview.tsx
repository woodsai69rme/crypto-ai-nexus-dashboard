
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, TrendingUp, TrendingDown, Filter } from 'lucide-react';

interface MarketOverviewProps {
  onSymbolSelect: (symbol: string) => void;
}

export const MarketOverview = ({ onSymbolSelect }: MarketOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');

  const marketData = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      price: 67432.50,
      change24h: 3.24,
      volume: 23400000000,
      marketCap: 1340000000000,
      supply: 19800000,
      favorite: true
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      price: 3247.89,
      change24h: -1.15,
      volume: 12300000000,
      marketCap: 390000000000,
      supply: 120300000,
      favorite: true
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.48,
      change24h: 7.23,
      volume: 890000000,
      marketCap: 17000000000,
      supply: 35000000000,
      favorite: false
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 234.56,
      change24h: 12.45,
      volume: 2100000000,
      marketCap: 112000000000,
      supply: 477000000,
      favorite: false
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      price: 12.89,
      change24h: -2.67,
      volume: 456000000,
      marketCap: 16800000000,
      supply: 1300000000,
      favorite: false
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      price: 24.67,
      change24h: -3.42,
      volume: 567000000,
      marketCap: 15600000000,
      supply: 1000000000,
      favorite: true
    }
  ];

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

  const filteredData = marketData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Market Overview</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              Live
            </Badge>
            <Button size="sm" variant="ghost">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-700/50 border-slate-600 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-700/30">
            <tr className="text-left">
              <th className="p-3 text-sm font-medium text-slate-300">Asset</th>
              <th className="p-3 text-sm font-medium text-slate-300">Price (AUD)</th>
              <th className="p-3 text-sm font-medium text-slate-300">24h Change</th>
              <th className="p-3 text-sm font-medium text-slate-300">Volume</th>
              <th className="p-3 text-sm font-medium text-slate-300">Market Cap</th>
              <th className="p-3 text-sm font-medium text-slate-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((crypto, index) => (
              <tr 
                key={crypto.symbol}
                className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer"
                onClick={() => onSymbolSelect(`${crypto.symbol}-AUD`)}
              >
                <td className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{crypto.symbol.slice(0, 2)}</span>
                      </div>
                      <span className="absolute -top-1 -right-1 text-xs">
                        {crypto.favorite && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{crypto.symbol}</div>
                      <div className="text-sm text-slate-400">{crypto.name}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="font-medium text-white">{formatPrice(crypto.price)}</span>
                </td>
                <td className="p-3">
                  <div className="flex items-center space-x-1">
                    {crypto.change24h > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className={`font-medium ${crypto.change24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                    </span>
                  </div>
                </td>
                <td className="p-3">
                  <span className="text-slate-300">{formatVolume(crypto.volume)}</span>
                </td>
                <td className="p-3">
                  <span className="text-slate-300">{formatVolume(crypto.marketCap)}</span>
                </td>
                <td className="p-3">
                  <Button 
                    size="sm" 
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSymbolSelect(`${crypto.symbol}-AUD`);
                    }}
                  >
                    Trade
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
