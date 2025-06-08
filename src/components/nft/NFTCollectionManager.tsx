
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image, TrendingUp, TrendingDown, Plus, Star, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NFTCollection {
  id: string;
  name: string;
  contract_address: string;
  blockchain: string;
  floor_price: number;
  total_supply: number;
  metadata: any;
  created_at: string;
}

interface NFTItem {
  id: string;
  collection_id: string;
  token_id: string;
  name: string;
  image_url: string;
  traits: any;
  rarity_rank: number;
  last_sale_price: number;
  current_price: number;
  owned: boolean;
}

export const NFTCollectionManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [nftItems, setNftItems] = useState<NFTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>('');

  // Form state
  const [newCollection, setNewCollection] = useState({
    name: '',
    contract_address: '',
    blockchain: 'ethereum'
  });

  useEffect(() => {
    if (!user) return;
    fetchCollections();
  }, [user]);

  useEffect(() => {
    if (selectedCollection) {
      fetchNFTItems(selectedCollection);
    }
  }, [selectedCollection]);

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('nft_collections')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCollections(data || []);
      
      if (data && data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNFTItems = async (collectionId: string) => {
    try {
      const { data, error } = await supabase
        .from('nft_items')
        .select('*')
        .eq('collection_id', collectionId)
        .order('rarity_rank', { ascending: true });

      if (error) throw error;
      setNftItems(data || []);
    } catch (error) {
      console.error('Error fetching NFT items:', error);
    }
  };

  const addCollection = async () => {
    if (!newCollection.name || !newCollection.contract_address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('nft_collections')
        .insert({
          user_id: user?.id,
          name: newCollection.name,
          contract_address: newCollection.contract_address,
          blockchain: newCollection.blockchain,
          floor_price: 0,
          total_supply: 0,
          metadata: {}
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Collection Added",
        description: `${newCollection.name} has been added to your portfolio`,
      });

      setNewCollection({ name: '', contract_address: '', blockchain: 'ethereum' });
      setShowAddForm(false);
      fetchCollections();
    } catch (error) {
      console.error('Error adding collection:', error);
      toast({
        title: "Error",
        description: "Failed to add collection",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getRarityColor = (rank: number, total: number) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 1) return 'text-purple-400';
    if (percentile <= 5) return 'text-yellow-400';
    if (percentile <= 10) return 'text-emerald-400';
    if (percentile <= 25) return 'text-blue-400';
    return 'text-slate-400';
  };

  const getRarityLabel = (rank: number, total: number) => {
    const percentile = (rank / total) * 100;
    if (percentile <= 1) return 'Legendary';
    if (percentile <= 5) return 'Epic';
    if (percentile <= 10) return 'Rare';
    if (percentile <= 25) return 'Uncommon';
    return 'Common';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 bg-slate-800/50 animate-pulse">
            <div className="h-4 bg-slate-700 rounded mb-2"></div>
            <div className="h-6 bg-slate-700 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Image className="h-6 w-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">NFT Collection Manager</h2>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Collection
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-6 bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Add NFT Collection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Collection Name
              </label>
              <Input
                value={newCollection.name}
                onChange={(e) => setNewCollection({...newCollection, name: e.target.value})}
                placeholder="e.g., Bored Ape Yacht Club"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contract Address
              </label>
              <Input
                value={newCollection.contract_address}
                onChange={(e) => setNewCollection({...newCollection, contract_address: e.target.value})}
                placeholder="0x..."
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={addCollection}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Add Collection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {collections.length === 0 ? (
        <Card className="p-8 bg-slate-800/50 text-center">
          <Image className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Collections</h3>
          <p className="text-slate-400">Add your first NFT collection to start tracking floor prices and rarity</p>
        </Card>
      ) : (
        <Tabs value={selectedCollection} onValueChange={setSelectedCollection}>
          <TabsList className="bg-slate-800/50 border border-slate-700">
            {collections.map((collection) => (
              <TabsTrigger key={collection.id} value={collection.id}>
                {collection.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {collections.map((collection) => (
            <TabsContent key={collection.id} value={collection.id} className="space-y-6">
              {/* Collection Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 text-emerald-400" />
                    <div>
                      <p className="text-sm text-slate-400">Floor Price</p>
                      <p className="text-xl font-bold text-white">
                        {formatCurrency(collection.floor_price || 0)}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Image className="h-6 w-6 text-blue-400" />
                    <div>
                      <p className="text-sm text-slate-400">Total Supply</p>
                      <p className="text-xl font-bold text-white">
                        {collection.total_supply?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <div className="flex items-center space-x-3">
                    <Star className="h-6 w-6 text-yellow-400" />
                    <div>
                      <p className="text-sm text-slate-400">Owned Items</p>
                      <p className="text-xl font-bold text-white">
                        {nftItems.filter(item => item.owned).length}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* NFT Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {nftItems.slice(0, 12).map((item) => (
                  <Card key={item.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700 overflow-hidden">
                    <div className="aspect-square bg-slate-700/50 flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white truncate">{item.name || `#${item.token_id}`}</h4>
                        {item.owned && (
                          <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                            Owned
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Rank</span>
                          <span className={`font-medium ${getRarityColor(item.rarity_rank, collection.total_supply || 10000)}`}>
                            #{item.rarity_rank}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Rarity</span>
                          <Badge variant="outline" className={`${getRarityColor(item.rarity_rank, collection.total_supply || 10000)} border-current/30`}>
                            {getRarityLabel(item.rarity_rank, collection.total_supply || 10000)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Price</span>
                          <span className="font-medium text-white">
                            {formatCurrency(item.current_price || 0)}
                          </span>
                        </div>

                        {item.last_sale_price && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">Last Sale</span>
                            <div className="flex items-center space-x-1">
                              {item.current_price > item.last_sale_price ? (
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                              )}
                              <span className="text-xs text-slate-500">
                                {formatCurrency(item.last_sale_price)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {nftItems.length === 0 && (
                <Card className="p-8 bg-slate-800/50 text-center">
                  <Image className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No NFTs Found</h3>
                  <p className="text-slate-400">This collection doesn't have any tracked NFTs yet</p>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};
