interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: Date;
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
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: Date;
}

type MarketDataCallback = (data: MarketData[]) => void;
type ChartDataCallback = (data: CandlestickData[]) => void;
type OrderBookCallback = (data: OrderBook) => void;

class MarketDataService {
  private marketData: Map<string, MarketData> = new Map();
  private chartData: Map<string, CandlestickData[]> = new Map();
  private orderBooks: Map<string, OrderBook> = new Map();
  private marketDataCallbacks: MarketDataCallback[] = [];
  private chartDataCallbacks: Map<string, ChartDataCallback[]> = new Map();
  private orderBookCallbacks: Map<string, OrderBookCallback[]> = new Map();
  private updateInterval: NodeJS.Timeout | null = null;
  private isRealTimeActive = false;
  private lastApiCall = 0;
  private API_RATE_LIMIT = 10000; // 10 seconds between API calls

  async getMarketData(symbols?: string[]): Promise<MarketData[]> {
    const targetSymbols = symbols || ['BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD'];
    
    // Check rate limiting
    const now = Date.now();
    if (now - this.lastApiCall < this.API_RATE_LIMIT) {
      // Return cached data if available
      const cachedData = targetSymbols.map(symbol => this.marketData.get(symbol)).filter(Boolean) as MarketData[];
      if (cachedData.length > 0) {
        console.log('Using cached market data due to rate limiting');
        return cachedData;
      }
    }

    try {
      // Map symbols to CoinGecko IDs
      const coinGeckoIds: Record<string, string> = {
        'BTC-AUD': 'bitcoin',
        'ETH-AUD': 'ethereum',
        'SOL-AUD': 'solana',
        'ADA-AUD': 'cardano',
        'DOT-AUD': 'polkadot'
      };

      const ids = targetSymbols.map(symbol => coinGeckoIds[symbol]).filter(Boolean);
      
      if (ids.length > 0) {
        console.log('Fetching real market data from CoinGecko for:', ids);
        
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=aud&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
          { 
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        this.lastApiCall = now;

        if (response.ok) {
          const data = await response.json();
          const marketDataArray: MarketData[] = [];

          Object.entries(coinGeckoIds).forEach(([symbol, coinId]) => {
            if (data[coinId] && targetSymbols.includes(symbol)) {
              const coinData = data[coinId];
              const marketItem: MarketData = {
                symbol,
                name: symbol.split('-')[0],
                price: coinData.aud || 0,
                change24h: (coinData.aud || 0) * (coinData.aud_24h_change || 0) / 100,
                changePercent24h: coinData.aud_24h_change || 0,
                volume24h: coinData.aud_24h_vol || 0,
                marketCap: coinData.aud_market_cap || 0,
                high24h: (coinData.aud || 0) * 1.05,
                low24h: (coinData.aud || 0) * 0.95,
                lastUpdated: new Date()
              };
              
              this.marketData.set(symbol, marketItem);
              marketDataArray.push(marketItem);
              console.log(`Updated real data for ${symbol}: $${coinData.aud}`);
            }
          });

          if (marketDataArray.length > 0) {
            console.log('Successfully fetched real market data for', marketDataArray.length, 'symbols');
            return marketDataArray;
          }
        } else {
          console.warn('CoinGecko API response not ok:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real market data, using mock data:', error);
    }

    // Fallback to mock data with realistic simulation
    console.log('Generating realistic mock data for:', targetSymbols);
    return this.generateRealisticMockData(targetSymbols);
  }

  private generateRealisticMockData(symbols: string[]): MarketData[] {
    const mockData: MarketData[] = symbols.map(symbol => {
      const existingData = this.marketData.get(symbol);
      const basePrice = existingData?.price || this.getBasePriceForSymbol(symbol);
      
      // More realistic price movements (smaller volatility)
      const volatility = this.getVolatilityForSymbol(symbol);
      const change = (Math.random() - 0.5) * volatility * 2;
      const price = Math.max(basePrice * (1 + change), 0.01);

      const marketItem: MarketData = {
        symbol,
        name: symbol.split('-')[0],
        price,
        change24h: change * basePrice,
        changePercent24h: change * 100,
        volume24h: this.generateRealisticVolume(symbol),
        marketCap: price * this.getCirculatingSupply(symbol),
        high24h: price * (1 + Math.random() * 0.03),
        low24h: price * (1 - Math.random() * 0.03),
        lastUpdated: new Date()
      };

      this.marketData.set(symbol, marketItem);
      return marketItem;
    });

    return mockData;
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      'BTC-AUD': 168000,
      'ETH-AUD': 4290,
      'SOL-AUD': 255,
      'ADA-AUD': 1.11,
      'DOT-AUD': 6.62
    };
    return basePrices[symbol] || 100;
  }

  private getVolatilityForSymbol(symbol: string): number {
    const volatilities: Record<string, number> = {
      'BTC-AUD': 0.02,   // 2% volatility
      'ETH-AUD': 0.025,  // 2.5% volatility
      'SOL-AUD': 0.04,   // 4% volatility
      'ADA-AUD': 0.05,   // 5% volatility
      'DOT-AUD': 0.045   // 4.5% volatility
    };
    return volatilities[symbol] || 0.03;
  }

  private generateRealisticVolume(symbol: string): number {
    const baseVolumes: Record<string, number> = {
      'BTC-AUD': 50000000000,   // 50B
      'ETH-AUD': 30000000000,   // 30B
      'SOL-AUD': 5000000000,    // 5B
      'ADA-AUD': 1000000000,    // 1B
      'DOT-AUD': 500000000      // 500M
    };
    const baseVolume = baseVolumes[symbol] || 100000000;
    return baseVolume * (0.8 + Math.random() * 0.4); // ±20% variation
  }

  private getCirculatingSupply(symbol: string): number {
    const supplies: Record<string, number> = {
      'BTC-AUD': 19800000,
      'ETH-AUD': 120000000,
      'SOL-AUD': 470000000,
      'ADA-AUD': 35000000000,
      'DOT-AUD': 1400000000
    };
    return supplies[symbol] || 1000000;
  }

  subscribeToMarketData(callback: MarketDataCallback): () => void {
    this.marketDataCallbacks.push(callback);
    
    // Send initial data
    const currentData = Array.from(this.marketData.values());
    if (currentData.length > 0) {
      callback(currentData);
    } else {
      // Load initial data if none exists
      this.getMarketData().then(data => callback(data));
    }

    return () => {
      const index = this.marketDataCallbacks.indexOf(callback);
      if (index > -1) {
        this.marketDataCallbacks.splice(index, 1);
      }
    };
  }

  subscribeToChartData(symbol: string, callback: ChartDataCallback): () => void {
    if (!this.chartDataCallbacks.has(symbol)) {
      this.chartDataCallbacks.set(symbol, []);
    }
    
    this.chartDataCallbacks.get(symbol)!.push(callback);
    
    // Generate and send initial chart data
    const chartData = this.generateMockChartData(symbol);
    this.chartData.set(symbol, chartData);
    callback(chartData);

    return () => {
      const callbacks = this.chartDataCallbacks.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  subscribeToOrderBook(symbol: string, callback: OrderBookCallback): () => void {
    if (!this.orderBookCallbacks.has(symbol)) {
      this.orderBookCallbacks.set(symbol, []);
    }
    
    this.orderBookCallbacks.get(symbol)!.push(callback);
    
    // Generate and send initial order book data
    const orderBook = this.generateMockOrderBook(symbol);
    this.orderBooks.set(symbol, orderBook);
    callback(orderBook);

    return () => {
      const callbacks = this.orderBookCallbacks.get(symbol);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private generateMockChartData(symbol: string): CandlestickData[] {
    const data: CandlestickData[] = [];
    const basePrice = this.marketData.get(symbol)?.price || this.getBasePriceForSymbol(symbol);
    let currentPrice = basePrice;
    const now = Date.now();

    for (let i = 50; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000); // hourly data
      const open = currentPrice;
      const volatility = this.getVolatilityForSymbol(symbol);
      const change = (Math.random() - 0.5) * volatility;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = this.generateRealisticVolume(symbol) / 24; // Hourly volume

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      });

      currentPrice = close;
    }

    return data;
  }

  private generateMockOrderBook(symbol: string): OrderBook {
    const basePrice = this.marketData.get(symbol)?.price || this.getBasePriceForSymbol(symbol);
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate more realistic order book with smaller spreads
    for (let i = 0; i < 15; i++) {
      const bidPrice = basePrice * (1 - (i + 1) * 0.0005); // 0.05% increments
      const askPrice = basePrice * (1 + (i + 1) * 0.0005);
      const bidQuantity = Math.random() * 10 + 0.1;
      const askQuantity = Math.random() * 10 + 0.1;
      
      bids.push({
        price: bidPrice,
        quantity: bidQuantity,
        total: bidPrice * bidQuantity
      });

      asks.push({
        price: askPrice,
        quantity: askQuantity,
        total: askPrice * askQuantity
      });
    }

    return {
      symbol,
      bids,
      asks,
      lastUpdated: new Date()
    };
  }

  formatPrice(price: number): string {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else {
      return `$${price.toFixed(6)}`;
    }
  }

  formatChange(change: number, isPercent: boolean = false): string {
    const value = isPercent ? change : change;
    const symbol = isPercent ? '%' : '';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}${symbol}`;
  }

  formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  }

  startRealTimeUpdates(): void {
    if (this.isRealTimeActive) return;
    
    console.log('Starting real-time market data updates');
    this.isRealTimeActive = true;
    
    // Update every 30 seconds, but respect rate limiting
    this.updateInterval = setInterval(() => {
      this.updateMarketData();
    }, 30000);
  }

  private async updateMarketData(): Promise<void> {
    try {
      const symbols = Array.from(this.marketData.keys());
      if (symbols.length === 0) {
        symbols.push('BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD');
      }
      
      console.log('Updating market data for symbols:', symbols);
      const updatedData = await this.getMarketData(symbols);
      
      // Notify all market data subscribers
      this.marketDataCallbacks.forEach(callback => {
        callback(updatedData);
      });

      // Update chart data for subscribed symbols
      for (const [symbol, callbacks] of this.chartDataCallbacks.entries()) {
        if (callbacks.length > 0) {
          const chartData = this.generateMockChartData(symbol);
          this.chartData.set(symbol, chartData);
          callbacks.forEach(callback => callback(chartData));
        }
      }

      // Update order books for subscribed symbols
      for (const [symbol, callbacks] of this.orderBookCallbacks.entries()) {
        if (callbacks.length > 0) {
          const orderBook = this.generateMockOrderBook(symbol);
          this.orderBooks.set(symbol, orderBook);
          callbacks.forEach(callback => callback(orderBook));
        }
      }
    } catch (error) {
      console.error('Error updating market data:', error);
    }
  }

  cleanup(): void {
    console.log('Cleaning up market data service');
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isRealTimeActive = false;
    this.marketDataCallbacks.length = 0;
    this.chartDataCallbacks.clear();
    this.orderBookCallbacks.clear();
  }

  // Helper method to get current market data without API call
  getCurrentMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }

  // Method to force refresh data (useful for debugging)
  async forceRefresh(): Promise<MarketData[]> {
    this.lastApiCall = 0; // Reset rate limiting
    const symbols = Array.from(this.marketData.keys());
    return this.getMarketData(symbols.length > 0 ? symbols : undefined);
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandlestickData, OrderBook };
