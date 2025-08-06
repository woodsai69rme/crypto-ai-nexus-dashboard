
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  symbol: string;
  side: string;
  type: string;
  amount: number;
  quantity: number;
  price: number;
  status: string;
  filled_quantity: number;
  filled_at: string | null;
  created_at: string;
}

interface CreateOrderParams {
  portfolio_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_loss';
  quantity: number;
  price?: number;
  status: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('paper_trades')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const transformedOrders: Order[] = (data || []).map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        type: trade.type || 'market',
        amount: trade.amount,
        quantity: trade.quantity || trade.amount,
        price: trade.price,
        status: trade.status,
        filled_quantity: trade.filled_quantity || 0,
        filled_at: trade.filled_at,
        created_at: trade.created_at,
      }));
      
      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (params: CreateOrderParams) => {
    try {
      const { data, error } = await supabase
        .from('paper_trades')
        .insert([{
          user_id: user?.id,
          portfolio_id: params.portfolio_id,
          symbol: params.symbol,
          side: params.side,
          type: params.type,
          amount: params.quantity,
          quantity: params.quantity,
          price: params.price,
          status: params.status,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Order Placed",
        description: `${params.side.toUpperCase()} order for ${params.quantity} ${params.symbol} has been placed.`,
      });

      // Refresh orders
      await fetchOrders();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
      throw error;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('paper_trades')
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Order Cancelled",
        description: "Order has been successfully cancelled.",
      });

      // Refresh orders
      await fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      });
    }
  };

  return { orders, loading, refetch: fetchOrders, createOrder, cancelOrder };
};
