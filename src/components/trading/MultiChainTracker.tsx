
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Layers, ExternalLink, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Chain {
  id: string;
  name: string;
  symbol: string;
  explorerUrl: string;
  rpcUrl: string;
  icon: string;
}

interface Transaction {
  hash: string;
  chain: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
  gasUsed: string;
  gasPrice: string;
  type: 'transfer' | 'contract' | 'swap' | 'nft';
}

export const MultiChainTracker = () => {
  const { toast } = useToast();
  const [address, setAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const chains: Chain[] = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
      rpcUrl: 'https://eth.llamarpc.com',
      icon: '⟠'
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      explorerUrl: 'https://blockstream.info',
      rpcUrl: 'https://blockstream.info/api',
      icon: '₿'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      symbol: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
      rpcUrl: 'https://polygon-rpc.com',
      icon: '⬟'
    },
    {
      id: 'bsc',
      name: 'BSC',
      symbol: 'BNB',
      explorerUrl: 'https://bscscan.com',
      rpcUrl: 'https://bsc-dataseed.binance.org',
      icon: '🟡'
    },
    {
      id: 'avalanche',
      name: 'Avalanche',
      symbol: 'AVAX',
      explorerUrl: 'https://snowtrace.io',
      rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
      icon: '🔺'
    },
    {
      id: 'solana',
      name: 'Solana',
      symbol: 'SOL',
      explorerUrl: 'https://explorer.solana.com',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      icon: '◎'
    },
    {
      id: 'algorand',
      name: 'Algorand',
      symbol: 'ALGO',
      explorerUrl: 'https://algoexplorer.io',
      rpcUrl: 'https://mainnet-api.4160.nodely.io',
      icon: '⟐'
    }
  ];

  // Mock transaction data
  const mockTransactions: Transaction[] = [
    {
      hash: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'ethereum',
      from: '0xabcd...1234',
      to: '0xefgh...5678',
      value: '1.5 ETH',
      timestamp: Date.now() - 3600000,
      status: 'success',
      gasUsed: '21,000',
      gasPrice: '20 gwei',
      type: 'transfer'
    },
    {
      hash: '0xabcdef1234567890abcdef1234567890abcdef12',
      chain: 'polygon',
      from: '0x1234...abcd',
      to: '0x5678...efgh',
      value: '100 MATIC',
      timestamp: Date.now() - 7200000,
      status: 'success',
      gasUsed: '45,000',
      gasPrice: '30 gwei',
      type: 'swap'
    },
    {
      hash: 'ABC123DEF456GHI789JKL012MNO345PQR678STU',
      chain: 'solana',
      from: 'ABC123...XYZ789',
      to: 'DEF456...ABC123',
      value: '50 SOL',
      timestamp: Date.now() - 10800000,
      status: 'success',
      gasUsed: '5,000',
      gasPrice: '0.000005 SOL',
      type: 'transfer'
    },
    {
      hash: 'ALGO123456789ABCDEF123456789ABCDEF123456789ABCDEF123456789ABCD',
      chain: 'algorand',
      from: 'ALGO123...XYZ789',
      to: 'ABCD123...GHI789',
      value: '1000 ALGO',
      timestamp: Date.now() - 14400000,
      status: 'success',
      gasUsed: '1,000',
      gasPrice: '0.001 ALGO',
      type: 'contract'
    }
  ];

  const fetchTransactions = async () => {
    if (!address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
      toast({
        title: "Success",
        description: "Transactions loaded successfully",
      });
    }, 1500);
  };

  const getChainInfo = (chainId: string) => {
    return chains.find(chain => chain.id === chainId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/30 text-emerald-400';
      case 'pending':
        return 'border-yellow-500/30 text-yellow-400';
      case 'failed':
        return 'border-red-500/30 text-red-400';
      default:
        return 'border-slate-500/30 text-slate-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'border-blue-500/30 text-blue-400';
      case 'swap':
        return 'border-purple-500/30 text-purple-400';
      case 'contract':
        return 'border-orange-500/30 text-orange-400';
      case 'nft':
        return 'border-pink-500/30 text-pink-400';
      default:
        return 'border-slate-500/30 text-slate-400';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInMs = now - timestamp;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInHours > 24) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return `${diffInMinutes}m ago`;
    }
  };

  const filteredTransactions = selectedChain === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.chain === selectedChain);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Layers className="h-6 w-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Multi-Chain Tracker</h2>
        </div>
        <Badge variant="outline" className="border-purple-500/30 text-purple-400">
          {chains.length} Chains
        </Badge>
      </div>

      {/* Address Input */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter wallet address (supports multiple chains)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-700/50 border-slate-600"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedChain} onValueChange={setSelectedChain}>
              <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Chains</SelectItem>
                {chains.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id}>
                    {chain.icon} {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={fetchTransactions}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="chains">Supported Chains</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          {/* Transaction List */}
          {filteredTransactions.length === 0 ? (
            <Card className="p-8 bg-slate-800/50 text-center">
              <Layers className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Transactions Found</h3>
              <p className="text-slate-400">Enter an address to search for transactions across multiple chains</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx, index) => {
                const chainInfo = getChainInfo(tx.chain);
                return (
                  <Card key={index} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{chainInfo?.icon}</span>
                        <div>
                          <h3 className="font-bold text-white">{chainInfo?.name}</h3>
                          <p className="text-sm text-slate-400">{tx.hash.slice(0, 20)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                        <Badge variant="outline" className={getTypeColor(tx.type)}>
                          {tx.type}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-400">From</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-mono text-sm">{tx.from}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.from)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">To</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-white font-mono text-sm">{tx.to}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.to)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-slate-400">Value</p>
                        <p className="text-white font-bold">{tx.value}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Gas Used</p>
                        <p className="text-white">{tx.gasUsed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Gas Price</p>
                        <p className="text-white">{tx.gasPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">Time</p>
                        <p className="text-white">{formatTimeAgo(tx.timestamp)}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-600"
                        onClick={() => window.open(`${chainInfo?.explorerUrl}/tx/${tx.hash}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        View on Explorer
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chains" className="space-y-6">
          {/* Supported Chains */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chains.map((chain) => (
              <Card key={chain.id} className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="text-3xl">{chain.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{chain.name}</h3>
                    <p className="text-sm text-slate-400">{chain.symbol}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-slate-400">Explorer</p>
                    <p className="text-sm text-blue-400">{new URL(chain.explorerUrl).hostname}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">RPC Endpoint</p>
                    <p className="text-sm text-slate-300 truncate">{new URL(chain.rpcUrl).hostname}</p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-600"
                  onClick={() => window.open(chain.explorerUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-2" />
                  Open Explorer
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Total Transactions</p>
                  <p className="text-xl font-bold text-white">{transactions.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-emerald-400" />
                <div>
                  <p className="text-sm text-slate-400">Successful</p>
                  <p className="text-xl font-bold text-emerald-400">
                    {transactions.filter(tx => tx.status === 'success').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Chains Active</p>
                  <p className="text-xl font-bold text-white">
                    {new Set(transactions.map(tx => tx.chain)).size}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="flex items-center space-x-3">
                <Layers className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="text-sm text-slate-400">Last Activity</p>
                  <p className="text-xl font-bold text-white">
                    {transactions.length > 0 ? formatTimeAgo(Math.max(...transactions.map(tx => tx.timestamp))) : '-'}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Chain Distribution */}
          <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Transaction Distribution by Chain</h3>
            <div className="space-y-3">
              {chains.map((chain) => {
                const chainTxs = transactions.filter(tx => tx.chain === chain.id);
                const percentage = transactions.length > 0 ? (chainTxs.length / transactions.length) * 100 : 0;
                
                return (
                  <div key={chain.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{chain.icon}</span>
                      <span className="text-white">{chain.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-purple-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-slate-300 w-16 text-right">
                        {chainTxs.length} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
