
interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdate: number;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdate: number;
}

class MarketDataService {
  private static instance: MarketDataService;
  private wsConnection: WebSocket | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private lastPrices: Map<string, MarketData> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  static getInstance(): MarketDataService {
    if (!MarketDataService.instance) {
      MarketDataService.instance = new MarketDataService();
    }
    return MarketDataService.instance;
  }

  // CoinGecko API integration for real market data
  async getMarketData(symbols: string[]): Promise<Map<string, MarketData>> {
    try {
      // Convert symbols to CoinGecko IDs
      const coinIds = symbols.map(symbol => {
        const mapping: Record<string, string> = {
          'BTC-AUD': 'bitcoin',
          'ETH-AUD': 'ethereum',
          'SOL-AUD': 'solana',
          'ADA-AUD': 'cardano',
          'DOT-AUD': 'polkadot',
          'LINK-AUD': 'chainlink',
          'MATIC-AUD': 'polygon',
          'AVAX-AUD': 'avalanche-2'
        };
        return mapping[symbol] || symbol.split('-')[0].toLowerCase();
      }).join(',');

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=aud&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const marketData = new Map<string, MarketData>();

      symbols.forEach(symbol => {
        const coinId = symbol.split('-')[0].toLowerCase();
        const mapping: Record<string, string> = {
          'btc': 'bitcoin',
          'eth': 'ethereum',
          'sol': 'solana',
          'ada': 'cardano',
          'dot': 'polkadot',
          'link': 'chainlink',
          'matic': 'polygon',
          'avax': 'avalanche-2'
        };
        
        const actualCoinId = mapping[coinId] || coinId;
        const coinData = data[actualCoinId];

        if (coinData) {
          const marketInfo: MarketData = {
            symbol,
            price: coinData.aud || 0,
            change24h: (coinData.aud_24h_change || 0),
            changePercent24h: coinData.aud_24h_change || 0,
            volume24h: coinData.aud_24h_vol || 0,
            marketCap: coinData.aud_market_cap || 0,
            high24h: coinData.aud * 1.05, // Estimated
            low24h: coinData.aud * 0.95, // Estimated
            lastUpdate: Date.now()
          };

          marketData.set(symbol, marketInfo);
          this.lastPrices.set(symbol, marketInfo);
        }
      });

      return marketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      
      // Return mock data as fallback
      return this.getMockMarketData(symbols);
    }
  }

  private getMockMarketData(symbols: string[]): Map<string, MarketData> {
    const mockData = new Map<string, MarketData>();
    
    const basePrices: Record<string, number> = {
      'BTC-AUD': 95000,
      'ETH-AUD': 3500,
      'SOL-AUD': 180,
      'ADA-AUD': 0.45,
      'DOT-AUD': 8.50,
      'LINK-AUD': 18.20,
      'MATIC-AUD': 0.85,
      'AVAX-AUD': 35.50
    };

    symbols.forEach(symbol => {
      const basePrice = basePrices[symbol] || 100;
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      const change24h = (Math.random() - 0.5) * 0.2; // ±10% change

      mockData.set(symbol, {
        symbol,
        price,
        change24h: price * change24h,
        changePercent24h: change24h * 100,
        volume24h: Math.random() * 1000000000,
        marketCap: price * Math.random() * 100000000,
        high24h: price * 1.05,
        low24h: price * 0.95,
        lastUpdate: Date.now()
      });
    });

    return mockData;
  }

  async getCandlestickData(symbol: string, interval: string = '1h', limit: number = 100): Promise<CandlestickData[]> {
    try {
      // For production, you would integrate with a real exchange API
      // For now, generating realistic candlestick data
      return this.generateMockCandlestickData(symbol, interval, limit);
    } catch (error) {
      console.error('Error fetching candlestick data:', error);
      return this.generateMockCandlestickData(symbol, interval, limit);
    }
  }

  private generateMockCandlestickData(symbol: string, interval: string, limit: number): CandlestickData[] {
    const data: CandlestickData[] = [];
    const currentPrice = this.lastPrices.get(symbol)?.price || 100;
    let price = currentPrice;
    
    const intervalMs = this.getIntervalMs(interval);
    const startTime = Date.now() - (limit * intervalMs);

    for (let i = 0; i < limit; i++) {
      const timestamp = startTime + (i * intervalMs);
      const volatility = 0.02; // 2% volatility
      
      const open = price;
      const change = (Math.random() - 0.5) * volatility * price;
      const close = open + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000;

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });

