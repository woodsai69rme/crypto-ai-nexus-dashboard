
interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  high24h: number;
  low24h: number;
  lastUpdated: number;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  lastUpdated: number;
}

interface CandlestickData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class MarketDataService {
  private subscribers: Set<(data: MarketData[]) => void> = new Set();
  private orderBookSubscribers: Map<string, Set<(data: OrderBook) => void>> = new Map();
  private chartSubscribers: Map<string, Set<(data: CandlestickData[]) => void>> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Simulated market data for Australian crypto pairs
  private marketData: Map<string, MarketData> = new Map();

  constructor() {
    this.initializeMarketData();
    this.startRealTimeUpdates();
  }

  private initializeMarketData() {
    const symbols = [
      'BTC-AUD', 'ETH-AUD', 'SOL-AUD', 'ADA-AUD', 'DOT-AUD', 
      'LINK-AUD', 'MATIC-AUD', 'AVAX-AUD', 'ALGO-AUD', 'ATOM-AUD',
      'FTM-AUD', 'NEAR-AUD', 'ICP-AUD', 'APT-AUD', 'ARB-AUD'
    ];

    symbols.forEach(symbol => {
      const basePrice = this.getBasePriceForSymbol(symbol);
      this.marketData.set(symbol, {
        symbol,
        price: basePrice,
        change24h: (Math.random() - 0.5) * basePrice * 0.1,
        changePercent24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000000,
        marketCap: Math.random() * 100000000000,
        high24h: basePrice * (1 + Math.random() * 0.05),
        low24h: basePrice * (1 - Math.random() * 0.05),
        lastUpdated: Date.now()
      });
    });
  }

  private getBasePriceForSymbol(symbol: string): number {
    const basePrices: { [key: string]: number } = {
      'BTC-AUD': 67500,
      'ETH-AUD': 3800,
      'SOL-AUD': 145,
      'ADA-AUD': 0.65,
      'DOT-AUD': 8.5,
      'LINK-AUD': 18.5,
      'MATIC-AUD': 1.25,
      'AVAX-AUD': 45,
      'ALGO-AUD': 0.28,
      'ATOM-AUD': 12.5,
      'FTM-AUD': 0.85,
      'NEAR-AUD': 5.2,
      'ICP-AUD': 8.8,
      'APT-AUD': 12.5,
      'ARB-AUD': 1.85
    };
    return basePrices[symbol] || 100;
  }

  private startRealTimeUpdates() {
    // Simulate real-time price updates every 2 seconds
    setInterval(() => {
      this.updatePrices();
      this.notifySubscribers();
    }, 2000);

    // Update order books more frequently
    setInterval(() => {
      this.updateOrderBooks();
    }, 1000);

    // Generate new candlestick data
    setInterval(() => {
      this.updateCandlestickData();
    }, 60000); // Every minute
  }

  private updatePrices() {
    this.marketData.forEach((data, symbol) => {
      // Simulate realistic price movements
      const volatility = this.getVolatilityForSymbol(symbol);
      const change = (Math.random() - 0.5) * volatility * data.price;
      const newPrice = Math.max(0.01, data.price + change);
      
      const change24h = newPrice - (data.price - data.change24h);
      const changePercent24h = ((change24h / (newPrice - change24h)) * 100);

      this.marketData.set(symbol, {
        ...data,
        price: newPrice,
        change24h,
        changePercent24h,
        high24h: Math.max(data.high24h, newPrice),
        low24h: Math.min(data.low24h, newPrice),
        lastUpdated: Date.now()
      });
    });
  }

  private getVolatilityForSymbol(symbol: string): number {
    // Different volatilities for different assets
    const volatilities: { [key: string]: number } = {
      'BTC-AUD': 0.02,
      'ETH-AUD': 0.025,
      'SOL-AUD': 0.04,
      'ADA-AUD': 0.035,
      'DOT-AUD': 0.03,
      'ALGO-AUD': 0.05
    };
    return volatilities[symbol] || 0.03;
  }

  private updateOrderBooks() {
    this.orderBookSubscribers.forEach((subscribers, symbol) => {
      const data = this.marketData.get(symbol);
      if (!data) return;

      const orderBook = this.generateOrderBook(data.price);
      subscribers.forEach(callback => callback(orderBook));
    });
  }

  private generateOrderBook(currentPrice: number): OrderBook {
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate bids (buy orders) below current price
    for (let i = 0; i < 15; i++) {
      const price = currentPrice * (1 - (i + 1) * 0.001);
      const quantity = Math.random() * 10 + 0.1;
      bids.push({
        price: parseFloat(price.toFixed(2)),
        quantity: parseFloat(quantity.toFixed(6)),
        total: parseFloat((price * quantity).toFixed(2))
      });
    }

    // Generate asks (sell orders) above current price
    for (let i = 0; i < 15; i++) {
      const price = currentPrice * (1 + (i + 1) * 0.001);
      const quantity = Math.random() * 10 + 0.1;
      asks.push({
        price: parseFloat(price.toFixed(2)),
        quantity: parseFloat(quantity.toFixed(6)),
        total: parseFloat((price * quantity).toFixed(2))
      });
    }

    return {
      bids: bids.sort((a, b) => b.price - a.price), // Highest bid first
      asks: asks.sort((a, b) => a.price - b.price), // Lowest ask first
      lastUpdated: Date.now()
    };
  }

