
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  mode: 'paper' | 'live';
  initial_balance: number;
  current_balance: number;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  positions: any[];
  created_at: string;
  updated_at: string;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPortfolio(null);
      setLoading(false);
      return;
    }

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserPortfolio(user.id);
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio');
        toast({
          title: "Portfolio Error",
          description: "Failed to load portfolio data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();

    // Subscribe to portfolio updates
    const subscription = apiService.subscribeToPortfolioUpdates(user.id, (payload) => {
      if (payload.eventType === 'UPDATE' && payload.new) {
        setPortfolio(payload.new);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user, toast]);

  const updatePortfolio = async (updates: Partial<Portfolio>) => {
    if (!portfolio) return;

    try {
      const updatedPortfolio = await apiService.updatePortfolio(portfolio.id, updates);
      setPortfolio(updatedPortfolio);
      return updatedPortfolio;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update portfolio');
      toast({
        title: "Update Error",
        description: "Failed to update portfolio",
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    portfolio,
    loading,
    error,
    updatePortfolio,
    refetch: () => {
      if (user) {
        apiService.getUserPortfolio(user.id).then(setPortfolio);
      }
    }
  };
};
