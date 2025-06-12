
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Star, TrendingUp, TrendingDown, Filter, Loader2 } from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';
import { useToast } from '@/hooks/use-toast';

interface MarketOverviewProps {
  onSymbolSelect: (symbol: string) => void;
}

export const MarketOverview = ({ onSymbolSelect }: MarketOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['BTC', 'ETH', 'LINK']));
  
  const symbols = ['BTC-AUD', 'ETH-AUD', 'ADA-AUD', 'SOL-AUD', 'DOT-AUD', 'LINK-AUD'];
  const { marketData, loading, error, refreshData } = useMarketData(symbols);
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Market Data Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const toggleFavorite = (symbol: string) => {
    const baseSymbol = symbol.replace('-AUD', '');
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(baseSymbol)) {
        newFavorites.delete(baseSymbol);
      } else {
        newFavorites.add(baseSymbol);
      }
      return newFavorites;
    });
  };

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

  const filteredData = marketData.filter(item => {
    const baseSymbol = item.symbol.replace('-AUD', '');
    return (
      baseSymbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading && marketData.length === 0) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mr-3" />
          <span className="text-white">Loading market data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Market Overview</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
              Live
            </Badge>
            <Button size="sm" variant="ghost" onClick={refreshData} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
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
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400">
                  {error ? 'Failed to load market data' : 'No cryptocurrencies found'}
                </td>
              </tr>
            ) : (
              filteredData.map((crypto) => {
                const baseSymbol = crypto.symbol.replace('-AUD', '');
                const isFavorite = favorites.has(baseSymbol);
                
                return (
                  <tr 
                    key={crypto.symbol}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors cursor-pointer"
                    onClick={() => onSymbolSelect(crypto.symbol)}
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{baseSymbol.slice(0, 2)}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(crypto.symbol);
                            }}
                            className="absolute -top-1 -right-1"
                          >
                            <Star 
                              className={`h-3 w-3 transition-colors ${
                                isFavorite 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-slate-400 hover:text-yellow-400'
                              }`} 
                            />
                          </button>
                        </div>
                        <div>
                          <div className="font-medium text-white">{baseSymbol}</div>
                          <div className="text-sm text-slate-400">{baseSymbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-white">{formatPrice(crypto.price)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        {crypto.changePercent24h > 0 ? (
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                        <span className={`font-medium ${crypto.changePercent24h > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {crypto.changePercent24h > 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-300">{formatVolume(crypto.volume24h)}</span>
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
                          onSymbolSelect(crypto.symbol);
                        }}
                      >
                        Trade
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
