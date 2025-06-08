
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Coins, DollarSign } from 'lucide-react';

interface FarmingStrategy {
  protocol: string;
  pool: string;
  apy: number;
  risk: 'Low' | 'Medium' | 'High';
  tokenPair: string;
  tvl: number;
}

export const YieldFarmingCalculator = () => {
  const [principal, setPrincipal] = useState<string>('10000');
  const [timeframe, setTimeframe] = useState<string>('365');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  
  const strategies: FarmingStrategy[] = [
    {
      protocol: 'PancakeSwap',
      pool: 'BNB-BUSD',
      apy: 12.5,
      risk: 'Low',
      tokenPair: 'BNB/BUSD',
      tvl: 45000000
    },
    {
      protocol: 'Uniswap V3',
      pool: 'ETH-USDC',
      apy: 8.2,
      risk: 'Low',
      tokenPair: 'ETH/USDC',
      tvl: 120000000
    },
    {
      protocol: 'SushiSwap',
      pool: 'SUSHI-ETH',
      apy: 25.8,
      risk: 'Medium',
      tokenPair: 'SUSHI/ETH',
      tvl: 15000000
    },
    {
      protocol: 'Curve',
      pool: '3Pool',
      apy: 6.1,
      risk: 'Low',
      tokenPair: 'USDC/USDT/DAI',
      tvl: 180000000
    },
    {
      protocol: 'Compound',
      pool: 'COMP',
      apy: 4.8,
      risk: 'Low',
      tokenPair: 'COMP',
      tvl: 85000000
    },
    {
      protocol: 'Yearn',
      pool: 'yvUSDC',
      apy: 7.3,
      risk: 'Medium',
      tokenPair: 'USDC',
      tvl: 65000000
    }
  ];

  const calculateReturns = (strategy: FarmingStrategy) => {
    const principalAmount = parseFloat(principal) || 0;
    const days = parseInt(timeframe) || 0;
    const dailyRate = strategy.apy / 365 / 100;
    
    const compoundReturns = principalAmount * Math.pow(1 + dailyRate, days);
    const totalReturns = compoundReturns - principalAmount;
    const impermanentLoss = principalAmount * 0.02; // Estimated 2% IL
    const netReturns = totalReturns - impermanentLoss;
    
    return {
      totalValue: compoundReturns,
      grossReturns: totalReturns,
      impermanentLoss,
      netReturns,
      dailyReturns: principalAmount * dailyRate
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'border-green-500/30 text-green-400';
      case 'Medium': return 'border-yellow-500/30 text-yellow-400';
      case 'High': return 'border-red-500/30 text-red-400';
      default: return 'border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Calculator className="h-6 w-6 text-emerald-400" />
        <h2 className="text-2xl font-bold text-white">DeFi Yield Farming Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Controls */}
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Investment Parameters</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Principal Amount (AUD)
              </label>
              <Input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="10000"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Time Period (Days)
              </label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="180">180 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                  <SelectItem value="730">2 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-slate-300 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrincipal('5000')}
                  className="border-slate-600 text-slate-300"
                >
                  $5K
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrincipal('10000')}
                  className="border-slate-600 text-slate-300"
                >
                  $10K
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrincipal('50000')}
                  className="border-slate-600 text-slate-300"
                >
                  $50K
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPrincipal('100000')}
                  className="border-slate-600 text-slate-300"
                >
                  $100K
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Strategy Results */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-bold text-white">Available Strategies</h3>
          
          {strategies.map((strategy, index) => {
            const returns = calculateReturns(strategy);
            
            return (
              <Card 
                key={index} 
                className={`p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                  selectedStrategy === strategy.protocol + strategy.pool ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => setSelectedStrategy(strategy.protocol + strategy.pool)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Coins className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="font-medium text-white">{strategy.protocol}</h4>
                      <p className="text-sm text-slate-400">{strategy.tokenPair}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getRiskColor(strategy.risk)}>
                      {strategy.risk}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                      {strategy.apy.toFixed(1)}% APY
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">TVL</p>
                    <p className="font-medium text-white">{formatNumber(strategy.tvl)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Est. Returns</p>
                    <p className="font-medium text-emerald-400">{formatCurrency(returns.netReturns)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Daily Income</p>
                    <p className="font-medium text-blue-400">{formatCurrency(returns.dailyReturns)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Final Value</p>
                    <p className="font-medium text-white">{formatCurrency(returns.totalValue)}</p>
                  </div>
                </div>

                {returns.impermanentLoss > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                    <p className="text-xs text-yellow-400">
                      ⚠️ Estimated impermanent loss: {formatCurrency(returns.impermanentLoss)}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
