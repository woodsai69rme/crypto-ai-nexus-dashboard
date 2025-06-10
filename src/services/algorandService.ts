
const ALGORAND_API_TOKEN = '98D9CE80660AD243893D56D9F125CD2D';
const ALGORAND_NODE_URL = 'https://mainnet-api.4160.nodely.io';
const ALGORAND_INDEXER_URL = 'https://mainnet-idx.4160.nodely.io';

export interface AlgorandAsset {
  id: number;
  name: string;
  symbol: string;
  total: number;
  decimals: number;
  creator: string;
  'unit-name': string;
  url?: string;
  'created-at-round': number;
  deleted?: boolean;
  'default-frozen': boolean;
  manager?: string;
  reserve?: string;
  freeze?: string;
  clawback?: string;
  'metadata-hash'?: string;
}

export interface AlgorandAccount {
  address: string;
  amount: number;
  'amount-without-pending-rewards': number;
  'min-balance': number;
  'pending-rewards': number;
  'reward-base': number;
  'rewards': number;
  'round': number;
  'status': string;
  'total-apps-opted-in': number;
  'total-assets-opted-in': number;
  'total-created-apps': number;
  'total-created-assets': number;
  assets?: Array<{
    'asset-id': number;
    amount: number;
    'is-frozen': boolean;
    'opted-in-at-round': number;
  }>;
  'apps-local-state'?: Array<any>;
  'created-apps'?: Array<any>;
  'created-assets'?: Array<any>;
}

export interface AlgorandTransaction {
  id: string;
  'confirmed-round': number;
  'round-time': number;
  sender: string;
  'tx-type': string;
  fee: number;
  'first-valid': number;
  'last-valid': number;
  note?: string;
  'genesis-hash': string;
  'genesis-id': string;
  'payment-transaction'?: {
    amount: number;
    receiver: string;
    'close-amount'?: number;
    'close-remainder-to'?: string;
  };
  'asset-transfer-transaction'?: {
    'asset-id': number;
    amount: number;
    receiver: string;
    sender: string;
    'close-amount'?: number;
    'close-to'?: string;
  };
  'application-transaction'?: {
    'application-id': number;
    'on-completion': string;
    'application-args'?: string[];
    accounts?: string[];
    'foreign-apps'?: number[];
    'foreign-assets'?: number[];
    'global-state-schema'?: any;
    'local-state-schema'?: any;
    'approval-program'?: string;
    'clear-state-program'?: string;
  };
  'asset-config-transaction'?: {
    'asset-id': number;
    params?: any;
  };
  'keyreg-transaction'?: {
    'vote-pk': string;
    'selection-pk': string;
    'vote-first': number;
    'vote-last': number;
    'vote-key-dilution': number;
  };
}

export interface AlgorandBlock {
  round: number;
  timestamp: number;
  'transactions-root': string;
  'transactions-root-sha256': string;
  'previous-block-hash': string;
  seed: string;
  'genesis-hash': string;
  'genesis-id': string;
  rewards?: any;
  'upgrade-state'?: any;
  'upgrade-vote'?: any;
  transactions?: AlgorandTransaction[];
}

export interface AlgorandAssetHolding {
  address: string;
  amount: number;
  'is-frozen': boolean;
  'opted-in-at-round': number;
  'asset-id': number;
}

class AlgorandService {
  private apiToken: string;
  private nodeUrl: string;
  private indexerUrl: string;

  constructor() {
    this.apiToken = ALGORAND_API_TOKEN;
    this.nodeUrl = ALGORAND_NODE_URL;
    this.indexerUrl = ALGORAND_INDEXER_URL;
  }

  private async makeRequest(url: string, options: RequestInit = {}): Promise<any> {
    const headers = {
      'X-Algo-api-token': this.apiToken,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`Making Algorand API request to: ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Algorand API Error (${response.status}):`, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Algorand API Response:', data);
      return data;
    } catch (error) {
      console.error('Algorand API request failed:', error);
      throw error;
    }
  }

  // Get node status
  async getStatus(): Promise<any> {
    const response = await this.makeRequest(`${this.nodeUrl}/v2/status`);
    return response;
  }

