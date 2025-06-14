
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DatabaseOrder = Database['public']['Tables']['orders']['Row'];
type DatabaseOrderInsert = Database['public']['Tables']['orders']['Insert'];

interface Order {
  id: string;
  user_id: string;
  portfolio_id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_loss';
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'partial';
  filled_quantity: number;
  average_fill_price: number;
  fees: number;
  created_at: string;
  filled_at?: string;
  cancelled_at?: string;
}

export const useOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database order to our local Order type
  const convertDatabaseOrder = (dbOrder: DatabaseOrder): Order => ({
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    portfolio_id: dbOrder.portfolio_id || '',
    symbol: dbOrder.symbol,
    side: dbOrder.side as 'buy' | 'sell',
    type: dbOrder.type as 'market' | 'limit' | 'stop_loss',
    quantity: Number(dbOrder.quantity),
    price: dbOrder.price ? Number(dbOrder.price) : undefined,
    status: dbOrder.status as 'pending' | 'filled' | 'cancelled' | 'partial',
    filled_quantity: Number(dbOrder.filled_quantity || 0),
    average_fill_price: Number(dbOrder.average_fill_price || 0),
    fees: Number(dbOrder.fees || 0),
    created_at: dbOrder.created_at || '',
    filled_at: dbOrder.filled_at || undefined,
    cancelled_at: dbOrder.cancelled_at || undefined,
  });

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserOrders(user.id);
        const convertedOrders = data.map(convertDatabaseOrder);
        setOrders(convertedOrders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Subscribe to order updates
    const subscription = apiService.subscribeToOrderUpdates(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newOrder = convertDatabaseOrder(payload.new);
        setOrders(prev => [newOrder, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedOrder = convertDatabaseOrder(payload.new);
        setOrders(prev => prev.map(order => 
          order.id === updatedOrder.id ? updatedOrder : order
        ));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'user_id' | 'filled_quantity' | 'average_fill_price' | 'fees' | 'filled_at' | 'cancelled_at'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const dbOrderData: DatabaseOrderInsert = {
        user_id: user.id,
        portfolio_id: orderData.portfolio_id,
        symbol: orderData.symbol,
        side: orderData.side,
        type: orderData.type,
        quantity: orderData.quantity,
        price: orderData.price,
        status: orderData.status,
        filled_quantity: 0,
        average_fill_price: 0,
        fees: 0,
        mode: 'paper',
        exchange: 'internal',
      };

      const order = await apiService.createOrder(dbOrderData);

      toast({
        title: "Order Placed",
        description: `${orderData.side.toUpperCase()} order for ${orderData.quantity} ${orderData.symbol} placed successfully`,
      });

      return order;
    } catch (err) {
      toast({
        title: "Order Failed",
        description: err instanceof Error ? err.message : 'Failed to place order',
        variant: "destructive"
      });
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await apiService.cancelOrder(orderId);
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully",
      });
    } catch (err) {
      toast({
        title: "Cancel Failed",
        description: err instanceof Error ? err.message : 'Failed to cancel order',
        variant: "destructive"
      });
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    createOrder,
    cancelOrder,
    refetch: async () => {
      if (user) {
        const data = await apiService.getUserOrders(user.id);
        const convertedOrders = data.map(convertDatabaseOrder);
        setOrders(convertedOrders);
      }
    }
  };
};