  private updateCandlestickData() {
    this.chartSubscribers.forEach((subscribers, symbol) => {
      const data = this.marketData.get(symbol);
      if (!data) return;

      const candlestick = this.generateCandlestick(data);
      subscribers.forEach(callback => {
        // In a real implementation, you'd maintain historical data
        const historicalData = this.generateHistoricalData(symbol, 100);
        historicalData.push(candlestick);
        callback(historicalData);
      });
    });
  }

  private generateCandlestick(data: MarketData): CandlestickData {
    const open = data.price * (1 + (Math.random() - 0.5) * 0.01);
    const close = data.price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.005);
    const low = Math.min(open, close) * (1 - Math.random() * 0.005);
    const volume = Math.random() * 1000000;

    return {
      timestamp: Date.now(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(volume)
    };
  }

  private generateHistoricalData(symbol: string, count: number): CandlestickData[] {
    const data: CandlestickData[] = [];
    const currentPrice = this.marketData.get(symbol)?.price || 100;
    let price = currentPrice * 0.9; // Start 10% lower

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() - (count - i) * 60000; // 1 minute intervals
      const open = price;
      const change = (Math.random() - 0.5) * price * 0.02;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000;

      data.push({
        timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(volume)
      });

      price = close; // Next candle starts where this one ended
    }

    return data;
  }

  private notifySubscribers() {
    const allData = Array.from(this.marketData.values());
    this.subscribers.forEach(callback => callback(allData));
  }

  // Public API methods
  public getMarketData(): MarketData[] {
    return Array.from(this.marketData.values());
  }

  public getSymbolData(symbol: string): MarketData | undefined {
    return this.marketData.get(symbol);
  }

  public subscribeToMarketData(callback: (data: MarketData[]) => void): () => void {
    this.subscribers.add(callback);
    
    // Immediately send current data
    callback(this.getMarketData());

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public subscribeToOrderBook(symbol: string, callback: (data: OrderBook) => void): () => void {
    if (!this.orderBookSubscribers.has(symbol)) {
      this.orderBookSubscribers.set(symbol, new Set());
    }
    
    const subscribers = this.orderBookSubscribers.get(symbol)!;
    subscribers.add(callback);

    // Immediately send current order book
    const marketData = this.marketData.get(symbol);
    if (marketData) {
      callback(this.generateOrderBook(marketData.price));
    }

    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.orderBookSubscribers.delete(symbol);
      }
    };
  }

  public subscribeToChartData(symbol: string, callback: (data: CandlestickData[]) => void): () => void {
    if (!this.chartSubscribers.has(symbol)) {
      this.chartSubscribers.set(symbol, new Set());
    }

    const subscribers = this.chartSubscribers.get(symbol)!;
    subscribers.add(callback);

    // Immediately send historical data
    const historicalData = this.generateHistoricalData(symbol, 100);
    callback(historicalData);

    return () => {
      subscribers.delete(callback);
      if (subscribers.size === 0) {
        this.chartSubscribers.delete(symbol);
      }
    };
  }

  public getTopGainers(limit: number = 10): MarketData[] {
    return Array.from(this.marketData.values())
      .sort((a, b) => b.changePercent24h - a.changePercent24h)
      .slice(0, limit);
  }

  public getTopLosers(limit: number = 10): MarketData[] {
    return Array.from(this.marketData.values())
      .sort((a, b) => a.changePercent24h - b.changePercent24h)
      .slice(0, limit);
  }

  public getTopVolume(limit: number = 10): MarketData[] {
    return Array.from(this.marketData.values())
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, limit);
  }

  public async searchSymbols(query: string): Promise<MarketData[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.marketData.values())
      .filter(data => 
        data.symbol.toLowerCase().includes(lowercaseQuery) ||
        data.symbol.replace('-AUD', '').toLowerCase().includes(lowercaseQuery)
      );
  }

  public formatPrice(price: number, currency: string = 'AUD'): string {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(price);
  }

  public formatChange(change: number, isPercent: boolean = false): string {
    const formatted = isPercent 
      ? `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`
      : new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          signDisplay: 'always'
        }).format(change);
    
    return formatted;
  }

  public formatVolume(volume: number): string {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }
}

export const marketDataService = new MarketDataService();
export type { MarketData, OrderBook, OrderBookEntry, CandlestickData };
