
import { useToast } from '@/hooks/use-toast';

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
  assets?: Array<{
    'asset-id': number;
    amount: number;
    'is-frozen': boolean;
  }>;
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
  };
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
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Algorand API request failed:', error);
      throw error;
    }
  }

  // Get node status
  async getStatus(): Promise<any> {
    return this.makeRequest(`${this.nodeUrl}/v2/status`);
  }

  // Get account information
  async getAccount(address: string): Promise<AlgorandAccount> {
    return this.makeRequest(`${this.indexerUrl}/v2/accounts/${address}`);
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
  async getLatestBlock(): Promise<any> {
    const status = await this.getStatus();
    return this.makeRequest(`${this.nodeUrl}/v2/blocks/${status['last-round']}`);
  }

  // Get application information
  async getApplication(appId: number): Promise<any> {
    return this.makeRequest(`${this.indexerUrl}/v2/applications/${appId}`);
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

  // Get popular Algorand DeFi tokens
  async getPopularAssets(): Promise<AlgorandAsset[]> {
    try {
      // Get some popular Algorand assets by their IDs
      const popularAssetIds = [
        31566704, // USDC
        386192725, // goBTC
        386195940, // goETH
        441139422, // CHIP
        312769, // Tether USDt
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
}

export const algorandService = new AlgorandService();
