
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
type Portfolio = Tables['portfolios']['Row'];
type Order = Tables['orders']['Row'];
type OrderInsert = Tables['orders']['Insert'];
type TradingBot = Tables['trading_bots']['Row'];

export class APIService {
  // Portfolio methods
  async getUserPortfolio(userId: string): Promise<Portfolio | null> {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .single();

    if (error) {
      console.error('Error fetching portfolio:', error);
      return null;
    }
    return data;
  }

  async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>) {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', portfolioId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Order methods
  async createOrder(orderData: OrderInsert) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserOrders(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async cancelOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Trading Bot methods
  async createTradingBot(botData: Omit<TradingBot, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('trading_bots')
      .insert(botData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserTradingBots(userId: string) {
    const { data, error } = await supabase
      .from('trading_bots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateTradingBot(botId: string, updates: Partial<TradingBot>) {
    const { data, error } = await supabase
      .from('trading_bots')
      .update(updates)
      .eq('id', botId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTradingBot(botId: string) {
    const { error } = await supabase
      .from('trading_bots')
      .delete()
      .eq('id', botId);

    if (error) throw error;
  }

  // Real-time subscriptions
  subscribeToPortfolioUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('portfolio-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'portfolios',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }

  subscribeToOrderUpdates(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('order-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  }
}

export const apiService = new APIService();
