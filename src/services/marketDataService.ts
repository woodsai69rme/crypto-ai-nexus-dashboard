
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

  async getMarketData(symbols?: string[]): Promise<MarketData[]> {
    const targetSymbols = symbols || ['BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD'];
    
    try {
      // Try to fetch real data from CoinGecko
      const coinGeckoIds = {
        'BTC-AUD': 'bitcoin',
        'ETH-AUD': 'ethereum',
        'SOL-AUD': 'solana',
        'ADA-AUD': 'cardano',
        'DOT-AUD': 'polkadot'
      };

      const ids = targetSymbols.map(symbol => coinGeckoIds[symbol as keyof typeof coinGeckoIds]).filter(Boolean);
      
      if (ids.length > 0) {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=aud&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
        );

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
                change24h: coinData.aud_24h_change || 0,
                changePercent24h: coinData.aud_24h_change || 0,
                volume24h: coinData.aud_24h_vol || 0,
                marketCap: coinData.aud_market_cap || 0,
                high24h: coinData.aud * 1.05,
                low24h: coinData.aud * 0.95,
                lastUpdated: new Date()
              };
              
              this.marketData.set(symbol, marketItem);
              marketDataArray.push(marketItem);
            }
          });

          if (marketDataArray.length > 0) {
            return marketDataArray;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to fetch real market data, using mock data:', error);
    }

    // Fallback to mock data
    return this.generateMockMarketData(targetSymbols);
  }

  private generateMockMarketData(symbols: string[]): MarketData[] {
    const mockData: MarketData[] = symbols.map(symbol => {
      const basePrice = this.getBasePriceForSymbol(symbol);
      const change = (Math.random() - 0.5) * 0.1;
      const price = basePrice * (1 + change);

      return {
        symbol,
        name: symbol.split('-')[0],
        price,
        change24h: change * basePrice,
        changePercent24h: change * 100,
        volume24h: Math.random() * 1000000000,
        marketCap: price * Math.random() * 1000000000,
        high24h: price * 1.05,
        low24h: price * 0.95,
        lastUpdated: new Date()
      };
    });

    mockData.forEach(data => {
      this.marketData.set(data.symbol, data);
    });

    return mockData;
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: Record<string, number> = {
      'BTC-AUD': 65000,
      'ETH-AUD': 4200,
      'SOL-AUD': 180,
      'ADA-AUD': 1.2,
      'DOT-AUD': 25
    };
    return basePrices[symbol] || 100;
  }

  subscribeToMarketData(callback: MarketDataCallback): () => void {
    this.marketDataCallbacks.push(callback);
    
    // Send initial data
    const currentData = Array.from(this.marketData.values());
    if (currentData.length > 0) {
      callback(currentData);
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
    const basePrice = this.getBasePriceForSymbol(symbol);
    let currentPrice = basePrice;
    const now = Date.now();

    for (let i = 50; i >= 0; i--) {
      const timestamp = now - (i * 60 * 60 * 1000); // hourly data
      const open = currentPrice;
      const change = (Math.random() - 0.5) * 0.05;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.02);
      const low = Math.min(open, close) * (1 - Math.random() * 0.02);
      const volume = Math.random() * 1000000;

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
    const basePrice = this.getBasePriceForSymbol(symbol);
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate bids (buy orders)
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 - (i + 1) * 0.001);
      const quantity = Math.random() * 10;
      bids.push({
        price,
        quantity,
        total: price * quantity
      });
    }

    // Generate asks (sell orders)
    for (let i = 0; i < 10; i++) {
      const price = basePrice * (1 + (i + 1) * 0.001);
      const quantity = Math.random() * 10;
      asks.push({
        price,
        quantity,
        total: price * quantity
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
    
    this.isRealTimeActive = true;
    this.updateInterval = setInterval(() => {
      this.updateMarketData();
    }, 5000); // Update every 5 seconds
  }

  private async updateMarketData(): Promise<void> {
    try {
      const symbols = Array.from(this.marketData.keys());
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
}

export const marketDataService = new MarketDataService();
export type { MarketData, CandlestickData, OrderBook };