  // Get account information
  async getAccount(address: string): Promise<AlgorandAccount> {
    const response = await this.makeRequest(`${this.indexerUrl}/v2/accounts/${address}`);
    return response.account;
  }

  // Get account balance at specific round (time travel)
  async getAccountSnapshot(address: string, round: number, assetId: number = 0): Promise<any> {
    return this.makeRequest(`${this.indexerUrl}/x2/account/${address}/snapshot/${round}/${assetId}`);
  }

  // Get asset information
  async getAsset(assetId: number): Promise<AlgorandAsset> {
    const response = await this.makeRequest(`${this.indexerUrl}/v2/assets/${assetId}`);
    return response.asset;
  }

  // Search for assets
  async searchAssets(params: {
    name?: string;
    unit?: string;
    creator?: string;
    limit?: number;
    next?: string;
  } = {}): Promise<{ assets: AlgorandAsset[]; 'next-token'?: string }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`${this.indexerUrl}/v2/assets?${searchParams.toString()}`);
  }

  // Get transactions for an account
  async getAccountTransactions(
    address: string,
    params: {
      limit?: number;
      next?: string;
      'asset-id'?: number;
      'min-round'?: number;
      'max-round'?: number;
      'tx-type'?: string;
    } = {}
  ): Promise<{ transactions: AlgorandTransaction[]; 'next-token'?: string }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`${this.indexerUrl}/v2/accounts/${address}/transactions?${searchParams.toString()}`);
  }

  // Get transaction by ID
  async getTransaction(txId: string): Promise<AlgorandTransaction> {
    const response = await this.makeRequest(`${this.indexerUrl}/v2/transactions/${txId}`);
    return response.transaction;
  }

  // Get latest block
  async getLatestBlock(): Promise<AlgorandBlock> {
    const status = await this.getStatus();
    const response = await this.makeRequest(`${this.nodeUrl}/v2/blocks/${status['last-round']}`);
    return response;
  }

  // Get block by round
  async getBlock(round: number): Promise<AlgorandBlock> {
    const response = await this.makeRequest(`${this.nodeUrl}/v2/blocks/${round}`);
    return response;
  }

  // Get application information
  async getApplication(appId: number): Promise<any> {
    const response = await this.makeRequest(`${this.indexerUrl}/v2/applications/${appId}`);
    return response.application;
  }

  // Search applications
  async searchApplications(params: {
    'application-id'?: number;
    creator?: string;
    limit?: number;
    next?: string;
  } = {}): Promise<any> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`${this.indexerUrl}/v2/applications?${searchParams.toString()}`);
  }

  // Get asset holders
  async getAssetHolders(assetId: number, params: {
    limit?: number;
    next?: string;
  } = {}): Promise<{ balances: AlgorandAssetHolding[]; 'next-token'?: string }> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest(`${this.indexerUrl}/v2/assets/${assetId}/balances?${searchParams.toString()}`);
  }

  // Get health check
  async getHealth(): Promise<any> {
    return this.makeRequest(`${this.nodeUrl}/health`);
  }

  // Get network stats
  async getNetworkStats(): Promise<any> {
    try {
      const status = await this.getStatus();
      const latestBlock = await this.getLatestBlock();
      
      return {
        currentRound: status['last-round'],
        blockTime: latestBlock.timestamp,
        catchupTime: status['catchup-time'] || 0,
        timeSinceLastRound: status['time-since-last-round'] || 0,
        networkVersion: status['last-version'] || 'unknown',
        consensus: status['last-consensus-version'] || 'unknown'
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      return null;
    }
  }

  // Utility function to convert microAlgos to Algos
  microAlgosToAlgos(microAlgos: number): number {
    return microAlgos / 1000000;
  }

  // Utility function to convert Algos to microAlgos
  algosToMicroAlgos(algos: number): number {
    return Math.round(algos * 1000000);
  }

  // Format asset amount based on decimals
  formatAssetAmount(amount: number, decimals: number): number {
    return amount / Math.pow(10, decimals);
  }

  // Get popular Algorand DeFi tokens with real data
  async getPopularAssets(): Promise<AlgorandAsset[]> {
    try {
      // Popular Algorand assets by their IDs
      const popularAssetIds = [
        31566704,  // USDC
        386192725, // goBTC
        386195940, // goETH
        441139422, // CHIP
        312769,    // Tether USDt
        465865291, // STBL
        287867876, // USDt
        400593267, // PLANETS
        393495312, // Opulous (OPUL)
        226701642, // Yieldly (YLDY)
        137594422, // ARCC
        163650, // AKTA (Akita Inu)
        470842789, // DEFLY
        230946361, // GEMS
        281003266, // VOTE
      ];

      const assets = await Promise.all(
        popularAssetIds.map(async (id) => {
          try {
            return await this.getAsset(id);
          } catch (error) {
            console.error(`Error fetching asset ${id}:`, error);
            return null;
          }
        })
      );

      return assets.filter(asset => asset !== null) as AlgorandAsset[];
    } catch (error) {
      console.error('Error fetching popular assets:', error);
      return [];
    }
  }

  // Get trending assets based on recent activity
  async getTrendingAssets(limit: number = 10): Promise<AlgorandAsset[]> {
    try {
      // Search for recently created assets
      const recentAssets = await this.searchAssets({ limit });
      return recentAssets.assets.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending assets:', error);
      return [];
    }
  }

  // Get DeFi protocols and apps
  async getDeFiProtocols(): Promise<any[]> {
    try {
      // Popular DeFi app IDs on Algorand
      const defiAppIds = [
        465814278, // Tinyman AMM
        552635992, // Algofi
        465814065, // Yieldly
        609045633, // Folks Finance
        350338509, // AlgoFi Staking
        305162725, // CompositeSwap
        674526804, // Pact
        734439097, // Humble
        624956175, // ZeroSwap
        647801215, // WagmiSwap
      ];

      const protocols = await Promise.all(
        defiAppIds.map(async (appId) => {
          try {
            const app = await this.getApplication(appId);
            return {
              id: appId,
              name: `DeFi Protocol ${appId}`,
              ...app
            };
          } catch (error) {
            console.error(`Error fetching app ${appId}:`, error);
            return null;
          }
        })
      );

      return protocols.filter(protocol => protocol !== null);
    } catch (error) {
      console.error('Error fetching DeFi protocols:', error);
      return [];
    }
  }

  // Real-time price data simulation (in a real app, this would connect to price APIs)
  async getAssetPrice(assetId: number): Promise<{ price: number; change24h: number; volume24h: number } | null> {
    try {
      // Simulate price data - in production, integrate with price APIs
      const basePrice = Math.random() * 100 + 1;
      const change24h = (Math.random() - 0.5) * 20; // -10% to +10%
      const volume24h = Math.random() * 1000000;

      return {
        price: parseFloat(basePrice.toFixed(6)),
        change24h: parseFloat(change24h.toFixed(2)),
        volume24h: Math.floor(volume24h)
      };
    } catch (error) {
      console.error(`Error getting price for asset ${assetId}:`, error);
      return null;
    }
  }

  // Validate Algorand address
  isValidAddress(address: string): boolean {
    // Basic Algorand address validation
    return address.length === 58 && /^[A-Z2-7]+$/.test(address);
  }

  // Get account analytics
  async getAccountAnalytics(address: string): Promise<any> {
    try {
      const account = await this.getAccount(address);
      const transactions = await this.getAccountTransactions(address, { limit: 100 });
      
      const totalTransactions = transactions.transactions.length;
      const recentTransactions = transactions.transactions.filter(tx => 
        Date.now() - (tx['round-time'] * 1000) < 7 * 24 * 60 * 60 * 1000 // Last 7 days
      );

      return {
        totalBalance: account.amount,
        totalAssets: account.assets?.length || 0,
        totalTransactions,
        recentActivity: recentTransactions.length,
        accountAge: account.round ? Date.now() - (account.round * 4.5 * 1000) : 0, // Approximate
        diversificationScore: (account.assets?.length || 0) * 10, // Simple score
      };
    } catch (error) {
      console.error('Error getting account analytics:', error);
      return null;
    }
  }
}

export const algorandService = new AlgorandService();
