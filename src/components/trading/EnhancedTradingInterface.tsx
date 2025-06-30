
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Activity } from 'lucide-react';

interface EnhancedTradingInterfaceProps {
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

export const EnhancedTradingInterface = ({ selectedSymbol, onSymbolChange }: EnhancedTradingInterfaceProps) => {
  const symbols = ['BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD'];

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-emerald-500" />
            Trading Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-slate-300 text-sm">Select Symbol</label>
            <div className="flex gap-2 mt-2">
              {symbols.map((symbol) => (
                <Badge
                  key={symbol}
                  variant={selectedSymbol === symbol ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onSymbolChange(symbol)}
                >
                  {symbol}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Current Price</span>
                  <span className="text-white font-bold">$45,234</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">24h Change</span>
                  <span className="text-emerald-400 font-bold">+2.34%</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-center p-8 text-slate-400">
            <Activity className="h-6 w-6 mr-2" />
            <span>Trading interface coming soon</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
