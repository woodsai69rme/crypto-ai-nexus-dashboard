
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DatabasePortfolio = Database['public']['Tables']['portfolios']['Row'];

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

  // Convert database portfolio to our local Portfolio type
  const convertDatabasePortfolio = (dbPortfolio: DatabasePortfolio): Portfolio => ({
    id: dbPortfolio.id,
    user_id: dbPortfolio.user_id,
    name: dbPortfolio.name,
    mode: dbPortfolio.mode as 'paper' | 'live',
    initial_balance: Number(dbPortfolio.initial_balance || 0),
    current_balance: Number(dbPortfolio.current_balance || 0),
    total_value: Number(dbPortfolio.total_value || 0),
    total_pnl: Number(dbPortfolio.total_pnl || 0),
    total_pnl_percentage: Number(dbPortfolio.total_pnl_percentage || 0),
    positions: Array.isArray(dbPortfolio.positions) ? dbPortfolio.positions : [],
    created_at: dbPortfolio.created_at || '',
    updated_at: dbPortfolio.updated_at || '',
  });

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
        if (data) {
          const convertedPortfolio = convertDatabasePortfolio(data);
          setPortfolio(convertedPortfolio);
        }
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
        const updatedPortfolio = convertDatabasePortfolio(payload.new);
        setPortfolio(updatedPortfolio);
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
      const convertedPortfolio = convertDatabasePortfolio(updatedPortfolio);
      setPortfolio(convertedPortfolio);
      return convertedPortfolio;
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
    refetch: async () => {
      if (user) {
        const data = await apiService.getUserPortfolio(user.id);
        if (data) {
          const convertedPortfolio = convertDatabasePortfolio(data);
          setPortfolio(convertedPortfolio);
        }
      }
    }
  };
};
