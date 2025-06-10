
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Wallet, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { algorandService, AlgorandAccount, AlgorandAsset, AlgorandTransaction } from '@/services/algorandService';

export const AlgorandPortfolio = () => {
  const { toast } = useToast();
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState<AlgorandAccount | null>(null);
  const [assets, setAssets] = useState<AlgorandAsset[]>([]);
  const [transactions, setTransactions] = useState<AlgorandTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularAssets, setPopularAssets] = useState<AlgorandAsset[]>([]);

  useEffect(() => {
    loadPopularAssets();
  }, []);

  const loadPopularAssets = async () => {
    try {
      const popular = await algorandService.getPopularAssets();
      setPopularAssets(popular);
    } catch (error) {
      console.error('Error loading popular assets:', error);
    }
  };

  const loadAccountData = async () => {
    if (!address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Algorand address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get account information
      const accountData = await algorandService.getAccount(address);
      setAccount(accountData.account);

      // Load asset information for each asset the account holds
      if (accountData.account.assets) {
        const assetPromises = accountData.account.assets.map(async (asset) => {
          try {
            return await algorandService.getAsset(asset['asset-id']);
          } catch (error) {
            console.error(`Error fetching asset ${asset['asset-id']}:`, error);
            return null;
          }
        });

        const assetData = await Promise.all(assetPromises);
        setAssets(assetData.filter(asset => asset !== null) as AlgorandAsset[]);
      }

      // Get recent transactions
      const txData = await algorandService.getAccountTransactions(address, { limit: 20 });
      setTransactions(txData.transactions);

      toast({
        title: "Success",
        description: "Account data loaded successfully",
      });
    } catch (error) {
      console.error('Error loading account:', error);
      toast({
        title: "Error",
        description: "Failed to load account data. Please check the address.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAlgoAmount = (microAlgos: number) => {
    return algorandService.microAlgosToAlgos(microAlgos).toFixed(6);
  };

  const formatAssetAmount = (amount: number, decimals: number) => {
    return algorandService.formatAssetAmount(amount, decimals).toFixed(decimals > 6 ? 6 : decimals);
  };

  const getTransactionType = (tx: AlgorandTransaction) => {
    if (tx['payment-transaction']) return 'Payment';
    if (tx['asset-transfer-transaction']) return 'Asset Transfer';
    return tx['tx-type'] || 'Unknown';
  };

  const getTransactionAmount = (tx: AlgorandTransaction) => {
    if (tx['payment-transaction']) {
      return `${formatAlgoAmount(tx['payment-transaction'].amount)} ALGO`;
    }
    if (tx['asset-transfer-transaction']) {
      const asset = assets.find(a => a.id === tx['asset-transfer-transaction']!['asset-id']);
      const amount = tx['asset-transfer-transaction']!.amount;
      if (asset) {
        return `${formatAssetAmount(amount, asset.decimals)} ${asset['unit-name'] || asset.name}`;
      }
      return `${amount} (Asset ${tx['asset-transfer-transaction']!['asset-id']})`;
    }
    return '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Algorand Portfolio</h2>
        </div>
        <Badge variant="outline" className="border-blue-500/30 text-blue-400">
          Powered by Algorand
        </Badge>
      </div>

      {/* Address Input */}
      <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Enter Algorand address (e.g., AAAA...)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-slate-700/50 border-slate-600"
            />
          </div>
          <Button
            onClick={loadAccountData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? 'Loading...' : 'Search'}
          </Button>
        </div>
      </Card>

      {account && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Account Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3">
                  <Wallet className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-slate-400">ALGO Balance</p>
                    <p className="text-xl font-bold text-white">{formatAlgoAmount(account.amount)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm text-slate-400">Rewards</p>
                    <p className="text-xl font-bold text-emerald-400">{formatAlgoAmount(account.rewards)}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3">
                  <TrendingDown className="h-5 w-5 text-orange-400" />
                  <div>
                    <p className="text-sm text-slate-400">Min Balance</p>
                    <p className="text-xl font-bold text-orange-400">{formatAlgoAmount(account['min-balance'])}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <div className="flex items-center space-x-3">
                  <Badge className="h-5 w-5 bg-purple-500" />
                  <div>
                    <p className="text-sm text-slate-400">Assets Held</p>
                    <p className="text-xl font-bold text-white">{account.assets?.length || 0}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Account Details */}
            <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <h3 className="text-lg font-bold text-white mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-white font-mono text-sm">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                    {account.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Round:</span>
                  <span className="text-white">{account.round}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pending Rewards:</span>
                  <span className="text-emerald-400">{formatAlgoAmount(account['pending-rewards'])}</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Asset Holdings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr className="text-left">
                      <th className="p-4 text-sm font-medium text-slate-300">Asset</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Balance</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Asset ID</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.assets?.map((accountAsset, index) => {
                      const assetInfo = assets.find(a => a.id === accountAsset['asset-id']);
                      return (
                        <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="p-4">
                            <div>
                              <div className="font-medium text-white">
                                {assetInfo?.['unit-name'] || assetInfo?.name || `Asset ${accountAsset['asset-id']}`}
                              </div>
                              {assetInfo?.name && assetInfo?.name !== assetInfo?.['unit-name'] && (
                                <div className="text-sm text-slate-400">{assetInfo.name}</div>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-white">
                            {assetInfo 
                              ? formatAssetAmount(accountAsset.amount, assetInfo.decimals)
                              : accountAsset.amount
                            }
                          </td>
                          <td className="p-4 text-slate-300">{accountAsset['asset-id']}</td>
                          <td className="p-4">
                            <Badge variant="outline" className={
                              accountAsset['is-frozen'] 
                                ? 'border-red-500/30 text-red-400' 
                                : 'border-emerald-500/30 text-emerald-400'
                            }>
                              {accountAsset['is-frozen'] ? 'Frozen' : 'Active'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-700/30">
                    <tr className="text-left">
                      <th className="p-4 text-sm font-medium text-slate-300">Type</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Amount</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Round</th>
                      <th className="p-4 text-sm font-medium text-slate-300">Time</th>
                      <th className="p-4 text-sm font-medium text-slate-300">TX ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx, index) => (
                      <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td className="p-4">
                          <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                            {getTransactionType(tx)}
                          </Badge>
                        </td>
                        <td className="p-4 text-white">{getTransactionAmount(tx)}</td>
                        <td className="p-4 text-slate-300">{tx['confirmed-round']}</td>
                        <td className="p-4 text-slate-300">
                          {new Date(tx['round-time'] * 1000).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-300 font-mono text-xs">
                              {tx.id.slice(0, 8)}...
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`https://algoexplorer.io/tx/${tx.id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Popular Assets */}
      {!account && popularAssets.length > 0 && (
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Popular Algorand Assets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularAssets.map((asset) => (
              <div key={asset.id} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{asset['unit-name'] || asset.name}</span>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                    ID: {asset.id}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400">{asset.name}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Total Supply: {formatAssetAmount(asset.total, asset.decimals)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