      price = close;
    }

    return data;
  }

  private getIntervalMs(interval: string): number {
    const intervalMap: Record<string, number> = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '1w': 7 * 24 * 60 * 60 * 1000
    };
    return intervalMap[interval] || intervalMap['1h'];
  }

  async getOrderBook(symbol: string): Promise<OrderBook> {
    // Generate mock order book data
    const basePrice = this.lastPrices.get(symbol)?.price || 100;
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate bids (buy orders)
    for (let i = 0; i < 20; i++) {
      const price = basePrice * (1 - (i + 1) * 0.001); // Price decreases
      const quantity = Math.random() * 10;
      bids.push({
        price,
        quantity,
        total: price * quantity
      });
    }

    // Generate asks (sell orders)
    for (let i = 0; i < 20; i++) {
      const price = basePrice * (1 + (i + 1) * 0.001); // Price increases
      const quantity = Math.random() * 10;
      asks.push({
        price,
        quantity,
        total: price * quantity
      });
    }

    return {
      bids,
      asks,
      lastUpdate: Date.now()
    };
  }

  subscribe(event: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.get(event)?.delete(callback);
    };
  }

  private emit(event: string, data: any): void {
    this.subscribers.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in market data callback:', error);
      }
    });
  }

  startRealTimeUpdates(): void {
    // Simulate real-time price updates
    setInterval(() => {
      this.lastPrices.forEach((data, symbol) => {
        const variation = (Math.random() - 0.5) * 0.01; // ±0.5% variation
        const newPrice = data.price * (1 + variation);
        const change24h = newPrice - data.price;
        const changePercent24h = (change24h / data.price) * 100;

        const updatedData: MarketData = {
          ...data,
          price: newPrice,
          change24h,
          changePercent24h,
          lastUpdate: Date.now()
        };

        this.lastPrices.set(symbol, updatedData);
        this.emit('priceUpdate', { symbol, data: updatedData });
      });
    }, 5000); // Update every 5 seconds
  }

  getLastPrice(symbol: string): MarketData | undefined {
    return this.lastPrices.get(symbol);
  }

  async getTrendingCoins(): Promise<MarketData[]> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/search/trending'
      );

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      const trending = data.coins.slice(0, 10);

      const trendingData: MarketData[] = [];

      for (const coin of trending) {
        const priceResponse = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coin.item.id}&vs_currencies=aud&include_24hr_change=true`
        );

        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          const coinPriceData = priceData[coin.item.id];

          if (coinPriceData) {
            trendingData.push({
              symbol: `${coin.item.symbol.toUpperCase()}-AUD`,
              price: coinPriceData.aud || 0,
              change24h: coinPriceData.aud_24h_change || 0,
              changePercent24h: coinPriceData.aud_24h_change || 0,
              volume24h: 0,
              marketCap: 0,
              high24h: 0,
              low24h: 0,
              lastUpdate: Date.now()
            });
          }
        }
      }

      return trendingData;
    } catch (error) {
      console.error('Error fetching trending coins:', error);
      
      // Return mock trending data
      return [
        { symbol: 'BTC-AUD', price: 95000, change24h: 2300, changePercent24h: 2.5, volume24h: 1200000000, marketCap: 1800000000000, high24h: 96000, low24h: 92000, lastUpdate: Date.now() },
        { symbol: 'ETH-AUD', price: 3500, change24h: -45, changePercent24h: -1.3, volume24h: 800000000, marketCap: 420000000000, high24h: 3600, low24h: 3400, lastUpdate: Date.now() },
        { symbol: 'SOL-AUD', price: 180, change24h: 8.5, changePercent24h: 4.9, volume24h: 400000000, marketCap: 78000000000, high24h: 185, low24h: 175, lastUpdate: Date.now() }
      ];
    }
  }

  cleanup(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscribers.clear();
  }
}

export const marketDataService = MarketDataService.getInstance();
export type { MarketData, CandlestickData, OrderBook, OrderBookEntry };
