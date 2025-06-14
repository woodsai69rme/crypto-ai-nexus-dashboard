
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiService } from '@/services/apiService';
import { useToast } from '@/hooks/use-toast';

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
        setOrders(data);
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
        setOrders(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setOrders(prev => prev.map(order => 
          order.id === payload.new.id ? payload.new : order
        ));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'filled_quantity' | 'average_fill_price' | 'fees'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const order = await apiService.createOrder({
        ...orderData,
        user_id: user.id,
        filled_quantity: 0,
        average_fill_price: 0,
        fees: 0
      });

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
    refetch: () => {
      if (user) {
        apiService.getUserOrders(user.id).then(setOrders);
      }
    }
  };
};
