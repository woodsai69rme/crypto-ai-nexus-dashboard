
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useOrders } from '@/hooks/useOrders';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';
import { X } from 'lucide-react';

export const OrderHistory = () => {
  const { orders, loading, cancelOrder } = useOrders();

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="md" className="mr-3" />
            <span className="text-white">Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-emerald-500/20 text-emerald-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'partial': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 2,
      maximumFractionDigits: price < 1 ? 6 : 2
    }).format(price);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Order History</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-slate-700/30 rounded-lg border border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <span className="font-medium text-white">
                      {order.side.toUpperCase()} {order.symbol}
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelOrder(order.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Type:</span>
                    <span className="text-white ml-2">{order.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Quantity:</span>
                    <span className="text-white ml-2">{order.quantity}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Price:</span>
                    <span className="text-white ml-2">
                      {order.price ? formatPrice(order.price) : 'Market'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Filled:</span>
                    <span className="text-white ml-2">{order.filled_quantity}</span>
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-slate-400">
                  Created {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                  {order.filled_at && (
                    <span className="ml-4">
                      Filled {formatDistanceToNow(new Date(order.filled_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
