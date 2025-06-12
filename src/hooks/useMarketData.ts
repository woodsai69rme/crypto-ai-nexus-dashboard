
import { useState, useEffect, useCallback } from 'react';
import { marketDataService, type MarketData } from '@/services/marketDataService';

interface UseMarketDataReturn {
  marketData: MarketData[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export const useMarketData = (symbols?: string[]): UseMarketDataReturn => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await marketDataService.getMarketData(symbols);
      setMarketData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    refreshData();

    const unsubscribe = marketDataService.subscribeToMarketData((data) => {
      setMarketData(data);
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshData]);

  return { marketData, loading, error, refreshData };
};
