
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator, TrendingUp, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { algorandService, AlgorandAsset } from '@/services/algorandService';

interface DeFiProtocol {
  name: string;
  type: 'dex' | 'lending' | 'staking' | 'bridge';
  apy: number;
  tvl: string;
  description: string;
  website: string;
  assets: string[];
}

export const AlgorandDeFi = () => {
  const { toast } = useToast();
  const [selectedProtocol, setSelectedProtocol] = useState<DeFiProtocol | null>(null);
  const [amount, setAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('ALGO');
  const [timeframe, setTimeframe] = useState('30');
  const [yieldResults, setYieldResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Popular Algorand DeFi protocols
  const defiProtocols: DeFiProtocol[] = [
    {
      name: 'Tinyman',
      type: 'dex',
      apy: 12.5,
      tvl: '$45M',
      description: 'Leading AMM DEX on Algorand',
      website: 'https://tinyman.org',
      assets: ['ALGO', 'USDC', 'goBTC', 'goETH']
    },
    {
      name: 'Pera Wallet Governance',
      type: 'staking',
      apy: 8.2,
      tvl: '$1.2B',
      description: 'Algorand Governance staking',
      website: 'https://governance.algorand.foundation',
      assets: ['ALGO']
    },
    {
      name: 'AlgoFi',
      type: 'lending',
      apy: 15.3,
      tvl: '$120M',
      description: 'Lending and borrowing protocol',
      website: 'https://algofi.org',
      assets: ['ALGO', 'USDC', 'STBL']
    },
    {
      name: 'Folks Finance',
      type: 'lending',
      apy: 13.7,
      tvl: '$85M',
      description: 'DeFi lending platform',
      website: 'https://folks.finance',
      assets: ['ALGO', 'USDC', 'goBTC']
    },
    {
      name: 'Humble DeFi',
      type: 'dex',
      apy: 18.9,
      tvl: '$25M',
      description: 'Yield farming and DEX',
      website: 'https://humble.sh',
      assets: ['ALGO', 'HMBL']
    }
  ];

  const calculateYield = () => {
    if (!selectedProtocol || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select a protocol and enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate calculation
    setTimeout(() => {
      const principal = parseFloat(amount);
      const apy = selectedProtocol.apy / 100;
      const days = parseInt(timeframe);
      
      // Calculate compound interest
      const dailyRate = Math.pow(1 + apy, 1 / 365) - 1;
      const finalAmount = principal * Math.pow(1 + dailyRate, days);
      const totalYield = finalAmount - principal;
      const yieldPercentage = (totalYield / principal) * 100;

      setYieldResults({
        principal,
        finalAmount,
        totalYield,
        yieldPercentage,
        dailyYield: totalYield / days,
        protocol: selectedProtocol.name,
        asset: selectedAsset,
        timeframe: days
      });

      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProtocolTypeIcon = (type: string) => {
    switch (type) {
      case 'dex':
        return '🔄';
      case 'lending':
        return '🏦';
      case 'staking':
        return '🔒';
      case 'bridge':
        return '🌉';
      default:
        return '📊';
    }
  };

  const getProtocolTypeColor = (type: string) => {
    switch (type) {
      case 'dex':
        return 'border-blue-500/30 text-blue-400';
      case 'lending':
        return 'border-emerald-500/30 text-emerald-400';
      case 'staking':
        return 'border-purple-500/30 text-purple-400';
      case 'bridge':
        return 'border-orange-500/30 text-orange-400';
      default:
        return 'border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Zap className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Algorand DeFi</h2>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
          Real-time APY
        </Badge>
      </div>

      <Tabs defaultValue="protocols" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="protocols">Protocols</TabsTrigger>
          <TabsTrigger value="calculator">Yield Calculator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="protocols" className="space-y-6">
          {/* Protocol Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defiProtocols.map((protocol, index) => (
              <Card 
                key={index} 
                className={`p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700 cursor-pointer transition-all hover:border-emerald-500/50 ${
                  selectedProtocol?.name === protocol.name ? 'border-emerald-500 bg-emerald-500/10' : ''
                }`}
                onClick={() => setSelectedProtocol(protocol)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getProtocolTypeIcon(protocol.type)}</span>
                    <h3 className="text-lg font-bold text-white">{protocol.name}</h3>
                  </div>
                  <Badge variant="outline" className={getProtocolTypeColor(protocol.type)}>
                    {protocol.type.toUpperCase()}
                  </Badge>
                </div>

                <p className="text-sm text-slate-400 mb-4">{protocol.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">APY:</span>
                    <span className="text-emerald-400 font-bold">{protocol.apy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">TVL:</span>
                    <span className="text-white">{protocol.tvl}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {protocol.assets.map((asset, assetIndex) => (
                    <Badge key={assetIndex} variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                      {asset}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(protocol.website, '_blank');
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Visit Protocol
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calculator Input */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <Calculator className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Yield Calculator</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Protocol
                  </label>
                  <Select 
                    value={selectedProtocol?.name || ''} 
                    onValueChange={(value) => {
                      const protocol = defiProtocols.find(p => p.name === value);
                      setSelectedProtocol(protocol || null);
                    }}
                  >
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue placeholder="Choose a protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      {defiProtocols.map((protocol) => (
                        <SelectItem key={protocol.name} value={protocol.name}>
                          {protocol.name} ({protocol.apy}% APY)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Asset
                  </label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALGO">ALGO</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="goBTC">goBTC</SelectItem>
                      <SelectItem value="goETH">goETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time Period (days)
                  </label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={calculateYield}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Calculate Yield
                </Button>
              </div>
            </Card>

            {/* Results */}
            {yieldResults && (
              <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3 mb-6">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Yield Projection</h3>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <p className="text-sm text-emerald-400 mb-1">Total Yield</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      +{yieldResults.totalYield.toFixed(6)} {yieldResults.asset}
                    </p>
                    <p className="text-sm text-emerald-300">
                      +{yieldResults.yieldPercentage.toFixed(2)}%
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-xs text-slate-400">Initial</p>
                      <p className="text-lg font-bold text-white">
                        {yieldResults.principal.toFixed(2)} {yieldResults.asset}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-700/30 rounded-lg">
                      <p className="text-xs text-slate-400">Final</p>
                      <p className="text-lg font-bold text-white">
                        {yieldResults.finalAmount.toFixed(6)} {yieldResults.asset}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Protocol:</span>
                      <span className="text-white">{yieldResults.protocol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Period:</span>
                      <span className="text-white">{yieldResults.timeframe} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Yield:</span>
                      <span className="text-emerald-400">
                        +{yieldResults.dailyYield.toFixed(6)} {yieldResults.asset}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-slate-700/20 p-3 rounded">
                    <p>* This is a projection based on current APY rates. Actual yields may vary due to market conditions, protocol changes, and other factors.</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* DeFi Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-400">Total TVL</p>
                  <p className="text-xl font-bold text-white">$1.47B</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Avg APY</p>
                  <p className="text-xl font-bold text-blue-400">13.7%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Calculator className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Active Protocols</p>
                  <p className="text-xl font-bold text-white">{defiProtocols.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-slate-400">24h Volume</p>
                  <p className="text-xl font-bold text-white">$12.3M</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Protocol Comparison */}
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-bold text-white">Protocol Comparison</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/30">
                  <tr className="text-left">
                    <th className="p-4 text-sm font-medium text-slate-300">Protocol</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Type</th>
                    <th className="p-4 text-sm font-medium text-slate-300">APY</th>
                    <th className="p-4 text-sm font-medium text-slate-300">TVL</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Assets</th>
                    <th className="p-4 text-sm font-medium text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {defiProtocols.map((protocol, index) => (
                    <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getProtocolTypeIcon(protocol.type)}</span>
                          <span className="font-medium text-white">{protocol.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={getProtocolTypeColor(protocol.type)}>
                          {protocol.type}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-400 font-bold">{protocol.apy}%</span>
                      </td>
                      <td className="p-4 text-white">{protocol.tvl}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {protocol.assets.slice(0, 2).map((asset, assetIndex) => (
                            <Badge key={assetIndex} variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                              {asset}
                            </Badge>
                          ))}
                          {protocol.assets.length > 2 && (
                            <Badge variant="outline" className="border-slate-500/30 text-slate-400 text-xs">
                              +{protocol.assets.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600"
                          onClick={() => window.open(protocol.website, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
