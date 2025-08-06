
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Portfolio {
  id: string;
  name: string;
  mode: 'paper' | 'live';
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  current_balance: number;
  initial_balance: number;
  positions: any[];
  created_at: string;
  updated_at: string;
  user_id: string;
  is_default: boolean;
}

export const usePortfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    }
  }, [user]);

  const fetchPortfolio = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_default', true)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      if (data) {
        const transformedPortfolio: Portfolio = {
          id: data.id,
          name: data.name,
          mode: data.mode,
          total_value: data.total_value,
          total_pnl: data.total_pnl,
          total_pnl_percentage: data.total_pnl_percentage,
          current_balance: data.current_balance,
          initial_balance: data.initial_balance,
          positions: Array.isArray(data.positions) ? data.positions : [],
          created_at: data.created_at,
          updated_at: data.updated_at,
          user_id: data.user_id,
          is_default: data.is_default,
        };
        setPortfolio(transformedPortfolio);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  return { portfolio, loading, refetch: fetchPortfolio };
};
